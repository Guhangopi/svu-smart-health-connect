from datetime import datetime, timedelta

# Mock Objects
class MockCollection:
    def __init__(self, data):
        self.data = data
    def find(self):
        return self.data

def test_logic():
    now = datetime.now()
    future = now + timedelta(days=1)
    past = now - timedelta(days=1)
    
    appointments_data = [
        {"date": future.strftime("%Y-%m-%d"), "time": future.strftime("%H:%M"), "status": "Pending"}, # Count
        {"date": future.strftime("%Y-%m-%d"), "time": future.strftime("%H:%M"), "status": "Cancelled"}, # Skip
        {"date": past.strftime("%Y-%m-%d"), "time": past.strftime("%H:%M"), "status": "Pending"}, # Skip (Past)
    ]
    
    appointments_collection = MockCollection(appointments_data)
    
    # Logic from app.py
    all_appts = appointments_collection.find()
    pending_count = 0
    now_check = datetime.now() # slightly after 'now'

    for appt in all_appts:
        try:
            appt_dt_str = f"{appt['date']} {appt['time']}"
            appt_dt = datetime.strptime(appt_dt_str, "%Y-%m-%d %H:%M")
            
            if appt_dt > now_check and appt.get('status') != 'Cancelled':
                pending_count += 1
        except Exception as e:
            print(e)
            continue
            
    print(f"Pending Count: {pending_count}")
    if pending_count == 1:
        print("✅ SUCCESS: Logic is correct.")
    else:
        print("❌ FAILED: Logic is incorrect.")

if __name__ == "__main__":
    test_logic()
