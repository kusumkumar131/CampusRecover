import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

const AuthLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // If already logged in, redirect to dashboard immediately
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div 
      className="auth-layout"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Top right Theme Toggle */}
      <button 
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'var(--bg-surface-opaque)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {theme === 'dark' ? <Sun size={20} style={{ color: '#f59e0b' }} /> : <Moon size={20} style={{ color: '#8b5cf6' }} />}
      </button>

      <div 
        className="auth-container glass"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg-surface-opaque)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
