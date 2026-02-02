from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users

print("--- Current Staff ---")
# Find all users where role is NOT 'doctor' and NOT 'admin'
for s in staff.find({"role": {"$nin": ["doctor", "admin"]}}):
    print(f"Name: {s.get('name')}, Role: {s.get('role')}, Email: {s.get('email')}")
