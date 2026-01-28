from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"

client = MongoClient(uri)
db = client.smarthealthconnect
users = db.student_users.find({}, {"studentId": 1, "_id": 0})

print("--- Existing Student Accounts ---")
found = False
for u in users:
    print(f"User: {u.get('studentId')}")
    if u.get('studentId') == "002":
        found = True

if not found:
    print("--- ID '002' NOT FOUND ---")
