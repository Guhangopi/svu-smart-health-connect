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
appts = db.appointments

print("=== Analyzing Prescriptions Data ===")
print(f"Total Prescriptions: {prescriptions.count_documents({})}")
print(f"Distinct Student IDs in Prescriptions: {prescriptions.distinct('studentId')}")

print("\n--- Student ID Validation ---")
for s_id in prescriptions.distinct('studentId'):
    real_stu = students.find_one({"studentId": s_id})
    status = f"[VALID] ({real_stu['name']})" if real_stu else "[INVALID/DELETED]"
    count = prescriptions.count_documents({"studentId": s_id})
    print(f"ID: {s_id} | Count: {count} | {status}")
