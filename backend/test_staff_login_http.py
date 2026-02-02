import requests

print("--- Testing via HTTP to 127.0.0.1:5000 ---")

def test_http_login(email, password):
    url = "http://127.0.0.1:5000/api/staff/login"
    payload = {"email": email, "password": password}
    try:
        response = requests.post(url, json=payload)
        print(f"User: {email} | Status: {response.status_code}")
        if response.status_code == 200:
            print("Login SUCCESS")
            print(response.json())
        else:
            print("Login FAILED")
            print(response.text)
    except Exception as e:
        print(f"Request Error: {e}")

test_http_login("pharmacist.meena@svu.edu", "password123")
test_http_login("labtech.ravi@svu.edu", "password123")
