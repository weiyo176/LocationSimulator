import asyncio
from quart import Quart, jsonify

app = Quart(__name__)

@app.route('/')
async def test():
    connected_devices = {'00008030-0015343C3EF2402E': {'USB': [{'Identifier': '00008030-0015343C3EF2402E', 'DeviceClass': 'iPhone', 'DeviceName': '陳維德的iPhone', 'BuildVersion': '23D127', 'ProductVersion': '26.3', 'ProductType': 'iPhone12,1', 'UniqueDeviceID': '00008030-0015343C3EF2402E', 'ConnectionType': 'USB', 'wifiState': True, 'userLocale': 'Taiwan'}], 'Wifi': [{'Identifier': '00008030-0015343C3EF2402E', 'DeviceClass': 'iPhone', 'DeviceName': '陳維德的iPhone', 'BuildVersion': '23D127', 'ProductVersion': '26.3', 'ProductType': 'iPhone12,1', 'UniqueDeviceID': '00008030-0015343C3EF2402E', 'ConnectionType': 'Network', 'wifiState': True, 'userLocale': 'Taiwan'}]}}
    try:
        return jsonify(connected_devices)
    except Exception as e:
        return str(e), 500

async def main():
    test_app = app.test_client()
    response = await test_app.get('/')
    print(await response.get_data(as_text=True))

if __name__ == '__main__':
    asyncio.run(main())
