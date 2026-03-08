import asyncio
from pymobiledevice3.lockdown import create_using_usbmux

async def main():
    try:
        l = await create_using_usbmux()
        info = l.short_info
        print("Short info keys:", info.keys())
        wifi_state = l.get_enable_wifi_connections()
        print("Wifi connections:", wifi_state)
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    asyncio.run(main())
