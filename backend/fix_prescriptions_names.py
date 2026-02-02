from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI')
if not uri:
    print("CRITICAL: MONGO_URI missing")
    exit(1)

client = MongoClient(uri)
db = client.smarthealthconnect
prescriptions = db.prescriptions
students = db.university_students

print("=== Starting Prescription Fixes ===")

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
        res = prescriptions.update_many(
            {"studentId": m["old_id"]},
            {"$set": {
                "studentId": m["new_id"],
                "studentName": new_student["name"]
            }}
        )
        print(f"Reassigned {m['old_name']} (ID {m['old_id']}) -> {new_student['name']} (ID {m['new_id']}): {res.modified_count} records.")
    else:
        print(f"Skipping {m['old_name']}: Target student ID {m['new_id']} not found.")
        
# ALSO FIX DOCTOR NAMES IN PRESCRIPTIONS
# Dr. Evans -> Dr. Venkat Rao
res_doc = prescriptions.update_many(
    {"doctorName": "Dr. Evans"},
    {"$set": {"doctorName": "Dr. Venkat Rao"}}
)
print(f"Updated {res_doc.modified_count} prescriptions from 'Dr. Evans' to 'Dr. Venkat Rao'.")

print("\n=== Fix Complete ===")
