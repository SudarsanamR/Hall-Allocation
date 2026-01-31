import requests
import sys

# Try to login first to get session
session = requests.Session()
BASE_URL = "http://127.0.0.1:5001/api"

print("Logging in as SuperAdmin...")
login_payload = {"username": "SuperAdmin", "password": "SuperAdmin"}
res = session.post(f"{BASE_URL}/auth/login", json=login_payload)
if res.status_code != 200:
    print(f"Login failed: {res.status_code} {res.text}")
    sys.exit(1)

print("Login successful. Fetching admins...")
admin_res = session.get(f"{BASE_URL}/admin/users")

print(f"Status Code: {admin_res.status_code}")
print("Response Body:")
print(admin_res.text)
