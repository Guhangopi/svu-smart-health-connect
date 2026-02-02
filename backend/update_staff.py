from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users

print("--- Starting Staff Updates ---")

# 1. Update Pharmacist
pharmacist = staff.find_one({"email": "pharmacist@svu.edu"})
if pharmacist:
    print("Found Sarah Pharma. Updating to Ms. Meena Kumari...")
    staff.update_one(
        {"_id": pharmacist["_id"]},
        {"$set": {
            "name": "Ms. Meena Kumari",
            "email": "pharmacist.meena@svu.edu"
        }}
    )
    print("Ms. Meena Kumari updated.")
else:
    print("Pharmacist (pharmacist@svu.edu) not found.")

# 2. Update Lab Tech
labtech = staff.find_one({"email": "labtech@svu.edu"})
if labtech:
    print("Found Lab Tech John. Updating to Mr. Ravi Kumar...")
    staff.update_one(
        {"_id": labtech["_id"]},
        {"$set": {
            "name": "Mr. Ravi Kumar",
            "email": "labtech.ravi@svu.edu"
        }}
    )
    print("Mr. Ravi Kumar updated.")
else:
    print("Lab Tech (labtech@svu.edu) not found.")

print("--- Updates Complete ---")
