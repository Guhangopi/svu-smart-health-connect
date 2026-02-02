from pymongo import MongoClient
import os
from flask import Flask
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users

# Temporary app for bcrypt
app = Flask(__name__)
bcrypt = Bcrypt(app)
default_pw = bcrypt.generate_password_hash("password123").decode('utf-8')

print("--- Starting Doctor Updates ---")

# 1. Update Dr. Evans -> Dr. Venkat Rao
evans = staff.find_one({"email": "dr.evans@svu.edu"})
if evans:
    print("Found Dr. Evans. Updating to Dr. Venkat Rao...")
    staff.update_one(
        {"_id": evans["_id"]},
        {"$set": {
            "name": "Dr. Venkat Rao",
            "email": "dr.venkat@svu.edu",
            "specialization": "Senior Doctor - General Medicine",
            # Ensure timings are preserved or set defaults if missing
            "morningStart": evans.get("morningStart", "09:00"),
            "morningEnd": evans.get("morningEnd", "13:00"),
            "eveningStart": evans.get("eveningStart", "17:00"),
            "eveningEnd": evans.get("eveningEnd", "21:00")
        }}
    )
    print("Dr. Venkat Rao updated.")
else:
    # Check if already renamed
    if staff.find_one({"email": "dr.venkat@svu.edu"}):
        print("Dr. Venkat Rao already exists.")
    else:
        print("Dr. Evans not found. Creating Dr. Venkat Rao new...")
        staff.insert_one({
            "name": "Dr. Venkat Rao",
            "email": "dr.venkat@svu.edu",
            "password": default_pw,
            "role": "doctor",
            "specialization": "Senior Doctor - General Medicine",
            "morningStart": "09:00", "morningEnd": "13:00",
            "eveningStart": "17:00", "eveningEnd": "21:00"
        })
        print("Dr. Venkat Rao created.")

# 2. Add Dr. Karthik Subramaniam (Junior)
if not staff.find_one({"email": "dr.karthik@svu.edu"}):
    print("Creating Dr. Karthik Subramaniam...")
    staff.insert_one({
        "name": "Dr. Karthik Subramaniam",
        "email": "dr.karthik@svu.edu",
        "password": default_pw,
        "role": "doctor",
        "specialization": "Junior Resident",
        "morningStart": "08:00", "morningEnd": "14:00", # Longer shifts for juniors?
        "eveningStart": "16:00", "eveningEnd": "20:00"
    })
    print("Dr. Karthik created.")
else:
    print("Dr. Karthik already exists.")

# 3. Add Dr. Lakshmi Priya (Junior)
if not staff.find_one({"email": "dr.lakshmi@svu.edu"}):
    print("Creating Dr. Lakshmi Priya...")
    staff.insert_one({
        "name": "Dr. Lakshmi Priya",
        "email": "dr.lakshmi@svu.edu",
        "password": default_pw,
        "role": "doctor",
        "specialization": "Junior Resident",
        "morningStart": "08:00", "morningEnd": "14:00",
        "eveningStart": "16:00", "eveningEnd": "20:00"
    })
    print("Dr. Lakshmi created.")
else:
    print("Dr. Lakshmi already exists.")

print("--- Updates Complete ---")
