import os
import csv
import io
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from urllib.parse import quote_plus
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from bson import ObjectId # Used to handle Mongo's _id
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# --- 1. CONFIGURATION ---

# We'll use a secret key for sessions later (for JWT tokens)
app.secret_key = os.getenv('SECRET_KEY', 'default_dev_secret')

# Init Bcrypt for password hashing
bcrypt = Bcrypt(app)

# Init CORS to allow cross-origin requests (from React)
# Init CORS to allow cross-origin requests (from React)
CORS(app)

# --- CONFIG FOR UPLOADS ---
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

# --- 2. DATABASE CONNECTION ---
uri = os.getenv('MONGO_URI')
if not uri:
    print("❌ ERROR: MONGO_URI not found in environment variables.")


try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000) # Add timeout
    client.admin.command('ping')
    print("[SUCCESS] Connected to MongoDB.")
    db = client.smarthealthconnect
except Exception as e:
    print(f"[CONNECTION FAILED] {e}")
    client = None
    db = None

if db is None:
    print("CRITICAL: Failed to connect to MongoDB. Exiting.")
    exit(1)

patients_collection = db.patients
# NEW COLLECTION for doctors/staff:
staff_users_collection = db.staff_users
university_students_collection = db.university_students
student_users_collection = db.student_users
appointments_collection = db.appointments
appointments_collection = db.appointments
lab_reports_collection = db.lab_reports
lab_requests_collection = db.lab_requests # NEW: For Doctor -> Lab Tech requests
prescriptions_collection = db.prescriptions

# --- ADMIN API ROUTES ---

# 1. SEED ADMIN (One-time use)
@app.route('/api/admin/create-first-admin')
def create_first_admin():
    if staff_users_collection.find_one({"role": "admin"}):
        return "Admin already exists."

    hashed_password = bcrypt.generate_password_hash("admin123").decode('utf-8')
    
    staff_users_collection.insert_one({
        "email": "admin@svu.edu",
        "name": "Super Admin",
        "password": hashed_password,
        "role": "admin"
    })
    return "Admin created: admin@svu.edu / admin123"

# 2. MANAGE DOCTORS (GET ALL / ADD NEW)
@app.route('/api/admin/doctors', methods=['GET', 'POST'])
def manage_doctors():
    if request.method == 'GET':
        doctors = []
        for doc in staff_users_collection.find({"role": "doctor"}):
            doctors.append({
                "id": str(doc['_id']),
                "name": doc.get('name'),
                "email": doc.get('email'),
                "specialization": doc.get('specialization', 'General'),
                # Return all 4 timing fields
                "morningStart": doc.get('morningStart', '09:00'),
                "morningEnd": doc.get('morningEnd', '13:00'),
                "eveningStart": doc.get('eveningStart', '17:00'),
                "eveningEnd": doc.get('eveningEnd', '21:00')
            })
        return jsonify(doctors), 200

    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        
        if staff_users_collection.find_one({"email": email}):
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(data.get('password', 'password123')).decode('utf-8')
        
        staff_users_collection.insert_one({
            "email": email,
            "name": data.get('name'),
            "password": hashed_password,
            "role": "doctor",
            "specialization": data.get('specialization', 'General'),
            # Save all 4 timing fields
            "morningStart": data.get('morningStart', '09:00'),
            "morningEnd": data.get('morningEnd', '13:00'),
            "eveningStart": data.get('eveningStart', '17:00'),
            "eveningEnd": data.get('eveningEnd', '21:00')
        })
        return jsonify({"message": "Doctor created successfully"}), 201

# 3. MANAGE SPECIFIC DOCTOR (UPDATE / DELETE)
@app.route('/api/admin/doctor/<doctor_id>', methods=['PUT', 'DELETE'])
def manage_specific_doctor(doctor_id):
    if request.method == 'PUT':
        data = request.get_json()
        update_fields = {
            "name": data.get('name'),
            "email": data.get('email'),
            "specialization": data.get('specialization'),
            "morningStart": data.get('morningStart'),
            "morningEnd": data.get('morningEnd'),
            "eveningStart": data.get('eveningStart'),
            "eveningEnd": data.get('eveningEnd')
        }
        
        # Remove None values to avoid overwriting with null
        update_fields = {k: v for k, v in update_fields.items() if v is not None}
        
        staff_users_collection.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": update_fields}
        )
        return jsonify({"message": "Doctor updated successfully"}), 200

    if request.method == 'DELETE':
        # Optional: Check for future appointments before deleting?
        # For now, just delete functionality.
        staff_users_collection.delete_one({"_id": ObjectId(doctor_id)})
        return jsonify({"message": "Doctor removed successfully"}), 200

# 3b. MANAGE OTHER STAFF (Pharmacists, Lab Techs, etc.)
@app.route('/api/admin/staff', methods=['GET', 'POST'])
def manage_staff():
    if request.method == 'GET':
        staff = []
        # Find all users where role is NOT 'doctor' and NOT 'admin'
        for s in staff_users_collection.find({"role": {"$nin": ["doctor", "admin"]}}):
            staff.append({
                "id": str(s['_id']),
                "name": s.get('name'),
                "email": s.get('email'),
                "role": s.get('role')
            })
        return jsonify(staff), 200

    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        
        if staff_users_collection.find_one({"email": email}):
            return jsonify({"error": "Email already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(data.get('password', 'password123')).decode('utf-8')
        
        staff_users_collection.insert_one({
            "email": email,
            "name": data.get('name'),
            "password": hashed_password,
            "role": data.get('role', 'staff') # 'pharmacist', 'lab_tech', etc.
        })
        return jsonify({"message": "Staff member created successfully"}), 201

@app.route('/api/admin/staff/<staff_id>', methods=['PUT', 'DELETE'])
def manage_specific_staff(staff_id):
    if request.method == 'PUT':
        data = request.get_json()
        update_fields = {
            "name": data.get('name'),
            "email": data.get('email'),
            "role": data.get('role')
        }
        # Remove None values
        update_fields = {k: v for k, v in update_fields.items() if v is not None}
        
        staff_users_collection.update_one(
            {"_id": ObjectId(staff_id)},
            {"$set": update_fields}
        )
        return jsonify({"message": "Staff updated successfully"}), 200

    if request.method == 'DELETE':
        staff_users_collection.delete_one({"_id": ObjectId(staff_id)})
        return jsonify({"message": "Staff removed successfully"}), 200

# 4. VIEW ALL APPOINTMENTS
@app.route('/api/admin/appointments', methods=['GET'])
def get_all_appointments():
    all_appts = []
    # Sort by Date DESC
    for appt in appointments_collection.find().sort([("date", -1), ("time", -1)]):
        appt['_id'] = str(appt['_id'])
        
        # Update Doctor Name dynamically
        if 'doctorId' in appt:
            try:
                doctor = staff_users_collection.find_one({"_id": ObjectId(appt['doctorId'])})
                if doctor:
                    appt['doctorName'] = doctor.get('name', appt.get('doctorName'))
            except:
                pass # Keep original name if ID is invalid or not found

        # Update Student Name dynamically
        if 'studentId' in appt:
            student = university_students_collection.find_one({"studentId": appt['studentId']})
            if student:
                appt['studentName'] = student.get('name', appt.get('studentName'))

        all_appts.append(appt)
    return jsonify(all_appts), 200

# 5. DELETE APPOINTMENT (ADMIN)
@app.route('/api/admin/appointment/<appointment_id>', methods=['DELETE'])
def delete_appointment_admin(appointment_id):
    result = appointments_collection.delete_one({"_id": ObjectId(appointment_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Appointment deleted successfully"}), 200
    else:
        return jsonify({"error": "Appointment not found"}), 404


# --- 4. STAFF AUTHENTICATION API ROUTES ---

# REGISTER a new staff member (Admin-only task)
@app.route('/api/staff/register', methods=['POST'])
def staff_register():
    data = request.get_json()
    email = data['email']
    
    # Check if user already exists
    existing_user = staff_users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "Email already exists"}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    staff_users_collection.insert_one({
        "email": email,
        "name": data['name'],
        "password": hashed_password,
        "role": "doctor" # We can set a default role
    })
    
    return jsonify({"message": "Staff user created successfully"}), 201

# LOGIN for staff
@app.route('/api/staff/login', methods=['POST'])
def staff_login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    
    user = staff_users_collection.find_one({"email": email})
    
    # Check if user exists and password is correct
    if user and bcrypt.check_password_hash(user['password'], password):
        # We will add a JWT token here later
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": str(user['_id']),
                "name": user['name'],
                "email": user['email'],
                "role": user['role'],
                "startTime": user.get('startTime', '09:00'),
                "endTime": user.get('endTime', '17:00')
            }
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

# UPDATE Availability (Doctor)
@app.route('/api/doctor/availability', methods=['POST'])
def update_availability():
    data = request.get_json()
    doctor_id = data.get('doctorId')
    start_time = data.get('startTime')
    end_time = data.get('endTime')

    result = staff_users_collection.update_one(
        {"_id": ObjectId(doctor_id)},
        {"$set": {"startTime": start_time, "endTime": end_time}}
    )
    
    return jsonify({"message": "Availability updated successfully"}), 200

# CANCEL Appointment
@app.route('/api/appointments/cancel', methods=['POST'])
def cancel_appointment():
    data = request.get_json()
    appointment_id = data.get('appointmentId')
    
    appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": "Cancelled"}}
    )
    
    return jsonify({"message": "Appointment cancelled successfully"}), 200
    
    # --- 5. TEMP ADMIN HELPER ---
# We will use this ONE TIME to create our first doctor
@app.route('/api/admin/create-first-doctor')
def create_first_doctor():
    # Check if a doctor already exists
    if staff_users_collection.find_one({"email": "dr.venkat@svu.edu"}):
        return "Doctor Venkat already exists."

    # Hash a password
    hashed_password = bcrypt.generate_password_hash("password123").decode('utf-8')
    
    # Insert the new doctor
    staff_users_collection.insert_one({
        "email": "dr.venkat@svu.edu",
        "name": "Dr. Venkat Rao",
        "password": hashed_password,
        "role": "doctor",
        "specialization": "Senior Doctor - General Medicine"
    })
    return "Dr. Venkat created with password 'password123'."

@app.route('/api/admin/create-first-pharmacist')
def create_first_pharmacist():
    if staff_users_collection.find_one({"email": "pharmacist.meena@svu.edu"}):
        return "Pharmacist already exists."

    hashed_password = bcrypt.generate_password_hash("password123").decode('utf-8')
    
    staff_users_collection.insert_one({
        "email": "pharmacist.meena@svu.edu",
        "name": "Ms. Meena Kumari",
        "password": hashed_password,
        "role": "pharmacist"
    })
    return "Pharmacist Meena created with password 'password123'."

@app.route('/api/admin/create-first-labtech')
def create_first_labtech():
    if staff_users_collection.find_one({"email": "labtech.ravi@svu.edu"}):
        return "Lab Tech already exists."

    hashed_password = bcrypt.generate_password_hash("password123").decode('utf-8')
    
    staff_users_collection.insert_one({
        "email": "labtech.ravi@svu.edu",
        "name": "Mr. Ravi Kumar",
        "password": hashed_password,
        "role": "lab_tech"
    })
    return "Lab Tech Ravi created with password 'password123'."

# ... (Collections moved to top)

# ... (All your existing Patient and Staff API routes are fine) ...

# 2. ADMIN DASHBOARD STATS
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    # Total Users = Registered Students + All Staff (Doctors, Pharmacists, etc.)
    student_count = student_users_collection.count_documents({})
    staff_count = staff_users_collection.count_documents({})
    total_users = student_count + staff_count

    # Pending Appointments (Upcoming based on time)
    # We need to filter for appointments that are in the future
    all_appts = appointments_collection.find()
    pending_count = 0
    now = datetime.now()

    for appt in all_appts:
        try:
            # Combine date and time strings to a datetime object
            # Assumption: date is "YYYY-MM-DD", time is "HH:MM"
            appt_dt_str = f"{appt['date']} {appt['time']}"
            appt_dt = datetime.strptime(appt_dt_str, "%Y-%m-%d %H:%M")
            
            # Check if it's in the future and NOT cancelled
            if appt_dt > now and appt.get('status') != 'Cancelled':
                pending_count += 1
        except Exception:
            # Skip invalid dates
            continue

    # Total Doctors
    total_doctors = staff_users_collection.count_documents({"role": "doctor"})

    return jsonify({
        "total_users": total_users,
        "pending_bookings": pending_count, # Kept key same to minimize frontend breakages, or update frontend too
        "total_doctors": total_doctors
    }), 200

# --- 6. STUDENT AUTHENTICATION API ROUTES ---

# This route just checks if the student is in the university records
@app.route('/api/student/verify', methods=['POST'])
def student_verify():
    data = request.get_json()
    student_id = data.get('studentId')
    phone = data.get('phone')

    # Check the "university records"
    student = university_students_collection.find_one({
        "studentId": student_id,
        "registeredPhone": phone
    })

    if not student:
        return jsonify({"error": "Student ID or Phone Number not found in university records. Please ask your admin to add your data."}), 404

    # Now, check if this student has *already* created a portal account
    account_exists = student_users_collection.find_one({"studentId": student_id})
    if account_exists:
        return jsonify({"error": "This student account has already been activated. Please go to the login page."}), 400

    # If they exist and haven't activated, send success
    return jsonify({
        "message": "Student verified successfully.",
        "studentId": student.get('studentId'),
        "name": student.get('name')
    }), 200

# This route creates the new login account after verification
@app.route('/api/student/create-account', methods=['POST'])
def student_create_account():
    data = request.get_json()
    student_id = data.get('studentId')
    password = data.get('password')

    # Double-check that this student hasn't already created an account
    if student_users_collection.find_one({"studentId": student_id}):
        return jsonify({"error": "Account already exists."}), 400

    # Hash the new password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create the new user in the `student_users` collection
    student_users_collection.insert_one({
        "studentId": student_id,
        "password": hashed_password
        # You could also add a name here if you wanted
    })

    return jsonify({"message": "Student account created successfully! You can now log in."}), 201

# --- 7. ADMIN - MANAGE UNIVERSITY STUDENTS ---

# GET ALL / ADD SINGLE STUDENT
@app.route('/api/admin/university-students', methods=['GET', 'POST'])
def manage_university_students():
    if request.method == 'GET':
        students = []
        for s in university_students_collection.find():
            s['_id'] = str(s['_id'])
            students.append(s)
        return jsonify(students), 200

    if request.method == 'POST':
        data = request.get_json()
        student_id = data.get('studentId')
        
        if university_students_collection.find_one({"studentId": student_id}):
            return jsonify({"error": "Student ID already exists"}), 400

        university_students_collection.insert_one({
            "studentId": student_id,
            "name": data.get('name'),
            "registeredPhone": data.get('phone'), # Using 'registeredPhone' to match verification logic
            "addedAt": datetime.now()
        })
        return jsonify({"message": "Student added successfully"}), 201

# BULK UPLOAD STUDENTS (CSV)
@app.route('/api/admin/university-students/upload', methods=['POST'])
def upload_university_students():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        try:
            # Read CSV file
            stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
            csv_input = csv.DictReader(stream)
            
            count = 0
            errors = []
            
            for row in csv_input:
                # Expecting headers: studentId, name, phone
                s_id = row.get('studentId')
                name = row.get('name')
                phone = row.get('phone')

                if s_id and name and phone:
                    # Update if exists, Insert if new (Upsert)
                    university_students_collection.update_one(
                        {"studentId": s_id},
                        {"$set": {
                            "name": name, 
                            "registeredPhone": phone,
                            "updatedAt": datetime.now()
                        }},
                        upsert=True
                    )
                    count += 1
                else:
                    errors.append(f"Skipped row: {row}")

            return jsonify({"message": f"Processed {count} students successfully.", "errors": errors}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to process CSV: {str(e)}"}), 500

# DELETE STUDENT
@app.route('/api/admin/university-students/<student_id>', methods=['DELETE'])
def delete_university_student(student_id):
    # 1. FIND the student first to get the correct ID
    student_to_delete = None
    
    # Try by ObjectId
    try:
        student_to_delete = university_students_collection.find_one({"_id": ObjectId(student_id)})
    except:
        pass
    
    # Try by studentId string if not found
    if not student_to_delete:
        student_to_delete = university_students_collection.find_one({"studentId": student_id})
        
    if not student_to_delete:
        return jsonify({"error": "Student not found"}), 404
        
    # 2. DELETE from Roster
    university_students_collection.delete_one({"_id": student_to_delete['_id']})
    
    # 3. DELETE from Accounts (Login)
    # The studentId field is the link between the two collections
    actual_student_id_str = student_to_delete.get('studentId')
    if actual_student_id_str:
        student_users_collection.delete_one({"studentId": actual_student_id_str})
        
    return jsonify({"message": "Student and associated account removed successfully"}), 200

# --- 7. STUDENT LOGIN ROUTE ---
@app.route('/api/student/login', methods=['POST'])
def student_login():
    data = request.get_json()
    student_id = data.get('studentId')
    password = data.get('password')
    
    # Find the student in the registered users collection
    user = student_users_collection.find_one({"studentId": student_id})
    
    # Check password
    if user and bcrypt.check_password_hash(user['password'], password):
        # We also want to get their real name from the university records
        # to show a nice "Welcome, Alice" message
        student_details = university_students_collection.find_one({"studentId": student_id})
        name = student_details['name'] if student_details else "Student"
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "name": name,
                "studentId": user['studentId'],
                "role": "student"
            }
        }), 200
    else:
        return jsonify({"error": "Invalid Student ID or Password"}), 401
    
# --- 8. STUDENT PASSWORD RESET ---
@app.route('/api/student/verify-reset', methods=['POST'])
def student_verify_reset():
    data = request.get_json()
    student_id = data.get('studentId')
    phone = data.get('phone')

    # 1. Check University Records (Identity)
    student = university_students_collection.find_one({
        "studentId": student_id,
        "registeredPhone": phone
    })
    
    if not student:
        return jsonify({"error": "Identity verification failed. Invalid ID or Phone."}), 404

    # 2. Check if Account Exists (Logic: Can't reset what doesn't exist)
    account = student_users_collection.find_one({"studentId": student_id})
    if not account:
        return jsonify({"error": "Account not found. Please 'Activate Student Account' first."}), 404

    return jsonify({
        "message": "Identity verified",
        "studentId": student_id,
        "name": student['name']
    }), 200

@app.route('/api/student/reset-password', methods=['POST'])
def student_reset_password():
    data = request.get_json()
    student_id = data.get('studentId')
    password = data.get('password')

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    result = student_users_collection.update_one(
        {"studentId": student_id},
        {"$set": {"password": hashed_password}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Account not found."}), 404
    
    return jsonify({"message": "Password reset successfully. You can now login."}), 200
    
    # --- 8. APPOINTMENT ROUTES ---

# Get a list of all Doctors (for the dropdown menu)
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = []
    # Find all users with role 'doctor'
    for doc in staff_users_collection.find({"role": "doctor"}):
        doctors.append({
            "id": str(doc['_id']),
            "name": doc['name'],
            "email": doc.get('email'),
            "specialization": doc.get('specialization', 'General Physician') # Default if missing
        })
    return jsonify(doctors), 200

# Book a new appointment
@app.route('/api/appointments', methods=['POST'])
def book_appointment():
    try:
        data = request.get_json()
        print(f"[BOOKING ATTEMPT] Data: {data}")
        
        doctor_id = data.get('doctorId')
        date = data.get('date')
        time = data.get('time')
        student_id = data.get('studentId')

        if not all([doctor_id, date, time, student_id]):
            print("[BOOKING FAILED] Missing fields")
            return jsonify({"error": "Missing required fields"}), 400

        # --- DOUBLE BOOKING PREVENTION CHECK ---
        existing_appt = appointments_collection.find_one({
            "doctorId": doctor_id,
            "date": date,
            "time": time
        })
        
        if existing_appt:
            print(f"[BOOKING FAILED] Slot occupied: Doc={doctor_id} Date={date} Time={time}")
            return jsonify({"error": "This slot has already been booked! Please choose another."}), 409

        # Insert into DB
        new_appt = {
            "studentId": student_id,
            "studentName": data.get('studentName', 'Unknown'),
            "doctorId": doctor_id,
            "doctorName": data.get('doctorName', 'Unknown'),
            "date": date,
            "time": time,
            "reason": data.get('reason', ''),
            "status": "Scheduled"
        }
        
        result = appointments_collection.insert_one(new_appt)
        print(f"[BOOKING SUCCESS] ID: {result.inserted_id}")
        
        return jsonify({"message": "Appointment booked successfully!"}), 201
    except Exception as e:
        print(f"[BOOKING ERROR] Exception: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# Get appointments for a specific student (History)
@app.route('/api/appointments/student/<student_id>', methods=['GET'])
def get_student_appointments(student_id):
    my_appointments = []
    # Sort by Date DESC, then Time ASC (or DESC?)
    # "Recent dates at top" -> Date DESC. 
    # For same day, usually later time is "more recent" or earlier? 
    # Let's do Date DESC, Time DESC for consistent "Newest first" view
    for appt in appointments_collection.find({"studentId": student_id}).sort([("date", -1), ("time", -1)]):
        appt['_id'] = str(appt['_id'])
        my_appointments.append(appt)
    return jsonify(my_appointments), 200

# Get appointments for a specific DOCTOR
@app.route('/api/appointments/doctor/<doctor_id>', methods=['GET'])
def get_doctor_appointments(doctor_id):
    doc_appointments = []
    # Sort by Date DESC, Time ASC (Upcoming first for future? but user asked for Recent "top" -> Descending)
    # Let's stick to true Descending (Latest date/time at top)
    for appt in appointments_collection.find({"doctorId": doctor_id}).sort([("date", -1), ("time", -1)]):
        appt['_id'] = str(appt['_id'])
        doc_appointments.append(appt)
    return jsonify(doc_appointments), 200

# --- 10. UNAVAILABILITY ROUTES (NEW) ---

@app.route('/api/doctor/unavailable', methods=['POST'])
def set_unavailable_dates():
    data = request.get_json()
    doctor_id = data.get('doctorId')
    date_str = data.get('date') # Single date to toggle
    
    if not doctor_id or not date_str:
        return jsonify({"error": "Missing doctorId or date"}), 400

    doctor = staff_users_collection.find_one({"_id": ObjectId(doctor_id)})
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
        
    current_unavailable = doctor.get('unavailableDates', [])
    
    if date_str in current_unavailable:
        # Remove it (Toggle OFF)
        staff_users_collection.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$pull": {"unavailableDates": date_str}}
        )
        return jsonify({"message": "Date removed from unavailable list", "action": "removed"}), 200
    else:
        # Add it (Toggle ON)
        staff_users_collection.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$addToSet": {"unavailableDates": date_str}}
        )
        return jsonify({"message": "Date marked as unavailable", "action": "added"}), 200

@app.route('/api/doctor/unavailable/<doctor_id>', methods=['GET'])
def get_unavailable_dates(doctor_id):
    doctor = staff_users_collection.find_one({"_id": ObjectId(doctor_id)})
    if not doctor:
         return jsonify([]), 404
         
    return jsonify(doctor.get('unavailableDates', [])), 200


# --- 11. SLOT SCHEDULING ROUTES ---

# Helper function to generate time slots
def generate_slots(date_str, morning_start, morning_end, evening_start, evening_end):
    slots = []
    
    # 1. MORNING SESSION
    current_time = datetime.strptime(f"{date_str} {morning_start}", "%Y-%m-%d %H:%M")
    end_time_morning = datetime.strptime(f"{date_str} {morning_end}", "%Y-%m-%d %H:%M")
    
    while current_time < end_time_morning:
        slots.append(current_time.strftime("%H:%M"))
        current_time += timedelta(minutes=15)

    # 2. EVENING SESSION
    current_time = datetime.strptime(f"{date_str} {evening_start}", "%Y-%m-%d %H:%M")
    end_time_evening = datetime.strptime(f"{date_str} {evening_end}", "%Y-%m-%d %H:%M")
    
    while current_time < end_time_evening:
        slots.append(current_time.strftime("%H:%M"))
        current_time += timedelta(minutes=15)
        
    return slots

@app.route('/api/slots', methods=['POST'])
def get_available_slots():
    data = request.get_json()
    doctor_id = data.get('doctorId')
    date_str = data.get('date') # Format: YYYY-MM-DD

    if not doctor_id or not date_str:
        return jsonify([]), 400

    # 0. Get Doctor's Details
    doctor = staff_users_collection.find_one({"_id": ObjectId(doctor_id)})
    if not doctor:
        return jsonify([]), 404
        
    # CHECK UNAVAILABILITY FIRST
    unavailable_dates = doctor.get('unavailableDates', [])
    if date_str in unavailable_dates:
        return jsonify([]), 200

    # Get dual session times (with defaults)
    morning_start = doctor.get('morningStart', '09:00')
    morning_end = doctor.get('morningEnd', '13:00')
    evening_start = doctor.get('eveningStart', '17:00')
    evening_end = doctor.get('eveningEnd', '21:00')

    # 1. Generate all possible slots for that day (Morning + Evening)
    all_slots = generate_slots(date_str, morning_start, morning_end, evening_start, evening_end)

    # 2. Find booked appointments for this Doctor on this Date
    booked_cursor = appointments_collection.find({
        "doctorId": doctor_id,
        "date": date_str,
        "status": { "$ne": "Cancelled" } 
    })
    
    booked_times = [appt['time'] for appt in booked_cursor]

    # 3. Filter: Available = All - Booked
    available_slots = [time for time in all_slots if time not in booked_times]

    return jsonify(available_slots), 200

# --- 10. PRESCRIPTION ROUTES ---

prescriptions_collection = db.prescriptions

# Create a new prescription
@app.route('/api/prescriptions', methods=['POST'])
def create_prescription():
    data = request.get_json()
    
    # Basic validation
    required_fields = ['studentId', 'doctorId', 'medications', 'date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    prescription = {
        "studentId": data['studentId'],
        "studentName": data.get('studentName', 'Unknown'), # Optional but helpful
        "doctorId": data['doctorId'],
        "doctorName": data.get('doctorName', 'Unknown'),
        "date": data['date'],
        "diagnosis": data.get('diagnosis', ''),
        "medications": data['medications'], # List of objects: { name, dosage, frequency, duration }
        "notes": data.get('notes', ''),
        "status": "Pending" if data.get('referToPharmacist') else "Private", # NEW: Status for Pharmacy
        "createdAt": datetime.now()
    }

    result = prescriptions_collection.insert_one(prescription)
    
    return jsonify({
        "message": "Prescription created successfully", 
        "id": str(result.inserted_id)
    }), 201

# Get prescriptions for a student
@app.route('/api/prescriptions/student/<student_id>', methods=['GET'])
def get_student_prescriptions(student_id):
    prescriptions = []
    # Sort by date descending (newest first)
    cursor = prescriptions_collection.find({"studentId": student_id}).sort("date", -1)
    
    for p in cursor:
        p['_id'] = str(p['_id'])
        prescriptions.append(p)
        
    return jsonify(prescriptions), 200

# Get Pending Prescriptions for Pharmacy
@app.route('/api/pharmacy/queue', methods=['GET'])
def get_pharmacy_queue():
    pending = []
    cursor = prescriptions_collection.find({"status": "Pending"}).sort("date", -1)
    for p in cursor:
        p['_id'] = str(p['_id'])
        pending.append(p)
    return jsonify(pending), 200

# Get Pharmacy Stats (Pending Count, Dispensed Today Count)
@app.route('/api/pharmacy/stats', methods=['GET'])
def get_pharmacy_stats():
    pending_count = prescriptions_collection.count_documents({"status": "Pending"})
    
    today_start = datetime.now().strftime("%Y-%m-%d")
    # Assuming we track dispensed date. If not, we rely on 'date' or updated_at. 
    # For now, let's assume 'dispensedAt' is set when dispensing.
    # If not set, we might need to rely on 'date' if dispensed same day.
    # Safest is to check 'dispensedDate' field which we will set.
    
    dispensed_today_count = prescriptions_collection.count_documents({
        "status": "Dispensed",
        "dispensedDate": today_start
    })
    
    return jsonify({
        "pending": pending_count,
        "dispensedToday": dispensed_today_count
    }), 200

# Dispense Prescription
@app.route('/api/pharmacy/dispense/<prescription_id>', methods=['POST'])
def dispense_prescription(prescription_id):
    try:
        updated = prescriptions_collection.update_one(
            {"_id": ObjectId(prescription_id)},
            {
                "$set": {
                    "status": "Dispensed",
                    "dispensedDate": datetime.now().strftime("%Y-%m-%d"),
                    "dispensedAt": datetime.now()
                }
            }
        )
        if updated.modified_count == 1:
            return jsonify({"message": "Prescription Dispensed Successfully"}), 200
        else:
            return jsonify({"error": "Prescription not found or already dispensed"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 11. LAB REPORTS ROUTES ---

# Upload a Lab Report (Lab Tech Only)
@app.route('/api/lab/upload', methods=['POST'])
def upload_lab_report():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    student_id = request.form.get('studentId')
    test_name = request.form.get('testName')
    remarks = request.form.get('remarks', '')
    lab_tech_id = request.form.get('labTechId') # ID of uploader

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        # Add timestamp to filename to prevent duplicates
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))

        # Save metadata to DB
        
    # Optional: Link to a Request ID if provided
    request_id = request.form.get('requestId')
    
    report = {
        "studentId": student_id,
        "labTechId": request.form.get('labTechId'),
        "testName": request.form.get('testName'),
        "filename": unique_filename, # Corrected to unique_filename
        "remarks": request.form.get('remarks', ''),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "requestId": request_id # Link to request
    }
    
    result = lab_reports_collection.insert_one(report)
    
    # If linked to a request, mark request as Completed and link report ID
    if request_id:
        lab_requests_collection.update_one(
            {"_id": ObjectId(request_id)},
            {
                "$set": {
                    "status": "Completed", 
                    "reportId": str(result.inserted_id),
                    "completedAt": datetime.now()
                }
            }
        )
    
    return jsonify({"message": "Report uploaded successfully!"}), 201

# Get Reports for a Student
@app.route('/api/lab/reports/<student_id>', methods=['GET'])
def get_student_reports(student_id):
    reports = []
    for r in lab_reports_collection.find({"studentId": student_id}).sort("createdAt", -1):
        r['_id'] = str(r['_id'])
        reports.append(r)
    return jsonify(reports), 200

# --- 11b. LAB REQUEST ROUTES (DOCTOR -> LAB) ---

@app.route('/api/lab/request', methods=['POST'])
def create_lab_request():
    data = request.get_json()
    
    # Required: studentId, doctorId, testType
    if not data.get('studentId') or not data.get('testType'):
        return jsonify({"error": "Missing required fields"}), 400
        
    lab_request = {
        "studentId": data['studentId'],
        "studentName": data.get('studentName', 'Unknown'),
        "doctorId": data['doctorId'],
        "doctorName": data.get('doctorName', 'Unknown'),
        "testType": data['testType'], # e.g. "Blood Test", "X-Ray"
        "notes": data.get('notes', ''),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "status": "Pending", # Pending -> Completed
        "createdAt": datetime.now()
    }
    
    lab_requests_collection.insert_one(lab_request)
    return jsonify({"message": "Lab request sent successfully!"}), 201

@app.route('/api/lab/requests', methods=['GET'])
def get_all_lab_requests():
    # For Lab Tech View (Pending first)
    requests = []
    # Sort Pending first, then by date desc
    for req in lab_requests_collection.find().sort([("status", 1), ("createdAt", -1)]):
        req['_id'] = str(req['_id'])
        requests.append(req)
    return jsonify(requests), 200

# Get Lab Stats (Pending vs Completed)
@app.route('/api/lab/stats', methods=['GET'])
def get_lab_stats():
    pending = lab_requests_collection.count_documents({"status": "Pending"})
    completed = lab_requests_collection.count_documents({"status": "Completed"})
    return jsonify({"pending": pending, "completed": completed}), 200

@app.route('/api/lab/requests/student/<student_id>', methods=['GET'])
def get_student_lab_requests(student_id):
    requests = []
    # Sort by date desc
    for req in lab_requests_collection.find({"studentId": student_id}).sort("createdAt", -1):
        req['_id'] = str(req['_id'])
        requests.append(req)
    return jsonify(requests), 200

# Get Doctor Stats (Queue, Completed Today, Total Unique Patients)
@app.route('/api/doctor/stats/<doctor_id>', methods=['GET'])
def get_doctor_stats(doctor_id):
    today = datetime.now().strftime("%Y-%m-%d")
    
    # 1. Patients in Queue (Today's Pending/Scheduled)
    queue_count = appointments_collection.count_documents({
        "doctorId": doctor_id,
        "date": today,
        "status": {"$in": ["Scheduled", "Pending"]} 
    })
    
    # 2. Completed Today
    completed_today = appointments_collection.count_documents({
        "doctorId": doctor_id,
        "date": today,
        "status": "Completed"
    })
    
    # 3. Total Patients (Unique Student IDs across all time)
    pipeline = [
        {"$match": {"doctorId": doctor_id}},
        {"$group": {"_id": "$studentId"}},
        {"$count": "total"}
    ]
    cursor = list(appointments_collection.aggregate(pipeline))
    total_patients = cursor[0]['total'] if cursor else 0
    
    return jsonify({
        "queue": queue_count,
        "completedToday": completed_today,
        "totalPatients": total_patients
    }), 200

# Serve Uploaded Files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- RUN THE APP ---
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
