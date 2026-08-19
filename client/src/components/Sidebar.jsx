import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Package, 
  Search, 
  QrCode, 
  FileText, 
  Bell, 
  MessageSquare, 
  User, 
  ShieldAlert, 
  LogOut,
  ArrowRight
} from 'lucide-react';

const Sidebar = () => {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={21} /> },
    { path: '/items', label: 'My Items', icon: <Package size={21} /> },
    { path: '/lost-found', label: 'Lost & Found', icon: <Search size={21} /> },
    { path: '/scan', label: 'Scan QR', icon: <QrCode size={21} /> },
    { path: '/reports', label: 'My Reports', icon: <FileText size={21} /> },
    { path: '/notifications', label: 'Notifications', icon: <Bell size={21} />, badge: '1' },
    { path: '/messages', label: 'Messages', icon: <MessageSquare size={21} /> },
    { path: '/profile', label: 'Profile', icon: <User size={21} /> },
  ];

  return (
    <aside className="sidebar glass">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-square">
          <QrCode size={22} />
        </div>
        <span className="brand-name">CampusRecover</span>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span className="nav-badge-pill">{item.badge}</span>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `menu-item admin-item ${isActive ? 'active' : ''}`}
          >
            <ShieldAlert size={21} />
            <span>Admin System</span>
          </NavLink>
        )}

        {/* Logout Action (Right below Profile) */}
        <button onClick={handleLogout} className="menu-item logout-btn">
          <LogOut size={21} />
          <span>Logout</span>
        </button>
      </nav>

      {/* 3D Sidebar Promo Box (Below Logout, pinned at bottom) */}
      <div className="sidebar-promo-card">
        <img 
          src="/images/sidebar_promo.png" 
          alt="Protect What Matters" 
          className="sidebar-promo-img"
        />
        <h4 className="sidebar-promo-title">Protect what matters.</h4>
        <p className="sidebar-promo-desc">
          Register your items and let us help you get them back.
        </p>
        <button 
          onClick={() => navigate('/items/add')} 
          className="btn-sidebar-promo"
        >
          Get Started <ArrowRight size={14} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
