import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckSquare, 
  Percent, 
  Trash2, 
  UserMinus, 
  UserCheck, 
  RefreshCw 
} from 'lucide-react';
import * as adminService from '../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics', 'users', 'reports'
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMetricsAndAnalytics = async () => {
    try {
      const response = await adminService.getAdminDashboard();
      if (response.success) {
        setMetrics(response.data.metrics);
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminService.getAdminUsers();
      if (response.success) {
        setUsersList(response.data);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    }
  };

  const loadReports = async () => {
    try {
      const response = await adminService.getAdminReports();
      if (response.success) {
        setReportsList(response.data);
      }
    } catch (err) {
      console.error('Failed to load admin reports:', err);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    await Promise.all([
      loadMetricsAndAnalytics(),
      loadUsers(),
      loadReports()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleToggleSuspendUser = async (id, name) => {
    const confirm = window.confirm(`Are you sure you want to change the suspension status for ${name}?`);
    if (!confirm) return;

    setActionLoading(true);
    try {
      const response = await adminService.toggleSuspendUser(id);
      if (response.success) {
        alert(response.message);
        loadUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user suspension');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async (id, itemName) => {
    const confirm = window.confirm(`Are you sure you want to delete the report for "${itemName}"? This will reset the item status to ACTIVE.`);
    if (!confirm) return;

    setActionLoading(true);
    try {
      const response = await adminService.deleteReport(id);
      if (response.success) {
        alert(response.message);
        loadReports();
        loadMetricsAndAnalytics(); // Reload metrics too
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading administrator systems...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={28} style={{ color: '#fb7185' }} /> Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            System overview, recovery analytics, user moderations, and reports pruning.
          </p>
        </div>
        <button onClick={loadAllAdminData} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('metrics')}
          className="btn"
          style={{
            background: activeSubTab === 'metrics' ? 'rgba(251, 113, 133, 0.15)' : 'none',
            color: activeSubTab === 'metrics' ? '#fb7185' : 'var(--text-muted)',
            border: activeSubTab === 'metrics' ? '1px solid rgba(251, 113, 133, 0.3)' : '1px solid transparent'
          }}
        >
          Analytics & Metrics
        </button>
        <button 
          onClick={() => setActiveSubTab('users')}
          className="btn"
          style={{
            background: activeSubTab === 'users' ? 'rgba(251, 113, 133, 0.15)' : 'none',
            color: activeSubTab === 'users' ? '#fb7185' : 'var(--text-muted)',
            border: activeSubTab === 'users' ? '1px solid rgba(251, 113, 133, 0.3)' : '1px solid transparent'
          }}
        >
          Manage Users ({usersList.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('reports')}
          className="btn"
          style={{
            background: activeSubTab === 'reports' ? 'rgba(251, 113, 133, 0.15)' : 'none',
            color: activeSubTab === 'reports' ? '#fb7185' : 'var(--text-muted)',
            border: activeSubTab === 'reports' ? '1px solid rgba(251, 113, 133, 0.3)' : '1px solid transparent'
          }}
        >
          Manage Reports ({reportsList.length})
        </button>
      </div>

      {/* Main active sub-tab renders */}
      {activeSubTab === 'metrics' && metrics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Stats grid */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="stat-card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Users size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{metrics.totalStudents}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>

            <div className="stat-card glass" style={{ borderLeft: '4px solid var(--color-active)' }}>
              <div className="stat-icon" style={{ background: 'rgba(96, 165, 250, 0.1)', color: 'var(--color-active)' }}>
                <Package size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{metrics.totalRegisteredItems}</span>
                <span className="stat-label">Registered Items</span>
              </div>
            </div>

            <div className="stat-card glass" style={{ borderLeft: '4px solid var(--color-lost)' }}>
              <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-lost)' }}>
                <AlertTriangle size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{metrics.totalLostReports}</span>
                <span className="stat-label">Lost Claims</span>
              </div>
            </div>

            <div className="stat-card glass" style={{ borderLeft: '4px solid var(--color-returned)' }}>
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-returned)' }}>
                <CheckSquare size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{metrics.totalSolvedReports}</span>
                <span className="stat-label">Solved Reports</span>
              </div>
            </div>

            <div className="stat-card glass" style={{ borderLeft: '4px solid var(--color-found)' }}>
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-found)' }}>
                <Percent size={20} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{metrics.recoveryRate}%</span>
                <span className="stat-label">Recovery Rate</span>
              </div>
            </div>
          </div>

          {/* Visual CSS Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Chart 1: Lost items by category */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Items by Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics?.categoryData?.map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cat.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{cat.value} items</span>
                    </div>
                    {/* Horizontal Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, (cat.value / (metrics.totalRegisteredItems || 1)) * 100)}%`,
                        height: '100%',
                        background: 'var(--primary)',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Lost items by location */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Lost Items by Location</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics?.locationData?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
                    No location data available.
                  </p>
                ) : (
                  analytics?.locationData?.map((loc, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'white', fontWeight: 600 }}>{loc.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{loc.value} reports</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (loc.value / (metrics.totalLostReports || 1)) * 100)}%`,
                          height: '100%',
                          background: 'var(--color-lost)',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Users moderation view */}
      {activeSubTab === 'users' && (
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Student Name</th>
                <th style={{ padding: '1rem 1.5rem' }}>Student ID / Roll</th>
                <th style={{ padding: '1rem 1.5rem' }}>College Email</th>
                <th style={{ padding: '1rem 1.5rem' }}>Role</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(user => (
                <tr 
                  key={user._id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    fontSize: '0.9rem',
                    background: user.isSuspended ? 'rgba(244, 63, 94, 0.03)' : 'transparent' 
                  }}
                >
                  <td style={{ padding: '1rem 1.5rem', color: 'white', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{user.studentId}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: user.role === 'admin' ? '#fb7185' : 'var(--text-muted)' 
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {user.isSuspended ? (
                      <span className="badge badge-unsolved">Suspended</span>
                    ) : (
                      <span className="badge badge-returned">Active</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => handleToggleSuspendUser(user._id, user.name)}
                        className={`btn ${user.isSuspended ? 'btn-secondary' : 'btn-danger'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        disabled={actionLoading}
                      >
                        {user.isSuspended ? <UserCheck size={14} /> : <UserMinus size={14} />}
                        {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports moderation view */}
      {activeSubTab === 'reports' && (
        <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Item</th>
                <th style={{ padding: '1rem 1.5rem' }}>Location</th>
                <th style={{ padding: '1rem 1.5rem' }}>Reporter (Owner)</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportsList.map(report => (
                <tr key={report._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'white', fontWeight: 600 }}>
                    {report.item?.name || 'Deleted Item'}
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                      ID: {report.item?.itemId}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>{report.location}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{report.owner?.name} ({report.owner?.studentId})</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${report.status.toLowerCase()}`}>{report.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => navigate(`/reports/${report._id}`)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleDeleteReport(report._id, report.item?.name || 'Item')}
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      disabled={actionLoading}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
