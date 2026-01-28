import urllib.request
import json
import urllib.error

BASE_URL = "http://127.0.0.1:5000/api/admin/university-students"

def post_json(url, data):
    req = urllib.request.Request(url)
    req.add_header('Content-Type', 'application/json')
    jsondata = json.dumps(data).encode('utf-8')
    req.add_header('Content-Length', len(jsondata))
    response = urllib.request.urlopen(req, jsondata)
    return response

def delete_req(url):
    req = urllib.request.Request(url, method='DELETE')
    response = urllib.request.urlopen(req)
    return response

def run_tests():
    print("--- STARTING TESTS (Urllib) ---")
    
    # 1. ADD
    print("\n1. Adding Student...")
    data = {"studentId": "TEST_VERIFY_001", "name": "Verify Bot", "phone": "9988776655"}
    try:
        res = post_json(BASE_URL, data)
        print(f"ADD Result: {res.status} {res.read().decode()}")
    except urllib.error.HTTPError as e:
         print(f"ADD Failed: {e.code} {e.read().decode()}")
    except Exception as e:
        print(f"ADD Failed: {e}")

    # 2. GET
    print("\n2. Listing Students...")
    try:
        res = urllib.request.urlopen(BASE_URL)
        content = res.read().decode()
        students = json.loads(content)
        print(f"GET Result: {res.status}, Found {len(students)} students.")
    except Exception as e:
        print(f"GET Failed: {e}")
        return

    # 3. DELETE
    print("\n3. Deleting Student...")
    try:
        res = delete_req(f"{BASE_URL}/TEST_VERIFY_001")
        print(f"DELETE Result: {res.status} {res.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"DELETE Failed: {e.code} {e.read().decode()}")
    except Exception as e:
        print(f"DELETE Failed: {e}")

if __name__ == "__main__":
    run_tests()
