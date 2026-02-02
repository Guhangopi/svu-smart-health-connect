from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users

print("--- Current Doctors ---")
for doc in staff.find({"role": "doctor"}):
    print(f"Name: {doc.get('name')}, Email: {doc.get('email')}")
