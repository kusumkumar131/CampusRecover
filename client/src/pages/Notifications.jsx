import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Clock, Eye } from 'lucide-react';
import * as notificationService from '../services/notificationService';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        // Update list locally
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleNotificationClick = (n) => {
    // If not read, mark as read
    if (!n.isRead) {
      handleMarkAsRead(n._id);
    }

    // Redirect to the related resource if available
    if (n.relatedReport) {
      navigate(`/reports/${n.relatedReport._id || n.relatedReport}`);
    } else if (n.relatedItem) {
      navigate(`/items/${n.relatedItem._id || n.relatedItem}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Stay updated on your belongings, scans, and messages.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <Bell size={48} style={{ color: 'var(--text-dark)', marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No notifications yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            You're all caught up. Alerts about your QR scans or recovery progress will show up here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(n => (
            <div 
              key={n._id}
              className={`glass ${n.isRead ? '' : 'unread-item'}`}
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
                borderLeft: n.isRead ? '1px solid var(--border-color)' : '4px solid var(--primary)',
                background: n.isRead ? 'var(--bg-surface-opaque)' : 'var(--bg-surface)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => handleNotificationClick(n)}
            >
              
              {/* Left icon & text info */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: n.isRead ? 'var(--bg-surface)' : 'var(--primary-glow)',
                  color: n.isRead ? 'var(--text-muted)' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Bell size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '1rem',
                    color: 'var(--text-main)',
                    fontWeight: n.isRead ? 600 : 700,
                    marginBottom: '0.25rem'
                  }}>
                    {n.title}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '0.5rem' }}>
                    <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action buttons (only show mark as read if unread) */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                {!n.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(n._id)} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem', borderRadius: '50%' }}
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  onClick={() => handleNotificationClick(n)}
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem', borderRadius: '50%' }}
                  title="View details"
                >
                  <Eye size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Notifications;
