from pymongo import MongoClient
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users
appointments = db.appointments

def generate_slots(date_str, morning_start, morning_end, evening_start, evening_end):
    slots = []
    try:
        # 1. MORNING SESSION
        print(f"Generating slots for {date_str}, Morning: {morning_start}-{morning_end}, Evening: {evening_start}-{evening_end}")
        current_time = datetime.strptime(f"{date_str} {morning_start}", "%Y-%m-%d %H:%M")
        end_time_morning = datetime.strptime(f"{date_str} {morning_end}", "%Y-%m-%d %H:%M")
        
        while current_time < end_time_morning:
            slots.append(current_time.strftime("%H:%M"))
            current_time += timedelta(minutes=15)

        # 2. EVENING SESSION
        current_time = datetime.strptime(f"{date_str} {evening_start}", "%Y-%m-%d %H:%M")
        end_time_evening = datetime.strptime(f"{date_str} {evening_end}", "%Y-%m-%d %H:%M")
        
        while current_time < end_time_evening:
            slots.append(current_time.strftime("%H:%M"))
            current_time += timedelta(minutes=15)
            
        return slots
    except Exception as e:
        print(f"Error generating slots: {e}")
        return []

print("--- Searching for Dr. Lakshmi Priya ---")
lakshmi = staff.find_one({"name": "Dr. Lakshmi Priya"})
if not lakshmi:
    print("Dr. Lakshmi Priya NOT FOUND in database.")
else:
    print(f"Found Dr. Lakshmi: {lakshmi}")
    print(f"ID: {lakshmi['_id']}")
    
    # Simulate Get Slots
    date_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d") # Tomorrow
    
    morning_start = lakshmi.get('morningStart', '09:00')
    morning_end = lakshmi.get('morningEnd', '13:00')
    evening_start = lakshmi.get('eveningStart', '17:00')
    evening_end = lakshmi.get('eveningEnd', '21:00')
    
    slots = generate_slots(date_str, morning_start, morning_end, evening_start, evening_end)
    print(f"Generated {len(slots)} slots.")
    if len(slots) > 0:
        print(f"First 5 slots: {slots[:5]}")
    
    # Check if there are existing bookings that might interfere
    booked = list(appointments.find({"doctorId": str(lakshmi['_id'])}))
    print(f"Existing appointments for Dr. Lakshmi: {len(booked)}")

print("--- End Debug ---")
