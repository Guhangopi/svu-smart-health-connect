
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(r'e:\\SmartHealthConnect\\backend\\.env')
uri = os.getenv('MONGO_URI')

if not uri:
    print("No MONGO_URI found")
    exit(1)

try:
    client = MongoClient(uri)
    db = client.smarthealthconnect

    print("--- APPOINTMENTS CHECK ---")
    orphaned_ids = ['29', '56', '100', '68']
    for old_id in orphaned_ids:
        count = db.appointments.count_documents({"studentId": old_id})
        print(f"Student ID '{old_id}' has {count} appointments.")
        
    print("\n--- PRESCRIPTIONS CHECK ---")
    for old_id in orphaned_ids:
        count = db.prescriptions.count_documents({"studentId": old_id})
        print(f"Student ID '{old_id}' has {count} prescriptions.")

except Exception as e:
    print(f"Error: {e}")
