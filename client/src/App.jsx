import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyItems from './pages/MyItems';
import RegisterItem from './pages/RegisterItem';
import ItemDetails from './pages/ItemDetails';
import ItemQR from './pages/ItemQR';
import Scanner from './pages/Scanner';
import ScanResult from './pages/ScanResult';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import LostFound from './pages/LostFound';

// Helper Route Component to protect student paths
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: 'white' }}>
        <p>Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Helper Route Component to protect admin paths
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: 'white' }}>
        <p>Verifying administrator session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Dynamic Wrapper for Scanner views that adapts to authentication state
const ScanWrapper = ({ component: Component }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: 'white' }}>
        <p>Initializing scanner...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardLayout><Component /></DashboardLayout>;
  }

  // If not logged in, render on a public viewport
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="page-wrapper animate-fade-in">
        <Component />
      </div>
    </div>
  );
};

import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Landing Pages */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public Scan endpoints - Accessible without signing in */}
            <Route path="/scan" element={<ScanWrapper component={Scanner} />} />
            <Route path="/scan/:itemId" element={<ScanWrapper component={ScanResult} />} />

            {/* Authentication Pages */}
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />

            {/* Student Protected Pages */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/items" element={<ProtectedRoute><MyItems /></ProtectedRoute>} />
            <Route path="/items/add" element={<ProtectedRoute><RegisterItem /></ProtectedRoute>} />
            <Route path="/items/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
            <Route path="/items/:id/qr" element={<ProtectedRoute><ItemQR /></ProtectedRoute>} />
            <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/reports/:id" element={<ProtectedRoute><ReportDetails /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Protected Pages */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Fallbacks */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
