import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages (to be created)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import DoctorSearch from './pages/DoctorSearch';
import DoctorProfile from './pages/DoctorProfile';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import Team from './pages/Team';
import Chatbot from './pages/Chatbot';
import HealthVault from './pages/HealthVault';
import Payments from './pages/Payments';

// Components
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/doctors" element={<DoctorSearch />} />
                    <Route path="/doctor/:id" element={<DoctorProfile />} />
                    <Route path="/team" element={<Team />} />

                    {/* Common Protected Routes */}
                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute>
                                <Onboarding />
                            </ProtectedRoute>
                        }
                    />

                    {/* Patient Routes */}
                    <Route
                        path="/patient-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/book/:doctorId"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <BookAppointment />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/health-vault"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <HealthVault />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chatbot"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <Chatbot />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payments"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <Payments />
                            </ProtectedRoute>
                        }
                    />

                    {/* Doctor Routes */}
                    <Route
                        path="/doctor-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <DoctorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/appointments"
                        element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <DoctorDashboard defaultTab="appointments" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/medical-history"
                        element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <DoctorDashboard defaultTab="history" />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
