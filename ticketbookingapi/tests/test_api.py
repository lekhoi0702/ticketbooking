import requests

try:
    r = requests.get("http://localhost:5000/api/events/featured?limit=4")
    print(f"Status: {r.status_code}")
    print(f"Content: {r.text}")
except Exception as e:
    print(f"Error: {e}")
