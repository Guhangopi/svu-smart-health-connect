import urllib.request
import urllib.parse
import json
import datetime

BASE_URL = "http://127.0.0.1:5000/api"

def make_request(url, method="GET", data=None):
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header('Content-Type', 'application/json')
        
        if data:
            json_data = json.dumps(data).encode('utf-8')
            req.data = json_data

        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, body, None
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, body, None
    except Exception as e:
        return None, None, str(e)

def run_test():
    print("--- Starting HTTP Booking Test (Urllib) ---")
    
    # 1. Get Doctors
    print("Fetching doctors...")
    status, body, err = make_request(f"{BASE_URL}/doctors")
    if err:
        print(f"Error fetching doctors: {err}")
        return
    
    if status != 200:
        print(f"Failed to get doctors: {status} {body}")
        return
    
    doctors = json.loads(body)
    lakshmi = next((d for d in doctors if "lakshmi" in d['name'].lower()), None)
    
    if not lakshmi:
        print("Dr. Lakshmi Priya not found in API response.")
        print("Available doctors:", [d['name'] for d in doctors])
        return
        
    print(f"Found Dr. Lakshmi: {lakshmi['name']} (ID: {lakshmi['id']})")
    
    # 2. Get Slots for Tomorrow
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    print(f"Checking slots for {tomorrow}...")
    
    status, body, err = make_request(f"{BASE_URL}/slots", method="POST", data={
        "doctorId": lakshmi['id'],
        "date": tomorrow
    })
    
    if err:
        print(f"Error fetching slots: {err}")
        return

    if status != 200:
        print(f"Failed to get slots: {status} {body}")
        return
        
    slots = json.loads(body)
    print(f"Available slots: {len(slots)}")
    if not slots:
        print("No slots available. Cannot test booking.")
        # Try to debug WHY no slots?
        print("Is doctor marked unavailable?")
        return
        
    target_slot = slots[0]
    print(f"Targeting slot: {target_slot}")

    # 3. Book Appointment
    print(f"Attempting to book slot {target_slot}...")
    payload = {
        "studentId": "TEST_STUDENT_001",
        "studentName": "Test Student",
        "doctorId": lakshmi['id'],
        "doctorName": lakshmi['name'],
        "date": tomorrow,
        "time": target_slot,
        "reason": "Automated Test Booking"
    }
    
    status, body, err = make_request(f"{BASE_URL}/appointments", method="POST", data=payload)
    
    print(f"Booking Response Code: {status}")
    print(f"Response Body: {body}")
        
    if status == 201:
        print("SUCCESS: Booking created.")
    elif status == 409:
        print("FAILURE: Slot already booked (Double Booking Logic triggered).")
    else:
        print(f"FAILURE: Unexpected status {status}.")

if __name__ == "__main__":
    run_test()
