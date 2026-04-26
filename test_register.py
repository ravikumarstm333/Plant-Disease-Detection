#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:5000"

def test_registration():
    register_data = {
        "name": "Test Farmer",
        "email": "test@example.com",
        "password": "testpass123",
        "role": "farmer",
        "location": "Mumbai",
        "phone": "9876543210"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response
    except Exception as e:
        print(f"Exception: {str(e)}")
        return None

if __name__ == "__main__":
    test_registration()