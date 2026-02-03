
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Adjust path to where .env is located relative to where script is run, or absolute
load_dotenv(r'e:\\SmartHealthConnect\\backend\\.env')
uri = os.getenv('MONGO_URI')

if not uri:
    print("No MONGO_URI found")
    exit(1)

try:
    client = MongoClient(uri)
    db = client.smarthealthconnect

    print("--- UNIVERSITY STUDENTS (Roster) ---")
    roster_ids = set()
    for s in db.university_students.find():
        print(f"ID: {s.get('studentId')}, Name: {s.get('name')}")
        roster_ids.add(s.get('studentId'))

    print("\n--- STUDENT USERS (Login Accounts) ---")
    user_ids = set()
    for u in db.student_users.find():
        print(f"ID: {u.get('studentId')}, HasPassword: {'yes' if u.get('password') else 'no'}")
        user_ids.add(u.get('studentId'))

    print("\n--- ANALYSIS ---")
    orphaned = user_ids - roster_ids
    if orphaned:
        print(f"WARNING: The following Student IDs can login but are NOT in the roster: {orphaned}")
    else:
        print("All login accounts have a corresponding roster entry.")

except Exception as e:
    print(f"Error: {e}")
