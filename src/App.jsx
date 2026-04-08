import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import StudentsPage from './components/StudentsPage';
import StudentSearch from './components/StudentSearch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<StudentSearch />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<div className="p-6"><h2>Dashboard Overview</h2></div>} />
          <Route path="analytics" element={<div className="p-6"><h2>Analytics</h2></div>} />
          <Route path="subjects" element={<div className="p-6"><h2>Subjects</h2></div>} />
          <Route path="students" element={<StudentsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
