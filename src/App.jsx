import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Subjects from './pages/Subjects';
import Students from './pages/Students';
import Reports from './pages/Reports';
import SearchPortal from './pages/SearchPortal';
import IndividualReport from './pages/IndividualReport';
import TimeTable from './pages/TimeTable';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/search" element={<SearchPortal />} />
                    
                    <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                    <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
                    <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
                    <Route path="/subjects" element={<PrivateRoute><Layout><Subjects /></Layout></PrivateRoute>} />
                    <Route path="/students" element={<PrivateRoute><Layout><Students /></Layout></PrivateRoute>} />
                    <Route path="/individual-report" element={<PrivateRoute><Layout><IndividualReport /></Layout></PrivateRoute>} />
                    <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
                    <Route path="/timetable" element={<PrivateRoute><Layout><TimeTable /></Layout></PrivateRoute>} />
                    
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

