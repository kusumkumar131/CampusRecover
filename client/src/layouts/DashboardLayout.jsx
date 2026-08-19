import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNavBar from '../components/BottomNavBar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar - Desktop visible, Mobile drawer on toggle */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Drawer overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 98
          }}
        />
      )}

      {/* Styled slide drawer for mobile */}
      <div 
        className={`sidebar-mobile-drawer ${sidebarOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : '-280px',
          width: '260px',
          height: '100vh',
          zIndex: 99,
          transition: 'left 0.3s ease',
          background: '#0a0a0f'
        }}
      >
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        <main className="page-wrapper animate-fade-in">
          {children}
        </main>
      </div>

      {/* Bottom Nav for mobile screens */}
      <BottomNavBar />
    </div>
  );
};

export default DashboardLayout;
