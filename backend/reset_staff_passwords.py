from pymongo import MongoClient
from flask import Flask
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI') or "mongodb://localhost:27017/"
client = MongoClient(uri)
db = client.smarthealthconnect
staff = db.staff_users

app = Flask(__name__)
bcrypt = Bcrypt(app)
new_password = bcrypt.generate_password_hash("password123").decode('utf-8')

print("--- Resetting Staff Passwords ---")

# Update Pharmacist
res = staff.update_one(
    {"email": "pharmacist.meena@svu.edu"},
    {"$set": {"password": new_password}}
)
print(f"Pharmacist updated: {res.modified_count}")

# Update Lab Tech
res = staff.update_one(
    {"email": "labtech.ravi@svu.edu"},
    {"$set": {"password": new_password}}
)
print(f"Lab Tech updated: {res.modified_count}")

print("--- Done ---")
