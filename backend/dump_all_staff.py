from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users

print(f"--- All Staff Users ({staff.count_documents({})}) ---")
for s in staff.find():
    print(f"ID: {s['_id']} | Role: {s.get('role')} | Email: {s.get('email')} | Hash: {s.get('password')[:10] if s.get('password') else 'NONE'}")
print("--- End ---")
