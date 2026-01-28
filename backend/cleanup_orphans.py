from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"

client = MongoClient(uri)
db = client.smarthealthconnect

roster_ids = [s['studentId'] for s in db.university_students.find({}, {"studentId": 1})]
account_ids = [u['studentId'] for u in db.student_users.find({}, {"studentId": 1})]

print(f"Roster IDs: {roster_ids}")
print(f"Account IDs: {account_ids}")

orphans = [uid for uid in account_ids if uid not in roster_ids]

print(f"--- ORPHANS FOUND: {orphans} ---")

if orphans:
    print("Deleting orphans...")
    db.student_users.delete_many({"studentId": {"$in": orphans}})
    print("Orphans deleted.")
