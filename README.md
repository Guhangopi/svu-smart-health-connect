# SVU Smart Health Connect

**SmartHealthConnect** is a comprehensive university health management system designed to streamline healthcare services for students, doctors, pharmacists, lab technicians, and administrators at SV University. The platform digitizes medical records, appointment scheduling, prescription management, and lab report processing.

## 🚀 Key Features

### For Students
- **Dashboard**: View upcoming appointments and recent prescriptions.
- **Appointments**: Book, view, and manage appointments with university doctors.
- **Medical Records**: Access digital prescriptions and lab reports.
- **Profile**: Manage personal details.

### For Doctors
- **Appointment Management**: View scheduled appointments and patient history.
- **Digital Prescriptions**: Create and issue digital prescriptions instantly.
- **Availability**: Manage working hours and mark unavailable dates.
- **Patient History**: Access past medical records of students.

### For Pharmacists
- **Prescription Fulfillment**: View patient prescriptions and dispense medicines.
- **Search**: Quickly find prescriptions using Student IDs.

### For Lab Technicians
- **Report Management**: Upload digital lab reports (PDF/Images).
- **History**: View past uploaded reports.

### For Administrators
- **User Management**: Manage doctors, staff accounts, and student records.
- **System Overview**: Monitor overall system usage and health.

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern UI library for building interactive interfaces.
- **Vite**: Fast build tool and development server.
- **Bootstrap 5.3**: Responsive styling framework.
- **React Router Dom 7**: For seamless client-side navigation.
- **Axios**: For handling API requests.
- **React Toastify**: For user notifications.

### Backend
- **Python Flask**: Lightweight and flexible backend framework.
- **MongoDB**: NoSQL database for flexible data storage.
- **PyMongo**: Python driver for MongoDB.
- **Flask-Bcrypt**: For secure password hashing.
- **Flask-Cors**: Handling Cross-Origin Resource Sharing.
- **Python-Dotenv**: Environment variable management.

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **MongoDB** (Local instance or Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SmartHealthConnect
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

**Environment Configuration:**
Create a `.env` file in the `backend` folder with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/smarthealthconnect
SECRET_KEY=your_secret_key_here
```

Run the backend server:
```bash
python app.py
```
> The server will start at `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
> The application will run at `http://localhost:5173` (or similar).

## 🧪 Usage

1. **First Run**: Ensure your MongoDB instance is running.
2. **Admin Setup**: You may need to seed the database with an initial admin or doctor account using the provided API endpoints in `app.py` (e.g., `/api/admin/create-first-admin`) if no UI is available for initial setup.
3. **Login**: Access the portals via the specific login pages for Students (`/login`) or Staff (`/staff-login`).

## 📂 Project Structure

```
SmartHealthConnect/
├── backend/                # Flask Backend
│   ├── app.py              # Main application entry point
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # Directory for uploaded lab reports
│   └── ...
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages (Portals, Home, etc.)
│   │   └── ...
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
└── README.md               # Project documentation
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.
