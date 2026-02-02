from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect

appts = db.appointments
staff = db.staff_users
students = db.university_students

print("=== Analyzing Appointments Data ===")
print(f"Total Appointments: {appts.count_documents({})}")

# Analyze Doctors
print("\n--- Doctors in Appointments ---")
doc_pairs = appts.aggregate([
    {"$group": {"_id": {"id": "$doctorId", "name": "$doctorName"}, "count": {"$sum": 1}}}
])

for doc in doc_pairs:
    d_id = doc['_id']['id']
    d_name = doc['_id']['name']
    count = doc['count']
    
    # Check if exists in Staff
    try:
        from bson import ObjectId
        real_doc = staff.find_one({"_id": ObjectId(d_id)})
        status = f"[VALID] (Current Name: {real_doc['name']})" if real_doc else "[INVALID/DELETED]"
    except:
        status = "[INVALID ID FORMAT]"
        
    print(f"ID: {d_id} | Name: {d_name} | Count: {count} | {status}")

# Analyze Students
print("\n--- Students in Appointments ---")
stu_pairs = appts.aggregate([
    {"$group": {"_id": {"id": "$studentId", "name": "$studentName"}, "count": {"$sum": 1}}}
])

for stu in stu_pairs:
    s_id = stu['_id']['id']
    s_name = stu['_id']['name']
    count = stu['count']
    
    # Check if exists in Students
    real_stu = students.find_one({"studentId": s_id})
    status = f"[VALID] (Current Name: {real_stu['name']})" if real_stu else "[INVALID/DELETED]"
    
    print(f"ID: {s_id} | Name: {s_name} | Count: {count} | {status}")
