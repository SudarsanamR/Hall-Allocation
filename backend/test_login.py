import requests
import json

url = "http://127.0.0.1:5001/api/login"
payload = {"password": "ExamAdmin"}
headers = {"Content-Type": "application/json"}

try:
    print(f"Testing {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
