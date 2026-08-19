import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  QrCode, 
  MessageSquare, 
  User 
} from 'lucide-react';

const BottomNavBar = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mobile-bottom-bar">
      <NavLink to="/dashboard" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/items" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
        <Package size={20} />
        <span>Items</span>
      </NavLink>

      <NavLink to="/scan" className={({ isActive }) => `mobile-tab scan-tab ${isActive ? 'active' : ''}`}>
        <div className="scan-glow-btn">
          <QrCode size={24} />
        </div>
      </NavLink>

      <NavLink to="/messages" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
        <MessageSquare size={20} />
        <span>Chats</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNavBar;
