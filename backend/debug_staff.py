from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users

print("--- Inspecting Staff Users ---")
for s in staff.find({"role": {"$nin": ["doctor", "admin"]}}):
    print(f"Name: {s.get('name')}")
    print(f"Email: {s.get('email')}")
    print(f"Role: {s.get('role')}")
    print(f"Hash start: {s.get('password')[:10] if s.get('password') else 'NO PASSWORD'}")
    print("-" * 20)
