from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI')
if not uri:
    print("CRITICAL: MONGO_URI not found. Please check .env file.")
    exit(1)
    
client = MongoClient(uri)
db = client.smarthealthconnect

appts = db.appointments
staff = db.staff_users
students = db.university_students

print("=== Debugging Data ===")
print(f"Distinct Student IDs in Appointments: {appts.distinct('studentId')}")
print(f"Distinct Doctor IDs in Appointments: {appts.distinct('doctorId')}")

print("=== Starting Appointment Name Fixes ===")

# 1. Fix Doctor Names (Dr. Evans -> Dr. Venkat Rao)
# We know ID 691c23c193290e9b2341cc57 is the transformed doctor
doctor_id = "691c23c193290e9b2341cc57"
doctor_new_name = "Dr. Venkat Rao"

res = appts.update_many(
    {"doctorId": doctor_id},
    {"$set": {"doctorName": doctor_new_name}}
)
print(f"Updated {res.modified_count} appointments from old Doctor Name to '{doctor_new_name}'.")

# 2. Fix Student Names (Map invalid IDs to valid ones)
# Mapping Strategy:
# Alice Smith (1001) -> G Guhan (56)
# Bob Johnson (1002) -> Savaram Muni Chandu (29)

mappings = [
    {"old_id": "1001", "new_id": "56", "old_name": "Alice Smith"},
    {"old_id": "1002", "new_id": "29", "old_name": "Bob Johnson"}
]

for m in mappings:
    # Verify new student exists
    new_student = students.find_one({"studentId": m["new_id"]})
    if new_student:
        res = appts.update_many(
            {"studentId": m["old_id"]},
            {"$set": {
                "studentId": m["new_id"],
                "studentName": new_student["name"]
            }}
        )
        print(f"Reassigned {m['old_name']} (ID {m['old_id']}) -> {new_student['name']} (ID {m['new_id']}): {res.modified_count} records.")
    else:
        print(f"Skipping {m['old_name']}: Target student ID {m['new_id']} not found.")

print("\n=== Fix Complete ===")
