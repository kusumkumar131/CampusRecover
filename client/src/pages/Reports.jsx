import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, AlertCircle, HelpCircle, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import * as reportService from '../services/reportService';
import * as itemService from '../services/itemService';

const Reports = () => {
  const navigate = useNavigate();
  const locationState = useLocation();

  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lost report submission modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    location: '',
    date: '',
    time: '',
    description: ''
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getMyReports(activeTab);
      if (response.success) {
        setReports(response.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyItems = async () => {
    try {
      const response = await itemService.getMyItems();
      if (response.success) {
        // Only allow reporting active items as lost
        const activeItems = response.data.filter(item => item.status === 'ACTIVE' || item.status === 'RETURNED');
        setMyItems(activeItems);
      }
    } catch (err) {
      console.error('Failed to load active items:', err);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  useEffect(() => {
    // If navigated with reportOpen flag in state, open modal automatically
    if (locationState.state?.reportOpen) {
      setModalOpen(true);
      loadMyItems();
      if (locationState.state.itemId) {
        setFormData(prev => ({ ...prev, itemId: locationState.state.itemId }));
      }
    }
  }, [locationState]);

  const handleOpenLostModal = () => {
    setModalOpen(true);
    loadMyItems();
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitLostReport = async (e) => {
    e.preventDefault();
    if (!formData.itemId || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await reportService.reportLost(formData);
      if (response.success) {
        setModalOpen(false);
        setFormData({ itemId: '', location: '', date: '', time: '', description: '' });
        loadReports();
      } else {
        alert(response.message || 'Failed to file report');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while filing report');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>My Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            File lost claims and track recovery handovers.
          </p>
        </div>
        <button onClick={handleOpenLostModal} className="btn btn-primary">
          <AlertCircle size={18} /> File Lost Claim
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        gap: '2rem',
        paddingBottom: '0.25rem'
      }}>
        <button 
          onClick={() => setActiveTab('lost')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: activeTab === 'lost' ? 'var(--primary)' : 'var(--text-muted)',
            paddingBottom: '0.75rem',
            borderBottom: activeTab === 'lost' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          My Lost Reports
        </button>
        <button 
          onClick={() => setActiveTab('found')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: activeTab === 'found' ? 'var(--primary)' : 'var(--text-muted)',
            paddingBottom: '0.75rem',
            borderBottom: activeTab === 'found' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          My Found Reports
        </button>
      </div>

      {/* Reports Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          <FileText size={48} style={{ color: 'var(--text-dark)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No reports filed</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {activeTab === 'lost' 
              ? 'You haven’t filed any lost belongings claims yet.' 
              : 'You haven’t reported finding anyone else’s lost belongings yet.'}
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {reports.map(report => (
            <div key={report._id} className="item-card glass glass-hover" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 className="item-card-title">{report.item.name}</h3>
                  <span className="item-card-category">{report.item.category}</span>
                </div>
                <span className={`badge badge-${report.status.toLowerCase()}`}>{report.status}</span>
              </div>

              {/* Location & Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)' }} />
                  Location: <strong>{report.location}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} />
                  Date: {new Date(report.date).toLocaleDateString()} {report.time && `at ${report.time}`}
                </span>
                {activeTab === 'found' && report.owner && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--primary)' }} />
                    Owner: <strong>{report.owner.name}</strong>
                  </span>
                )}
                {activeTab === 'lost' && report.foundBy && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} style={{ color: 'var(--primary)' }} />
                    Finder: <strong>{report.foundBy.name}</strong>
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ marginTop: 'auto' }}>
                <button 
                  onClick={() => navigate(`/reports/${report._id}`)} 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem' }}
                >
                  Track Recovery Timeline <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Lost Claim Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <form onSubmit={handleSubmitLostReport} className="glass" style={{
            width: '90%',
            maxWidth: '550px',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            margin: '0 auto',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>File a Lost Report</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select one of your registered belongings to report lost. Provide details to help the finder identify it.
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Belonging *</label>
              <select
                name="itemId"
                className="form-input"
                value={formData.itemId}
                onChange={handleFormChange}
                required
                disabled={submitLoading}
                style={{ height: '45px' }}
              >
                <option value="">Select Item</option>
                {myItems.map(item => (
                  <option key={item._id} value={item.itemId}>
                    {item.name} ({item.itemId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Seen Location *</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Classroom 204 back desk, SAC Cafeteria"
                value={formData.location}
                onChange={handleFormChange}
                required
                disabled={submitLoading}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                <label className="form-label">Date Lost</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleFormChange}
                  disabled={submitLoading}
                />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                <label className="form-label">Approximate Time Lost</label>
                <input
                  type="time"
                  name="time"
                  className="form-input"
                  value={formData.time}
                  onChange={handleFormChange}
                  disabled={submitLoading}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Additional Information / Message for Finder</label>
              <textarea
                name="description"
                className="form-input"
                placeholder="e.g. Please check if plug is left behind, serial key details"
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
                disabled={submitLoading}
                style={{ resize: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="btn btn-secondary"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitLoading || !formData.itemId || !formData.location}
              >
                {submitLoading ? 'Filing Report...' : 'File Lost Report'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

export default Reports;
