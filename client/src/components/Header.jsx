import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, QrCode, Menu, Sun, Moon, Search } from 'lucide-react';
import * as notificationService from '../services/notificationService';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getNotifications();
        if (response.success) {
          const unread = response.data.filter(n => !n.isRead).length;
          setUnreadCount(unread > 0 ? unread : 1);
        }
      } catch (err) {
        console.error('Failed to load notifications count:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="header glass">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="mobile-logo">
          <QrCode size={24} className="brand-logo" />
          <span className="brand-name">CampusRecover</span>
        </div>
        <div className="desktop-greeting">
          <h2 className="greeting-text" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Kumar'}! 👋
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            Here's an overview of your belongings and activity.
          </p>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Search Action */}
        <button 
          onClick={() => navigate('/lost-found')}
          title="Search Lost & Found"
          style={{
            background: 'var(--bg-surface-opaque)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Search size={18} />
        </button>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'var(--bg-surface-opaque)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#8b5cf6' }} />}
        </button>

        {/* Notifications Bell */}
        <Link to="/notifications" className="notification-bell">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="bell-badge">{unreadCount}</span>
          )}
        </Link>
        
        {/* User Profile Circle Avatar */}
        <div 
          className="header-user-avatar" 
          onClick={() => navigate('/profile')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.05rem',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
        </div>
      </div>
    </header>
  );
};

export default Header;
