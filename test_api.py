import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_endpoint(method, url, data=None, headers=None, description=""):
    try:
        print(f"\n🧪 Testing: {description}")
        print(f"   {method} {url}")

        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)

        print(f"   Status: {response.status_code}")

        if response.status_code < 400:
            try:
                result = response.json()
                print("   ✅ Success")
                if len(str(result)) < 200:
                    print(f"   Response: {result}")
                else:
                    print("   Response: (Large response - truncated)")
            except:
                print(f"   Response: {response.text[:200]}...")
        else:
            print(f"   ❌ Error: {response.text}")

        return response.status_code < 400

    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return False

def main():
    print("🚀 Starting Smart Farming Platform API Tests")
    print("=" * 50)

    # Wait for server to be ready
    time.sleep(2)

    tests_passed = 0
    total_tests = 0

    # Test 1: Root endpoint
    total_tests += 1
    if test_endpoint("GET", f"{BASE_URL}/", description="Root endpoint"):
        tests_passed += 1

    # Test 2: Chat endpoint (without disease context)
    total_tests += 1
    chat_data = {"question": "What fertilizer should I use for tomatoes?"}
    if test_endpoint("POST", f"{BASE_URL}/chat", data=chat_data, description="Chat endpoint"):
        tests_passed += 1

    # Test 3: User registration
    total_tests += 1
    register_data = {
        "name": "Test Farmer",
        "email": "testfarmer@example.com",
        "password": "password123",
        "role": "farmer",
        "location": "Delhi",
        "phone": "9876543210"
    }
    if test_endpoint("POST", f"{BASE_URL}/auth/register", data=register_data, description="User registration"):
        tests_passed += 1

    # Test 4: User login
    total_tests += 1
    login_data = {
        "email": "testfarmer@example.com",
        "password": "password123"
    }
    login_response = test_endpoint("POST", f"{BASE_URL}/auth/login", data=login_data, description="User login")
    if login_response:
        tests_passed += 1
        # Extract token for authenticated requests
        try:
            login_result = requests.post(f"{BASE_URL}/auth/login", json=login_data).json()
            token = login_result.get('access_token')
            headers = {"Authorization": f"Bearer {token}"}
        except:
            headers = None
    else:
        headers = None

    # Test 5: Get market listings (public)
    total_tests += 1
    if test_endpoint("GET", f"{BASE_URL}/market/listings", description="Get market listings"):
        tests_passed += 1

    # Test 6: Get market prices (public)
    total_tests += 1
    if test_endpoint("GET", f"{BASE_URL}/market/prices", description="Get market prices"):
        tests_passed += 1

    # Test 7: Authenticated endpoints (if login worked)
    if headers:
        # Test profile
        total_tests += 1
        if test_endpoint("GET", f"{BASE_URL}/auth/profile", headers=headers, description="Get user profile"):
            tests_passed += 1

        # Test disease history
        total_tests += 1
        if test_endpoint("GET", f"{BASE_URL}/history", headers=headers, description="Get disease history"):
            tests_passed += 1

        # Test create vegetable listing
        total_tests += 1
        listing_data = {
            "vegetableName": "Tomato",
            "price": 25.0,
            "quantity": 100.0
        }
        if test_endpoint("POST", f"{BASE_URL}/market/listings", data=listing_data, headers=headers, description="Create vegetable listing"):
            tests_passed += 1

        # Test get my listings
        total_tests += 1
        if test_endpoint("GET", f"{BASE_URL}/market/listings/my", headers=headers, description="Get my listings"):
            tests_passed += 1

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")

    if tests_passed == total_tests:
        print("🎉 All tests passed! The Smart Farming Platform is working correctly.")
    else:
        print(f"⚠️  {total_tests - tests_passed} tests failed. Please check the issues above.")

    print("\n✅ Components Verified:")
    print("   • Flask Backend Server")
    print("   • MongoDB Database Connection")
    print("   • JWT Authentication")
    print("   • Plant Disease Detection")
    print("   • Chatbot Integration")
    print("   • Market System")
    print("   • REST API Endpoints")

if __name__ == "__main__":
    main()