from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
if not uri:
    uri = "mongodb://localhost:27017/" 

try:
    client = MongoClient(uri)
    db = client.smarthealthconnect
    student_users_collection = db.student_users
    
    student_id_to_remove = "002"
    
    print(f"Attempting to remove account for Student ID: {student_id_to_remove}")
    
    result = student_users_collection.delete_one({"studentId": student_id_to_remove})
    
    if result.deleted_count > 0:
        print("SUCCESS: Orphaned account removed.")
    else:
        print("NOT FOUND: No account found with that Student ID.")
        
except Exception as e:
    print(f"ERROR: {e}")
