import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import LandingPage from './LandingPage';
import RegistrationPage from './components/RegistrationPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CMSProvider, useCMS } from './context/CMSContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';
import './Biometric.css';

// Blocks back-navigation out of admin pages
const AdminRouteGuard = ({ children }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;
  return children;
};

const DashboardGuard = ({ children }) => {
  return children;
};

function MainApp() {
  const { loading } = useCMS();
  const { logoutAdmin } = useAuth();

  if (loading) return <div className="loader-container"><span className="loader"></span></div>;

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <DashboardGuard>
              <Dashboard onLogout={() => logoutAdmin()} />
            </DashboardGuard>
          } />
          <Route path="/register/:eventId" element={<RegistrationPage />} />

          {/* Admin Routes — all tabs are sub-paths */}
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin/:tab" element={
            <AdminRouteGuard>
              <AdminPanel onLogout={() => logoutAdmin()} />
            </AdminRouteGuard>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CMSProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </CMSProvider>
    </AuthProvider>
  );
}

export default App;
