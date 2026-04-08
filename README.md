# College Assessment Tracking (CAT) Portal

A professional MERN stack application for managing Continuous Assessment Test (CAT) marks at King's College of Engineering.

## 🚀 Key Features
- **Assessment Grid**: Bulk entry of marks with roll number ranges and subject management.
- **Individual Report**: Subject-wise mark entry for staff.
- **Analytics & Insights**: Performance visualization and fail distribution analysis.
- **Search Portal**: Student result search by Reg Number or Name.
- **Role-Based Access**: Specialized views for HOD, Staff, and Students.

## 🛠️ Project Structure
- `/src`: Frontend React application (built with Vite).
- `/backend`: Node.js/Express backend API.
- `/backend/models`: Mongoose database schemas.
- `/backend/routes`: API endpoint handlers.

## ⚙️ Setup Instructions

### 1. Backend Configuration
Navigate to the `backend` folder and create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 2. Installation
Run the following commands in the root directory:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Running the Application
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### 🔍 Database Initialization
Upon completion of the first backend run with a valid `MONGODB_URI`, the system will automatically:
1. Create a default HOD account (`hod@kce.edu` / `Admin@123`).
2. Seed the CSE Department subjects.
3. Seed the initial student name list for II and III Year.

## 📦 Persistence
The application uses **MongoDB Atlas** for primary storage. It also includes an **Offline Demo Mode** using `db.json` as a fallback if the database connection fails.
