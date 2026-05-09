import json
import locale

import os
import re
import sys
import time
import pyuac
import psutil
import signal
import socket
import random
import asyncio
import argparse
import requests
import threading
import webbrowser
import subprocess
import pycountry
from pymobiledevice3.remote.tunnel_service import (
    create_core_device_tunnel_service_using_rsd,
    create_core_device_tunnel_service_using_remotepairing,
    get_remote_pairing_tunnel_services,
    get_core_device_tunnel_services,
    start_tunnel,
    start_tunnel_over_core_device,   # ← 新增
    CoreDeviceTunnelProxy,
    TunnelProtocol,
)
from flask import Flask, jsonify, render_template, request, send_from_directory
from urllib3.exceptions import InsecureRequestWarning, ConnectionError
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)
from contextlib import asynccontextmanager

from pymobiledevice3.usbmux import list_devices
from pymobiledevice3.cli.mounter import auto_mount
from pymobiledevice3.lockdown import create_using_usbmux, create_using_tcp, get_mobdev2_lockdowns
from pymobiledevice3.services.amfi import AmfiService
from pymobiledevice3.exceptions import DeviceHasPasscodeSetError, NoDeviceConnectedError
from pymobiledevice3.services.dvt.dvt_secure_socket_proxy import DvtSecureSocketProxyService
from pymobiledevice3.services.dvt.instruments.location_simulation import LocationSimulation
from pymobiledevice3.remote.remote_service_discovery import RemoteServiceDiscoveryService
from pymobiledevice3.remote.utils import stop_remoted_if_required, resume_remoted_if_required, get_rsds
# from pymobiledevice3.remote.tunnel_service import create_core_device_tunnel_service_using_rsd, get_remote_pairing_tunnel_services, start_tunnel, create_core_device_tunnel_service_using_remotepairing, get_core_device_tunnel_services, CoreDeviceTunnelProxy
#from pymobiledevice3.cli.remote import install_driver_if_required
from pymobiledevice3.osu.os_utils import get_os_utils
from pymobiledevice3.bonjour import DEFAULT_BONJOUR_TIMEOUT, browse_mobdev2
from pymobiledevice3.pair_records import get_local_pairing_record, get_remote_pairing_record_filename, get_preferred_pair_record
from pymobiledevice3.common import get_home_folder
# from pymobiledevice3.cli.remote import cli_install_wetest_drivers

from pymobiledevice3.cli.remote import tunnel_task
from pymobiledevice3.lockdown import LockdownClient
from pymobiledevice3.lockdown_service_provider import LockdownServiceProvider
from pymobiledevice3.remote.common import TunnelProtocol

#========= Arg Parser ========
# Parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument('--no-browser', action='store_true', help='Skip auto opening the browser')
parser.add_argument('--port', type=int, help='Specify port number to listen on for web browser requests')
parser.add_argument('--wifihost', type=str, help='Specify the wifi IP address to connect to')
parser.add_argument('--udid', type=str, help='Specify the device udid to target')
args = parser.parse_args()
#========= Arg Parser ========

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
OSUTILS = get_os_utils()


import logging


# Get or create a logger instance named "GeoPort"
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logging.getLogger("asyncio").setLevel(logging.WARNING)

# Create a logger named "GeoPort"
logger = logging.getLogger("GeoPort")
logging.getLogger("urllib3").setLevel(logging.WARNING)

logging.getLogger('werkzeug').disabled = True
#log.disabled = True

if getattr(sys, 'frozen', False):
    base_directory = sys._MEIPASS
    executable_dir = os.path.dirname(sys.executable)
else:
    base_directory = os.path.abspath(os.path.dirname(__file__))
    executable_dir = base_directory

app = Flask(__name__, template_folder=os.path.join(base_directory, 'templates'), static_folder=os.path.join(base_directory, 'static'))

# Define constants
# Get the home directory of the current user
home_dir = os.path.expanduser("~")
is_windows = sys.platform == 'win32'
flask_port = 54321
user_locale = None
# location = "23.10416999628627 120.35137049956495"
location = "23.97565 120.9738819"
rsd_data = None
rsd_host = None
rsd_port = None
rsd_data_map = {}
wifi_address = None
wifihost = args.wifihost
wifi_port = None
connection_type = None
udid = None
lockdown = None
ios_version = None
pair_record = None
error_message = None
sudo_message = ""
captured_output = None

terminate_tunnel_thread = False
terminate_location_thread = False
location_threads = []
timeout = DEFAULT_BONJOUR_TIMEOUT

# Get the current platform using sys.platform
current_platform = sys.platform

# Map the platform names to standard values
platform = {
    'win32': 'Windows',
    'linux': 'Linux',
    'darwin': 'MacOS',
}.get(current_platform, 'Unknown')

# Check if running as sudo
if current_platform == "darwin":
    if os.geteuid() != 0:
        logger.error("*********************** WARNING ***********************")
        logger.error("Not running as Sudo, this probably isn't going to work")
        logger.error("*********************** WARNING ***********************")
        sudo_message = "Not running as Sudo, this probably isn't going to work"
    else:
        logger.info("Running as Sudo")
# Load config from config.json beside the executable!
config_path = os.path.join(executable_dir, 'config.json')
if not os.path.exists(config_path):
    # Fallback in case not found
    config_path = 'config.json'

try:
    with open(config_path, 'r') as f:
        config = json.load(f)
        google_maps_api_key = config.get('google_maps_api_key', '')
except Exception as e:
    logger.error(f"Error loading config.json: {e}")
    google_maps_api_key = ''




def create_geoport_folder():
    # Define the path to the GeoPort folder
    geoport_folder = os.path.join(home_dir, 'GeoPort')

    # Check if the GeoPort folder exists, create it if not
    if not os.path.exists(geoport_folder):
        os.makedirs(geoport_folder)
        logger.info(f"GeoPort Home: {geoport_folder}")
        logger.info("GeoPort folder created successfully")

    # Set permissions for the GeoPort folder
    if current_platform == 'win32':
        # Windows permissions (read/write for everyone)
        os.system(f"icacls {geoport_folder} /grant Everyone:(OI)(CI)F")
        logger.info("Permissions set for GeoPort folder on Windows")
    else:  # Linux and MacOS
        # POSIX permissions (read/write for everyone)
        os.chmod(geoport_folder, 0o777)
        logger.info("Permissions set for GeoPort folder on MacOS")



# Define the function to be executed in the thread
def run_tunnel(service_provider):

    try:
        asyncio.run(start_quic_tunnel(service_provider))

        logger.info("run_tun completed")
        sys.exit(0)

    except Exception as e:
        error_message = str(e)

        # Handle the exception, such as logging it or returning an error response
        with app.app_context():
            return jsonify({'error': error_message})

    #return

# Define a function to start the tunnel thread
def start_tunnel_thread(service_provider):
    global terminate_tunnel_thread  # Declare the global variable
    terminate_tunnel_thread = False  # Set the value of the global variable
    thread = threading.Thread(target=run_tunnel, args=(service_provider,))
    thread.start()
    return

async def start_quic_tunnel(service_provider: RemoteServiceDiscoveryService) -> None:
    logger.warning("Start USB QUIC tunnel")
    global terminate_tunnel_thread, rsd_port, rsd_host
    
    # Capture current device context to handle retries correctly
    curr_udid = udid
    curr_conn_type = connection_type

    max_retries = 10
    retry_count = 0

    while retry_count < max_retries:
        try:
            if terminate_tunnel_thread:
                return

            stop_remoted_if_required()
            service = await create_core_device_tunnel_service_using_rsd(service_provider, autopair=True)

            async with service.start_quic_tunnel() as tunnel_result:
                resume_remoted_if_required()
                logger.info(f"QUIC Address: {tunnel_result.address}")
                logger.info(f"QUIC Port: {tunnel_result.port}")
                
                rsd_host = tunnel_result.address
                rsd_port = str(tunnel_result.port)
                
                # Reset reconnect status on success
                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                retry_count = 0 

                while not terminate_tunnel_thread:
                    await asyncio.sleep(.5)
                return

        except Exception as e:
            retry_count += 1
            logger.error(f"QUIC Tunnel Error (Attempt {retry_count}/{max_retries}): {e}")
            rsd_host = None
            rsd_port = None
            
            if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = True
            
            if retry_count >= max_retries:
                logger.error("Max retries reached for QUIC tunnel. Giving up.")
                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                return
            
            await asyncio.sleep(2)


# Define the function to be executed in the thread
def run_tcp_tunnel(service_provider):

    try:
        asyncio.run(start_tcp_tunnel(service_provider))

        logger.info("run_tun completed")
        sys.exit(0)

    except Exception as e:
        error_message = str(e)

        # Handle the exception, such as logging it or returning an error response
        with app.app_context():
            return jsonify({'error': error_message})

    #return

# Define a function to start the tunnel thread
def start_tcp_tunnel_thread(service_provider):
    global terminate_tunnel_thread  # Declare the global variable
    terminate_tunnel_thread = False  # Set the value of the global variable
    thread = threading.Thread(target=run_tcp_tunnel, args=(service_provider,))
    thread.start()
    return

async def start_tcp_tunnel(service_provider) -> None:
    logger.warning("Start USB TCP tunnel")
    global terminate_tunnel_thread, rsd_port, rsd_host

    # Capture current device context to handle retries correctly
    curr_udid = udid
    curr_conn_type = connection_type

    max_retries = 10
    retry_count = 0

    while retry_count < max_retries:
        try:
            if terminate_tunnel_thread:
                return

            stop_remoted_if_required()
            lockdown = await create_using_usbmux(udid, autopair=True)
            service = await CoreDeviceTunnelProxy.create(lockdown)

            async with service.start_tcp_tunnel() as tunnel_result:
                resume_remoted_if_required()
                rsd_host = tunnel_result.address
                rsd_port = str(tunnel_result.port)
                logger.info(f"TCP Address: {rsd_host}")
                logger.info(f"TCP Port: {rsd_port}")

                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                retry_count = 0

                while not terminate_tunnel_thread:
                    await asyncio.sleep(.5)
                return

        except Exception as e:
            retry_count += 1
            logger.error(f"TCP Tunnel Error (Attempt {retry_count}/{max_retries}): {e}")
            rsd_host = None
            rsd_port = None
            
            if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = True
                
            if retry_count >= max_retries:
                logger.error("Max retries reached for TCP tunnel. Giving up.")
                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                return
            
            await asyncio.sleep(2)




def is_major_version_17_or_greater(version_string):
    # Check if the major version in the given version string is 17 or greater.
    try:
        major_version = int(version_string.split('.')[0])
        return major_version >= 17
    except (ValueError, IndexError):
        # Handle invalid version string or missing major version
        return False

def is_major_version_less_than_16(version_string):
    # Check if the major version in the given version string is 17 or greater.
    try:
        major_version = int(version_string.split('.')[0])
        return major_version < 16
    except (ValueError, IndexError):
        # Handle invalid version string or missing major version
        logger.error(f"Error: {ValueError}, {IndexError}")
        return False


def version_check(version_string):
    try:
        # Split the version string into major and minor version parts
        version_parts = version_string.split('.')

        # Extract the major and minor version parts
        major_version = int(version_parts[0])
        minor_version = int(version_parts[1]) if len(version_parts) > 1 else 0

        # Check if the version string satisfies the condition
        if major_version == 17 and 0 <= minor_version <= 3:
            if sys.platform == 'win32':
                logger.info("Checking Windows Driver requirement")
                logger.info("Driver is required")
            return True
        else:
            if sys.platform == 'win32':
                logger.info("Driver is not required")
                return False
            logger.info("MacOS - pass")
            return False



    except (ValueError, IndexError) as e:
        logger.error(f"Driver check error: {e}")
        # Handle invalid version string or missing major/minor version
        return False

def get_user_country():
    global user_locale
    try:
        # Attempt to get the user's country using locale and pycountry
        user_locale, _ = locale.getlocale()

        if user_locale is None:
            logger.warning("User locale is None. Defaulting to IP geolocation service.")
            return get_country_from_ip()

        country_code = user_locale.split('_')[-1]
        country = pycountry.countries.get(alpha_2=country_code)
        country_name = country.name if country else None

        # If country_name is None, try IP geolocation service as a fallback
        if country_name is None:
            logger.warning("Failed to retrieve country name using locale. Using IP geolocation service.")
            return get_country_from_ip()
        else:
            return country_name

    except Exception as e:
        logger.error(f"Error getting user country: {e}")
        return None


def get_country_from_ip():
    try:
        response = requests.get("http://ip-api.com/json/")
        if response.status_code == 200:
            data = response.json()
            country_name = data.get("country")
            if country_name:
                return country_name
            else:
                logger.warning("Failed to retrieve country name from IP geolocation service.")
        else:
            logger.error(f"Error: Unable to retrieve data. Status code: {response.status_code}")
            logger.warning("Setting to default country")
            country_name = "Spain"
        return country_name
    except Exception as e:
        logger.error(f"Error getting country from IP geolocation service: {e}")
        country_name = "Spain"
        return country_name
def get_devices_with_retry(max_attempts=10):
    if sys.platform == 'win32':
        logger.info(f"iOS Version: {ios_version}")
        if version_check(ios_version):
            logger.info("Windows Driver Install Required")
            # cli_install_wetest_drivers()
    for attempt in range(1, max_attempts + 1):
        try:
            devices = asyncio.run(get_rsds(timeout))
            #dev1 = asyncio.run(get_rsds(timeout))
            #devices = asyncio.run(get_core_device_tunnel_services(timeout))
            #print("devices: ", devices)
            #print("dev1: ", dev1)
            if devices:
                return devices  # Return devices if the list is not empty
            else:
                logger.warning(f"Attempt {attempt}: No devices found")
        except Exception as e:
            logger.warning(f"Attempt {attempt}: Error occurred - {e}")
        time.sleep(1)  # Add a delay between attempts if needed
    raise RuntimeError("No devices found after multiple attempts.\n Ensure you are running GeoPort as sudo / Administrator \n Please see the FAQ: https://github.com/davesc63/GeoPort/blob/main/FAQ.md \n If you still have the error please raise an issue on github: https://github.com/davesc63/GeoPort/issues ")


def get_wifi_with_retry(max_attempts=10):
    global udid, wifi_address, wifi_port

    for attempt in range(1, max_attempts + 1):
        try:
            logger.info("Discovering Wifi Devices - This may take a while...")
            devices = asyncio.run(get_remote_pairing_tunnel_services(timeout))
            #devices = get_remote_pairing_tunnel_services(timeout)



            if devices:
                if udid:
                    for device in devices:
                        if device.remote_identifier == udid:
                            logger.info(f"Device found with udid: {udid}.")
                            wifi_address = device.hostname
                            wifi_port = device.port
                            return device
                else:
                    return devices
            else:
                logger.warning(f"Attempt {attempt}: No devices found")
        except Exception as e:
            logger.warning(f"Attempt {attempt}: Error occurred - {e}")

        # Add a delay between attempts
        time.sleep(1)

    raise RuntimeError("No devices found after multiple attempts. Please see the FAQ.")
@app.route('/stop_tunnel', methods=['POST'])
def stop_tunnel_thread():
    global terminate_tunnel_thread, rsd_data_map
    logger.info("stop tunnel thread")
    # Set the terminate flag to True to stop the thread
    terminate_tunnel_thread = True
    rsd_data_map = {}
    return jsonify("Tunnel stopped")

@app.route('/disconnect_device_single', methods=['POST'])
def disconnect_device_single():
    global rsd_data_map, terminate_tunnel_thread
    data = request.get_json()
    udid = data.get('udid')
    conn_type = data.get('connType')

    logger.info(f"Disconnecting {udid} - {conn_type}")

    # Standardize UI presentation names back to internal keys
    if conn_type in ["Wifi", "Manual Wifi"]:
        conn_type = "Network"

    if udid in rsd_data_map:
        if conn_type in rsd_data_map[udid]:
            del rsd_data_map[udid][conn_type]
        else:
            logger.warning(f"Connection type {conn_type} not found for {udid}. Clearing all connections to prevent stuck state.")
            del rsd_data_map[udid]

        if udid in rsd_data_map and not rsd_data_map[udid]:
            del rsd_data_map[udid]

    if not rsd_data_map:
        terminate_tunnel_thread = True
        logger.info("All devices disconnected. Tunnel thread marked for termination.")

    return jsonify({"success": True})

@app.route('/update_location', methods=['POST'])
def update_location():
    # Use 'request' to get the JSON data from the client
    data = request.get_json()

    # Convert latitude and longitude to float values
    lat = float(data['lat'])
    lng = float(data['lng'])

    global location
    location = f"{lat} {lng}"
    return 'Location updated successfully'


@app.route('/connection_status', methods=['GET'])
def connection_status():
    """Return whether the backend currently has an active device connection or is reconnecting."""
    active = bool(rsd_data_map)
    count = 0
    reconnecting_udids = []
    connected_map = {}
    
    for udid, connections in rsd_data_map.items():
        is_udid_reconnecting = False
        connected_map[udid] = list(connections.keys())
        for conn_type, info in connections.items():
            count += 1
            if info.get('is_reconnecting'):
                is_udid_reconnecting = True
        if is_udid_reconnecting:
            reconnecting_udids.append(udid)
            
    return jsonify({
        'connected': active, 
        'count': count, 
        'connected_udids': list(rsd_data_map.keys()),
        'connected_map': connected_map,
        'reconnecting_udids': reconnecting_udids
    })

@app.route('/api/reverse-geocode', methods=['GET'])
def reverse_geocode():
    """Proxy for Nominatim reverse geocoding to solve CORS issues."""
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Missing coordinates'}), 400
    
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=14&addressdetails=1"
        # Nominatim requires a descriptive User-Agent
        headers = {
            'User-Agent': 'GeoPort/1.0 (Location Simulation Tool; https://github.com/weiyo176/LocationSimulator)',
            'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
        }
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        logger.error(f"Geocoding Proxy Error: {e}")
        return jsonify({'error': str(e)}), 500

# Global Timezone Cache
timezone_cache = {}

@app.route('/api/get-timezone', methods=['GET'])
def get_timezone():
    """Proxy for timezone lookups with caching and multi-tier backup."""
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Missing coordinates'}), 400

    # 1. Server-side caching (rounded for region matching)
    cache_key = f"{round(float(lat), 3)}_{round(float(lon), 3)}"
    if cache_key in timezone_cache:
        return jsonify(timezone_cache[cache_key])

    # 2. Sequential API attempts
    success_data = None
    
    # Tier A: BigDataCloud (Very fast and stable, now with fixed parsing)
    try:
        url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat}&longitude={lon}&localityLanguage=en"
        resp = requests.get(url, timeout=4)
        if resp.ok:
            data = resp.json()
            # Try primary field
            tz_id = data.get("timeZone", {}).get("id")
            # Try secondary field (Informative locality info) - common in free tier
            if not tz_id:
                for info in data.get("localityInfo", {}).get("informative", []):
                    if info.get("description") == "time zone":
                        tz_id = info.get("name")
                        break
            
            if tz_id:
                success_data = {"timeZone": tz_id, "isEstimate": False}
    except Exception:
        pass

    # Tier B: TimeAPI (Comprehensive, but sometimes slow)
    if not success_data:
        try:
            url = f"https://timeapi.io/api/Time/current/coordinate?latitude={lat}&longitude={lon}"
            resp = requests.get(url, timeout=6) # Increased timeout for slow paths
            if resp.ok:
                data = resp.json()
                if data.get("timeZone"):
                    success_data = {"timeZone": data.get("timeZone"), "isEstimate": False}
        except Exception:
            pass

    # Finalize and Cache
    if success_data:
        # Cache the result before returning
        if len(timezone_cache) > 200: # Limit cache size
            timezone_cache.clear()
        timezone_cache[cache_key] = success_data
        return jsonify(success_data)

    # Fallback: Manual longitude-based calculation (Estimate)
    try:
        offset = round(float(lon) / 15.0)
        return jsonify({
            "timeZone": None,
            "offset": offset,
            "isEstimate": True
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def check_pair_record(udid):
    global pair_record
    logger.info(f"Connection Type: {connection_type}")
    logger.info("Enable Developer Mode")

    home = get_home_folder()
    logger.info(f"Pair Record Home: {home}")

    filename = get_remote_pairing_record_filename(udid)
    logger.info(f"Pair Record File: {filename}")

    # pair_record = get_local_pairing_record(filename, home)
    pair_record = asyncio.run(get_preferred_pair_record(udid, home))
    #logger.info(f"Pair Record: {pair_record}")
    return pair_record

async def _get_developer_mode_status(udid, connection_type):
    lockdown = asyncio.run(create_using_usbmux(udid, connection_type=connection_type, autopair=True))
    return await lockdown.developer_mode_status

def check_developer_mode(udid, connection_type):
    logger.warning("Developer mode check skipped - assuming enabled")
    return True




def enable_developer_mode(udid, connection_type):
    check_pair_record(udid)


    logger.info(f"Connection Type: {connection_type}")
    logger.info("Enable Developer Mode")

    home = get_home_folder()
    logger.info(f"Pair Record Home: {home}")
    #
    # filename = get_remote_pairing_record_filename(udid)
    # logger.info(f"Pair Record File: {filename}")
    #
    # pair_record = get_local_pairing_record(filename, home)
    # logger.info(f"Pair Record: {pair_record}")
    if connection_type == "Network":
        if pair_record is None:
            logger.error("Network: No Pair Record Found. Please use a USB cable first to create a pair record")
            return False, "No Pair Record Found. Please use a USB cable first to create a pair record"
    else:
        logger.error("No Pair Record Found. USB cable detected. Creating a pair record")
        pass
        #return False, "No Pair Record Found. Please use a USB cable first to create a pair record"

    lockdown = create_using_usbmux(
        udid,
        connection_type=connection_type,
        autopair=True,
        pairing_records_cache_folder=home)


    try:

        AmfiService(lockdown).enable_developer_mode()
        logger.info("Enable complete, mount developer image...")
        mount_developer_image()

    except DeviceHasPasscodeSetError:
        error_message = "Error: Device has a passcode set\n \n Please temporarily remove the passcode and run GeoPort again to enable Developer Mode \n \n Go to \"Settings - Face ID & Passcode\"\n"
        logger.error(f"{error_message}")
        return False, error_message

    # except Exception as e:  # Catch any other exception
    #     logger.error(f"An error occurred: {str(e)}")
    #     return False, f"An error occurred: {str(e)}"

    return True, None




@app.route('/enable_developer_mode', methods=['POST'])
def enable_developer_mode_route():
    try:
        global udid
        data = request.get_json()

        # Extract the udid from the request
        udid = data.get('udid', None)

        success, error_message = enable_developer_mode(udid, connection_type)

        if success:
            # Return a success response with any additional data needed
            return jsonify({'success': True, 'udid': udid})
        else:
            return jsonify({'error': error_message})

    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message})



connect_device_lock = threading.Lock()

def with_connect_lock(func):
    from functools import wraps
    @wraps(func)
    def wrapper(*args, **kwargs):
        with connect_device_lock:
            return func(*args, **kwargs)
    return wrapper

@app.route('/connect_device', methods=['POST'])
@with_connect_lock
def connect_device():
    global udid, connection_type, ios_version, rsd_data, rsd_host, rsd_port, wifi_address

    data = request.get_json()
    logger.info(f"Connect Device Data: {data}")

    # Extract the udid from the request
    udid = data.get('udid', None)
    #ios_version = data.get('ios_version')

    connection_type = data.get('connType')



    if udid in rsd_data_map:
        if connection_type in rsd_data_map[udid]:
            logger.info(f"Connect_Device Map - Looking for {udid} in {connection_type}")
            rsd_data = rsd_data_map[udid][connection_type]

            rsd_host = rsd_data['host']
            rsd_port = rsd_data['port']

            logger.info(f"RSD in udid mapping is: {rsd_data}")
            logger.info("RSD already created. Reusing connection")
            logger.info(f"RSD Data: {rsd_data}")
            return jsonify({'rsd_data': rsd_data})

        # If no matching entry found for the udid and desired connection type
        logger.info(f"No matching RSD entry found for udid: {udid} and connection type: {connection_type}")


    # Check if developer mode is enabled, and enable it if not
    #logger.info("Must be iOS17")
    if not check_developer_mode(udid, connection_type):
        # Display modal to inform the user and give options
        return jsonify({'developer_mode_required': 'True'})

    if connection_type == "USB":
        return connect_usb(data)

    elif connection_type == "Network":
        check_pair_record(udid)

        if pair_record is None:
            logger.error("No Pair Record Found. Please use a USB Cable to create one")
            return jsonify({"Error": "No Pair Record Found"})
        result = connect_wifi(data)
        #result = await connect_wifi(data)
        #return await connect_wifi(data)
        return result

    elif connection_type == "Manual":
        check_pair_record(udid)

        if pair_record is None:
            logger.error("No Pair Record Found. Please use a USB Cable to create one")
            return jsonify({"Error": "No Pair Record Found"})
        result = connect_wifi(data)
        # result = await connect_wifi(data)
        # return await connect_wifi(data)
        return result
    else:
        logger.error("Error: No matching connection type")
        return jsonify({"Error": "No matching connection type"})

def check_rsd_data():
    max_attempts = 30
    attempts = 0
    while attempts < max_attempts:
        if rsd_host is not None and rsd_port is not None:
            return True  # Data is available
        time.sleep(1)
        attempts += 1
    return False  # Data is still None after all attempts

def connect_usb(data):
    try:
        global udid, connection_type
        global ios_version
        global rsd_data, rsd_host, rsd_port

        logger.info(f"USB data: {data}")

        # Extract the udid from the request
        udid = data.get('udid', None)
        ios_version = data.get('ios_version')
        #ios_version = "17.0"
        connection_type = data.get('connType')
        rsd_host = None
        rsd_port = None

        if ios_version is not None and is_major_version_17_or_greater(ios_version):
            logger.info("iOS 17+ detected")


            logger.info(f"iOS Version: {ios_version}")
            if version_check(ios_version):
                if sys.platform == 'win32':
                    logger.warning("iOS is between 17.0 and 17.3.1, WHY?")
                    logger.warning("You should upgrade to 17.4+")
                    logger.error("We need to install a 3rd party driver for these versions")
                    logger.error("which may stop working at any time")
                    try:
                        devices = get_devices_with_retry()
                        logger.info(f"Devices: {devices}")
                        rsd = [device for device in devices if device.udid == udid]
                        if len(rsd) > 0:
                            rsd = rsd[0]
                        start_tunnel_thread(rsd)

                    except RuntimeError as e:
                        error_message = str(e)
                        logger.error(f"Error: {error_message}")
                        return jsonify({'error': 'No Devices Found'})
                else:
                    logger.warning("ios <17.4 on non-windows")
                    try:
                        devices = get_devices_with_retry()
                        logger.info(f"Devices: {devices}")
                        rsd = [device for device in devices if device.udid == udid]
                        if len(rsd) > 0:
                            rsd = rsd[0]
                        start_tunnel_thread(rsd)

                    except RuntimeError as e:
                        error_message = str(e)
                        logger.error(f"Error: {error_message}")
                        return jsonify({'error': 'No Devices Found'})

            else:
                global lockdown
                # lockdown = create_using_usbmux(udid, autopair=True)
                lockdown = asyncio.run(create_using_usbmux(udid, autopair=True))
                logger.info(f"Create Lockdown {lockdown}")
                start_tcp_tunnel_thread(lockdown)


            #time.sleep(3)
            if not check_rsd_data():
                logger.error("RSD Data is None, Perhaps the tunnel isn't established")
            else:
                rsd_data = rsd_host, rsd_port
                logger.info(f"RSD Data: {rsd_data}")

            rsd_data_map.setdefault(udid, {})[connection_type] = {"host": rsd_host, "port": rsd_port, "ios_version": ios_version, "lockdown": None}
            logger.info(f"Device Connection Map: {rsd_data_map}")
            return jsonify({'rsd_data': rsd_data})

        elif ios_version is not None and not is_major_version_17_or_greater(ios_version):
            rsd_data = ios_version, udid
            logger.info(f"RSD Data: {rsd_data}")

            # # Check if developer mode is enabled, and enable it if not
            # if not check_developer_mode(udid, connection_type):
            #     # Display modal to inform the user and give options
            #     return jsonify({'developer_mode_required': 'True'})

            # create LockdownServiceProvider
            #global lockdown
            try:
                lockdown = asyncio.run(create_using_usbmux(udid, autopair=True))
            except Exception as e:
                logger.error(f"Failed to create lockdown client: {e}")
                lockdown = None
            logger.info(f"Lockdown client = {lockdown}")
            #rsd_data = rsd_host, rsd_port
            rsd_host, rsd_port = rsd_data

            #rsd_data_map[udid] = rsd_data
            rsd_data_map.setdefault(udid, {})[connection_type] = {"host": rsd_host, "port": rsd_port, "ios_version": ios_version, "lockdown": lockdown}

            return jsonify({'message': 'iOS version less than 17', 'rsd_data': rsd_data})

        else:
            # Invalid ios_version
            return jsonify({'error': 'No iOS version present'})
    finally:
        logger.warning("Connect Device function completed")

def connect_wifi(data):
    try:
        global udid, wifi_address, connection_type, wifi_port
        global ios_version
        global rsd_data, rsd_host, rsd_port

        logger.info(f"Wifi data: {data}")

        # Extract the udid from the request
        udid = data.get('udid', None)
        ios_version = data.get('ios_version')
        #ios_version = "17.3.1"
        #wifi_address = data.get('wifiAddress')
        #logger.error(f"wifi address: {wifi_address}")
        connection_type = data.get('connType')

        if ios_version is not None and is_major_version_17_or_greater(ios_version):
            logger.info("iOS 17+ detected")

            if version_check(ios_version):
                try:
                    devices = get_wifi_with_retry()
                    #devices = "blah"
                    logger.info(f"Connect Wifi Devices: {devices}")
                    logger.info(f"Wifi Address:  {wifi_address}")
                except RuntimeError as e:
                    error_message = str(e)
                    logger.error(f"Error: {error_message}")
                    return jsonify({'error': 'No Devices Found'})


            rsd_host = None
            rsd_port = None

            # Run tun(devices) as a background task
            #asyncio.create_task(tun(devices))
            #await tun(devices)
            #start_wifi_tunnel_thread(devices)
            start_wifi_tunnel_thread()

            if not check_rsd_data():
                logger.error("RSD Data is None, Perhaps the tunnel isn't established")
            else:
                rsd_data = rsd_host, rsd_port
                logger.info(f"RSD Data: {rsd_data}")

            rsd_data_map.setdefault(udid, {})[connection_type] = {"host": rsd_host, "port": rsd_port, "ios_version": ios_version, "lockdown": None}
            logger.info(f"Device Connection Map: {rsd_data_map}")
            return jsonify({'rsd_data': rsd_data})

        elif ios_version is not None and not is_major_version_17_or_greater(ios_version):
            rsd_data = ios_version, udid
            logger.info(f"RSD Data: {rsd_data}")

            # create LockdownServiceProvider
            global lockdown
            try:
                lockdown = asyncio.run(create_using_usbmux(udid, connection_type=connection_type, autopair=True))
            except Exception as e:
                logger.error(f"Failed to create lockdown client for wifi: {e}")
                lockdown = None
            logger.info(f"Lockdown client = {lockdown}")

            rsd_data_map.setdefault(udid, {})[connection_type] = {"host": rsd_host, "port": rsd_port, "ios_version": ios_version, "lockdown": lockdown}

            return jsonify({'message': 'iOS version less than 17', 'rsd_data': rsd_data})

        else:
            # Invalid ios_version
            return jsonify({'error': 'No iOS version present'})
    finally:
        logger.warning("Connect Device function completed")




async def start_wifi_tcp_tunnel() -> None:
    logger.warning(f"Start Wifi TCP Tunnel")
    global terminate_tunnel_thread, rsd_port, rsd_host

    # Capture current device context to handle retries correctly
    curr_udid = udid
    curr_conn_type = connection_type

    max_retries = 10
    retry_count = 0

    while retry_count < max_retries:
        try:
            if terminate_tunnel_thread:
                return

            stop_remoted_if_required()
            lockdown = await create_using_usbmux(udid)
            service = await CoreDeviceTunnelProxy.create(lockdown)

            async with service.start_tcp_tunnel() as tunnel_result:
                resume_remoted_if_required()
                logger.info(f'RSD Address: {tunnel_result.address}')
                logger.info(f'RSD Port: {tunnel_result.port}')
                
                rsd_host = tunnel_result.address
                rsd_port = str(tunnel_result.port)

                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                retry_count = 0

                while not terminate_tunnel_thread:
                    await asyncio.sleep(.5)
                return

        except Exception as e:
            retry_count += 1
            logger.error(f"Wifi TCP Tunnel Error (Attempt {retry_count}/{max_retries}): {e}")
            rsd_host = None
            rsd_port = None
            
            if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = True
            
            if retry_count >= max_retries:
                logger.error("Max retries reached for Wifi TCP tunnel. Giving up.")
                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                return
            
            await asyncio.sleep(2)

async def start_wifi_quic_tunnel() -> None:
    logger.warning(f"Start Wifi QUIC Tunnel")
    global terminate_tunnel_thread, rsd_port, rsd_host

    # Capture current device context to handle retries correctly
    curr_udid = udid
    curr_conn_type = connection_type

    max_retries = 10
    retry_count = 0

    while retry_count < max_retries:
        try:
            if terminate_tunnel_thread:
                return

            stop_remoted_if_required()
            service = await create_core_device_tunnel_service_using_remotepairing(udid, wifi_address, wifi_port)

            async with service.start_quic_tunnel() as tunnel_result:
                resume_remoted_if_required()
                logger.info(f'RSD Address: {tunnel_result.address}')
                logger.info(f'RSD Port: {tunnel_result.port}')
                
                rsd_host = tunnel_result.address
                rsd_port = str(tunnel_result.port)

                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                retry_count = 0

                while not terminate_tunnel_thread:
                    await asyncio.sleep(.5)
                return

        except Exception as e:
            retry_count += 1
            logger.error(f"Wifi QUIC Tunnel Error (Attempt {retry_count}/{max_retries}): {e}")
            rsd_host = None
            rsd_port = None
            
            if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = True
            
            if retry_count >= max_retries:
                logger.error("Max retries reached for Wifi QUIC tunnel. Giving up.")
                if curr_udid in rsd_data_map and curr_conn_type in rsd_data_map[curr_udid]:
                    rsd_data_map[curr_udid][curr_conn_type]['is_reconnecting'] = False
                return
            
            await asyncio.sleep(2)

# Define a function to start the tunnel thread
def start_wifi_tunnel_thread():
    global terminate_tunnel_thread
    terminate_tunnel_thread = False  # Set the value of the global variable
    thread = threading.Thread(target=run_wifi_tunnel)
    thread.start()
    return

# Entry point for running the tunnel async function
def run_wifi_tunnel():
    try:
        if version_check(ios_version):
            asyncio.run(start_wifi_quic_tunnel())
        #TODO: or win32 / 17.0-17.3 special tunnel

        else:
            asyncio.run(start_wifi_tcp_tunnel())
        #await tun(devices)
    except Exception as e:
        logger.error(f"Error in run_wifi_tunnel: {e}")


@app.route('/mount_developer_image', methods=['POST'])
def mount_developer_image():
    try:

        global lockdown
        lockdown = asyncio.run(create_using_usbmux(udid, autopair=True))
        logger.info(f"mount lockdown: {lockdown}")

        auto_mount(lockdown)

        return 'Developer image mounted successfully'
    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message})

async def device_location_loop(udid, conn_type, device_info):
    global terminate_location_thread, location
    last_sent_location = None
    
    rsd_host = device_info.get('host')
    rsd_port = device_info.get('port')
    ios_version = device_info.get('ios_version')
    lockdown = device_info.get('lockdown')
    
    try:
        if ios_version is not None and is_major_version_17_or_greater(ios_version):
            while not terminate_location_thread:
                if udid not in rsd_data_map or conn_type not in rsd_data_map.get(udid, {}):
                    break
                try:
                    async with RemoteServiceDiscoveryService((rsd_host, rsd_port)) as sp_rsd:
                        async with DvtSecureSocketProxyService(sp_rsd) as dvt:
                            simulation = LocationSimulation(dvt)
                            last_sent_location = None
                            while not terminate_location_thread:
                                if udid not in rsd_data_map or conn_type not in rsd_data_map.get(udid, {}):
                                    try:
                                        await simulation.clear()
                                    except Exception:
                                        pass
                                    break
                                if location != last_sent_location and location:
                                    try:
                                        latitude, longitude = location.split()
                                        await simulation.set(float(latitude), float(longitude))
                                        last_sent_location = location
                                        logger.info(f"[{udid}] Location successfully pushed to device: {location}")
                                    except Exception as e:
                                        logger.error(f"[{udid}] Inner simulation loop error: {e}")
                                        break
                                await asyncio.sleep(0.5) # Slight increase in sleep to prevent buffer bloat
                except Exception as e:
                    logger.error(f"[{udid}] Outer simulation service error: {e}. Retrying in 1s...")
                    await asyncio.sleep(1.0)
                    
        elif ios_version is not None and not is_major_version_17_or_greater(ios_version):
            while not terminate_location_thread:
                if udid not in rsd_data_map or conn_type not in rsd_data_map.get(udid, {}):
                    break
                try:
                    async with DvtSecureSocketProxyService(lockdown=lockdown) as dvt:
                        simulation = LocationSimulation(dvt)
                        await simulation.clear()
                        last_sent_location = None
                        while not terminate_location_thread:
                            if udid not in rsd_data_map or conn_type not in rsd_data_map.get(udid, {}):
                                try:
                                    await simulation.clear()
                                except Exception:
                                    pass
                                break
                            if location != last_sent_location and location:
                                try:
                                    latitude, longitude = location.split()
                                    await simulation.set(float(latitude), float(longitude))
                                    last_sent_location = location
                                    logger.debug(f"[{udid}] Location updated to {location}")
                                except Exception as e:
                                    logger.error(f"[{udid}] Inner simulation loop error: {e}")
                                    break
                            await asyncio.sleep(0.1)
                except Exception as e:
                    logger.error(f"[{udid}] Outer simulation service error: {e}. Retrying in 1s...")
                    await asyncio.sleep(1.0)
                    
    except asyncio.CancelledError:
        pass
    except ConnectionResetError as cre:
        if "[Errno 54] Connection reset by peer" in str(cre):
            logger.error(f"[{udid}] The Set Location buffer is full. Try to 'Stop Location' to clear old connections")
    except Exception as e:
        logger.error(f"[{udid}] Error in device location loop: {e}")

async def set_location_thread():
    global terminate_location_thread, location, rsd_data_map
    active_tasks = {} # (udid, conn_type) -> asyncio.Task

    try:
        while not terminate_location_thread:
            # Check for new devices and start tasks
            for udid, connections in rsd_data_map.items():
                for conn_type, device_info in connections.items():
                    key = (udid, conn_type)
                    # If task is not running or finished, start it
                    if key not in active_tasks or active_tasks[key].done():
                        # Clear any finished task from dict
                        if key in active_tasks and active_tasks[key].done():
                            try:
                                active_tasks[key].result()
                            except Exception as e:
                                logger.error(f"Task for {udid} failed: {e}")
                        
                        logger.info(f"Starting simulation task for {udid} - {conn_type}")
                        active_tasks[key] = asyncio.create_task(device_location_loop(udid, conn_type, device_info))

            # Check for removed devices and cancel tasks
            keys_to_stop = []
            for key in active_tasks:
                udid, conn_type = key
                if udid not in rsd_data_map or conn_type not in rsd_data_map[udid]:
                    keys_to_stop.append(key)
            
            for key in keys_to_stop:
                logger.info(f"Stopping simulation task for {key[0]} - {key[1]} (Device disconnected)")
                active_tasks[key].cancel()
                del active_tasks[key]

            # If no devices are connected at all, we can exit the manager thread
            if not active_tasks and not rsd_data_map:
                logger.info("No active devices, simulation manager exiting.")
                break

            await asyncio.sleep(1)
            
    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.error(f"Error in simulation manager: {e}")
    finally:
        # Cleanup all tasks
        for task in active_tasks.values():
            task.cancel()
        logger.info("Simulation manager thread stopped.")


# Variables to track the location thread
location_thread_instance = None

# Function to start the set_location_thread in a separate thread
def start_set_location_thread():
    global terminate_location_thread, location_thread_instance
    
    # If the thread is already alive and not terminated, just return.
    # The manager thread will pick up any new devices in its next loop.
    if location_thread_instance and location_thread_instance.is_alive() and not terminate_location_thread:
        logger.debug("Simulation manager is already running, new devices will be picked up automatically.")
        return

    # Reset the terminate flag before starting the thread
    terminate_location_thread = False

    # Define a helper function to run the async function in the thread
    async def run_async_function():
        await set_location_thread()

    # Create a new thread and start it
    location_thread_instance = threading.Thread(target=lambda: asyncio.run(run_async_function()))
    location_thread_instance.start()
    logger.info("Simulation Manager Thread Started")


# Function to stop the location thread
def stop_set_location_thread():
    # Set the flag to indicate that the thread should stop
    global terminate_location_thread
    terminate_location_thread = True




@app.route('/set_location', methods=['POST'])
def set_location():
    try:
        global rsd_data, rsd_host, rsd_port
        global location
        global udid, connection_type
        global ios_version

        data = request.get_json()
        # Allow combined request: update location AND trigger set_location
        if data and 'lat' in data and 'lng' in data:
            location = f"{float(data['lat'])} {float(data['lng'])}"
            logger.debug(f"Combined set_location call with: {location}")

        if ios_version is not None and is_major_version_17_or_greater(ios_version):
            if not location:
                return jsonify({'error': 'No location set'}), 400
            start_set_location_thread()
            time.sleep(0.5)
            return 'Location set command sent to device'

        elif ios_version is not None and not is_major_version_17_or_greater(ios_version):
            if not location:
                return jsonify({'error': 'No location set'}), 400
            mount_developer_image()
            start_set_location_thread()
            time.sleep(0.5)
            return 'Location set successfully'

        else:
            return jsonify({'error': 'No iOS version present'}), 400

    except Exception as e:
        error_message = str(e)
        logger.error(f"Error in /set_location route: {error_message}")
        return jsonify({'error': error_message}), 500


@app.route('/stop_location', methods=['POST'])
async def stop_location():
    try:
        stop_set_location_thread()
        global rsd_data_map
        
        for udid, connections in rsd_data_map.items():
            for conn_type, device_info in connections.items():
                rsd_host = device_info.get('host')
                rsd_port = device_info.get('port')
                ios_version = device_info.get('ios_version')
                lockdown = device_info.get('lockdown')
                
                try:
                    if ios_version is not None and is_major_version_17_or_greater(ios_version):
                        async with RemoteServiceDiscoveryService((rsd_host, rsd_port)) as sp_rsd:
                            async with DvtSecureSocketProxyService(sp_rsd) as dvt:
                                await LocationSimulation(dvt).clear()
                                logger.warning(f"[{udid}] Location Cleared Successfully")
                    elif ios_version is not None and not is_major_version_17_or_greater(ios_version):
                        async with DvtSecureSocketProxyService(lockdown=lockdown) as dvt:
                            await LocationSimulation(dvt).clear()
                            logger.warning(f"[{udid}] Location Cleared Successfully")
                except Exception as e:
                    logger.error(f"[{udid}] Error clearing location: {e}")
                    
        return 'All locations cleared successfully'
    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message})




def remove_ansi_escape_codes(text):
    ansi_escape = re.compile(r'\x1b[^m]*m')
    return ansi_escape.sub('', text)

async def get_network_devices():
# you can also query network lockdown instances using the following:
    async for ip, lockdown in get_mobdev2_lockdowns():
        print(ip, lockdown.short_info)

@app.route('/list_devices')
def py_list_devices():
    try:
        connected_devices = {}

        # Retrieve all devices
        # all_devices = list_devices()
        all_devices = asyncio.run(list_devices())
        #wifi_devices = None
        #wifi_devices = asyncio.run(get_network_devices())
        logger.info(f"\n\nRaw Devices:  {all_devices}\n")
        #logger.info(f"\n\nWifi Devices:  {wifi_devices}\n")


        if wifihost:
            udid = args.udid
            logger.warning(f"Wifi requested to {wifihost}")
            logger.warning(f"udid: {udid}")
            lockdown = create_using_tcp(hostname=wifihost, identifier=udid)

            # udid = lockdown.udid
            # print("wifi udid", udid)
            info = lockdown.short_info
            logger.warning(f"Wifi Short Info: {info}")
            # Modify the info dictionary to include wifiConState
            wifi_connection_state = lockdown.enable_wifi_connections = True
            info['wifiState'] = wifi_connection_state

            # Modify the info dictionary to include user locale
            info['userLocale'] = get_user_country()

            info['ConnectionType'] = 'Network'

            # Substitute "Network" with "Wifi" in the connection_type
            connection_type = "Manual Wifi"
            # if connection_type == "Network":
            #     connection_type = "Wifi"

            # If the serial already exists in the connected_devices dictionary
            if udid in connected_devices:
                # If the connection_type already exists under the serial, append the device to the list
                if connection_type in connected_devices[udid]:
                    connected_devices[udid][connection_type].append(info)
                # If the connection_type doesn't exist under the serial, create a new list with the device
                else:
                    connected_devices[udid][connection_type] = [info]
            # If the serial is new, create a new dictionary entry with the connection_type as a list
            else:
                connected_devices[udid] = {connection_type: [info]}






        # Iterate through all devices

        for device in all_devices:
            udid = device.serial
            connection_type = device.connection_type

            # Create lockdown and info variables
            #global lockdown
            # lockdown = create_using_usbmux(udid, connection_type=connection_type, autopair=True)
            lockdown = asyncio.run(create_using_usbmux(udid, connection_type=connection_type, autopair=True))
            info = lockdown.short_info

            try:
                wifi_connection_state = lockdown.enable_wifi_connections
                if wifi_connection_state == False:
                    lockdown.enable_wifi_connections = True
                    wifi_connection_state = True
                    logger.info("Wifi Connection State: True")
            except AttributeError:
                logger.warning("enable_wifi_connections not supported on this device/version, skipping.")
                wifi_connection_state = False
            # wifi_connection_state = lockdown.enable_wifi_connections

            # if wifi_connection_state == False:
            #     logger.info("Enabling Wifi Connections")
            #     wifi_connection_state = lockdown.enable_wifi_connections = True
            #     logger.info(f"Wifi Connection State: True")

            # Modify the info dictionary to include wifiConState
            info['wifiState'] = wifi_connection_state

            # Modify the info dictionary to include user locale
            info['userLocale'] = get_user_country()

            # Substitute "Network" with "Wifi" in the connection_type
            if connection_type == "Network":
                connection_type = "Wifi"

            # If the serial already exists in the connected_devices dictionary
            if udid in connected_devices:
                # If the connection_type already exists under the serial, append the device to the list
                if connection_type in connected_devices[udid]:
                    connected_devices[udid][connection_type].append(info)
                # If the connection_type doesn't exist under the serial, create a new list with the device
                else:
                    connected_devices[udid][connection_type] = [info]
            # If the serial is new, create a new dictionary entry with the connection_type as a list
            else:
                connected_devices[udid] = {connection_type: [info]}

        logger.info(f"\n\nConnected Devices: {connected_devices}\n")

        # Check if running as sudo
        if current_platform == "darwin":
            if os.geteuid() != 0:
                logger.error("*********************** WARNING ***********************")
                logger.error("Not running as Sudo, this probably isn't going to work")
                logger.error("*********************** WARNING ***********************")
        return jsonify(connected_devices)

    except ConnectionAbortedError as e:
        logger.error(f"ConnectionAbortedError occurred: {e}")
        return {"error"}

    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message})

def clear_geoport():
    logger.info("clear any GeoPort instances")
    substring = "GeoPort"
    current_pid = os.getpid()

    for process in psutil.process_iter(['pid', 'name']):
        try:
            if substring in process.info['name'] and process.info['pid'] != current_pid:
                logger.info(f"Found process: {process.info['pid']} - {process.info['name']}")

                # Terminate the process
                process.terminate()
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    else:
        logger.warning("No other Geo found")


def clear_old_geoport():
    logger.info("clear old GeoPort instances")
    substring = "GeoPort"

    current_pid = os.getpid()

    for process in psutil.process_iter(['pid', 'name']):
        if substring in process.info['name'] and process.info['pid'] != current_pid:
            logger.info(f"Found process: {process.info['pid']} - {process.info['name']}")

            # Terminate the process
            process.terminate()


def shutdown_server():
    logger.warning("Shutdown server initiated")
    
    # 1. Stop all loops immediately and prevent auto-reconnect
    global terminate_tunnel_thread, terminate_location_thread, rsd_data_map
    terminate_tunnel_thread = True
    terminate_location_thread = True
    
    # Ensure no device thinks it is reconnecting
    for udid in rsd_data_map:
        for conn_type in rsd_data_map[udid]:
            if isinstance(rsd_data_map[udid][conn_type], dict):
                rsd_data_map[udid][conn_type]['is_reconnecting'] = False

    # 2. Try to clear location simulation on devices with a timeout
    try:
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        if loop.is_running():
            logger.warning("Event loop is already running, skipping stop_location cleanup")
        else:
            loop.run_until_complete(asyncio.wait_for(stop_location(), timeout=2.0))
    except Exception as e:
        logger.error(f"Cleanup error or timeout: {e}")

    # 3. Fast local cleanup
    try:
        clear_old_geoport()
    except Exception as e:
        logger.error(f"Error during old process cleanup: {e}")

    logger.info("Exiting GeoPort. Goodbye!")
    os._exit(0)


def terminate_threads():
    """
    Terminate all threads.
    """
    for thread in threading.enumerate():
        if thread != threading.main_thread():
            logger.info(f"thread: {thread}")
            terminate_flag = threading.Event()
            terminate_flag.set()
            #thread.terminate()  # Terminate the thread

def list_threads():
    """
    Terminate all threads.
    """
    for thread in threading.enumerate():
        logger.info(f"thread: {thread}")
def cancel_async_tasks():
    try:
        #loop = asyncio.get_running_loop()
        tasks = asyncio.all_tasks()
        for task in tasks:
            logger.info(f"task: {task}")
            task.cancel()
    except RuntimeError as e:
        if "no running event loop" in str(e):
            logger.error("No running event loop found.")
        else:
            raise e  # Re-raise the error if it's not related to the event loop



@app.route('/exit', methods=['POST'])
def exit_app():
    logger.warning("Exit GeoPort")
    shutdown_server()
    # Send a response to the client immediately
    response = {"success": True, "message": "Server is shutting down..."}

    return jsonify(response)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(base_directory, 'app_icon.ico')


@app.route('/picture/<path:filename>')
def serve_picture(filename):
    return send_from_directory(os.path.join(base_directory, 'picture'), filename)


@app.route('/')
def index():
    # global error_message
    user_locale = get_user_country()
    logger.info(f"Country: {user_locale}")
    logger.info(f"Current platform: {platform}")
    logger.info(f"base dir =  {base_directory}")

    return render_template('map2.html',
                           user_locale=user_locale, error_message=error_message, current_platform=platform,
                           sudo_message=sudo_message, google_maps_api_key=google_maps_api_key)


def open_browser():
    time.sleep(2)  # Wait for the Flask app to start
    #webbrowser.open(f'http://localhost:{chosen_port}')
    browser = webbrowser.get()
    browser.open(f'http://localhost:{chosen_port}')


def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('0.0.0.0', port))
            return False  # Port is available
        except OSError:
            return True  # Port is already in use


def get_local_ip():
    try:
        # Create a dummy socket to find the local IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


# Define try_bind_listener_on_free_port function
def try_bind_listener_on_free_port():
    global chosen_port
    min_port = 49215
    max_port = 65535

    # Check if --port argument is provided
    if args.port:
        chosen_port = args.port
    else:
        chosen_port = flask_port

    if is_port_in_use(chosen_port):
        chosen_port = random.randint(min_port, max_port)
    
    local_ip = get_local_ip()
    logger.info(f'Serving: http://localhost:{chosen_port}')
    if local_ip != "127.0.0.1":
        logger.info(f'Network: http://{local_ip}:{chosen_port} (Use this on your phone)')
    
    return chosen_port


if __name__ == '__main__':
    #create_geoport_folder()
    if is_windows:
        try:
            # Only attempt to import and close splash if the IPC env var exists
            import os
            if '_PYI_SPLASH_IPC' in os.environ:
                import pyi_splash
                pyi_splash.update_text('UI Loaded ...')
                logger.info("Closing splash screen")
                pyi_splash.close()
        except Exception as e:
            logger.debug(f"Splash screen check skipped or failed: {e}")
        if not pyuac.isUserAdmin():
            print("Relaunching as Admin")
            pyuac.runAsAdmin()
    #else:




    chosen_port = try_bind_listener_on_free_port()

    # Check if --no-browser flag is provided
    if not args.no_browser:
        threading.Thread(target=open_browser, daemon=True).start()
    else:
        logger.info("--no-browser flag passed")
        logger.info("Running without auto-browser popup")

    app.run(debug=True, use_reloader=False, port=chosen_port, host='0.0.0.0')




