import asyncio
import sys

# Patch sys.argv to avoid argparse issues
sys.argv = ['main.py', '--no-browser']

from main import app

async def test_route():
    client = app.test_client()
    response = await client.get('/list_devices')
    data = await response.get_data(as_text=True)
    print(f"Status Code: {response.status_code}")
    print(f"Response Data: {data}")

if __name__ == '__main__':
    asyncio.run(test_route())
