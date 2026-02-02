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

print("--- Testing Staff Login Locally ---")

def test_login(email, password):
    user = staff.find_one({"email": email})
    if not user:
        print(f"User {email} NOT FOUND.")
        return
    
    # Check hash
    is_valid = bcrypt.check_password_hash(user['password'], password)
    print(f"User: {email} | Password: {password} | Valid: {is_valid}")

test_login("pharmacist.meena@svu.edu", "password123")
test_login("labtech.ravi@svu.edu", "password123")
test_login("dr.venkat@svu.edu", "password123")
