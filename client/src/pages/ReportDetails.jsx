import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, AlertTriangle, ShieldCheck, MapPin, Calendar, MessageSquare } from 'lucide-react';
import * as reportService from '../services/reportService';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const response = await reportService.getReportById(id);
      if (response.success) {
        setReport(response.data.report);
      } else {
        setError(response.message || 'Report not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const handleProposeHandover = async () => {
    setUpdating(true);
    try {
      const response = await reportService.updateReport(id, { status: 'HANDOVER_PENDING' });
      if (response.success) {
        fetchReportDetails();
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmReceipt = async () => {
    const confirm = window.confirm('Are you sure you have received your item? This will solve the recovery case.');
    if (!confirm) return;

    setUpdating(true);
    try {
      const response = await reportService.confirmReturn(id);
      if (response.success) {
        fetchReportDetails();
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert('Error solving report');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading recovery timeline...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '550px', margin: '2rem auto' }}>
        <AlertTriangle size={48} style={{ color: 'var(--color-lost)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Failed to Load</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'This report is unavailable.'}</p>
        <button onClick={() => navigate('/reports')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Reports
        </button>
      </div>
    );
  }

  const { item, owner, foundBy, status } = report;
  const isOwner = user && user.name === owner.name;
  
  // Calculate checked items for timeline based on database timestamps
  const steps = [
    { label: 'Item Registered', checked: true, date: item.createdAt },
    { label: 'Reported Lost', checked: true, date: report.createdAt },
    { label: 'QR Scanned', checked: !!report.foundAt || item.status !== 'LOST', date: report.foundAt || report.createdAt },
    { label: 'Item Found', checked: ['FOUND', 'CONTACTED', 'HANDOVER_PENDING', 'RETURNED'].includes(item.status) || status === 'SOLVED', date: report.foundAt },
    { label: 'Owner Contacted', checked: ['CONTACTED', 'HANDOVER_PENDING', 'RETURNED'].includes(item.status) || status === 'SOLVED', date: report.contactedAt },
    { label: 'Handover Pending', checked: ['HANDOVER_PENDING', 'RETURNED'].includes(item.status) || status === 'SOLVED', date: report.handoverAt },
    { label: 'Owner Confirms Received', checked: status === 'SOLVED', date: report.returnedAt }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '750px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/reports')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Recovery Timeline</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Follow the recovery process step-by-step.
          </p>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Info row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{item.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Report ID: {report._id.substring(18).toUpperCase()} • Item ID: {item.itemId}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge badge-${item.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              {item.status}
            </span>
          </div>
        </div>

        {/* Metadatas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', margin: '1.5rem 0' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <MapPin size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lost Location:</span>
              <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem' }}>{report.location}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Calendar size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lost Date:</span>
              <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem' }}>
                {new Date(report.date).toLocaleDateString()} {report.time && `at ${report.time}`}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline representation */}
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot" style={{ background: 'var(--primary)', color: 'white' }}>
              <Package size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Belonging Registered</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Belonging recorded in database and assigned QR code label.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot" style={{ background: 'var(--color-lost)', color: 'white' }}>
              <AlertCircle size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Reported Lost</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Item reported lost at {report.location}. Listed on lost & found bulletin.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot" style={{ 
              background: report.contactedAt ? 'var(--color-contacted)' : 'var(--border-color)', 
              color: report.contactedAt ? 'white' : 'var(--text-muted)' 
            }}>
              <Search size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: report.contactedAt ? 'var(--text-main)' : 'var(--text-muted)' }}>
                Found & In-App Contact Established
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {report.contactedAt 
                  ? `Finder scanned QR code & sent message on ${new Date(report.contactedAt).toLocaleDateString()}.`
                  : 'Awaiting finder to scan QR label or report item found.'}
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot" style={{ 
              background: report.returnedAt ? 'var(--color-returned)' : 'var(--border-color)', 
              color: report.returnedAt ? 'white' : 'var(--text-muted)' 
            }}>
              <CheckCircle size={14} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: report.returnedAt ? 'var(--text-main)' : 'var(--text-muted)' }}>
                Safe Receipt Confirmed
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {report.returnedAt 
                  ? `Owner confirmed receipt on ${new Date(report.returnedAt).toLocaleDateString()}. Recovery complete!`
                  : 'Pending safe handover confirmation by item owner.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action button panel */}
        {!report.returnedAt && (item.status === 'CONTACTED' || item.status === 'FOUND' || item.status === 'HANDOVER_PENDING') && (
          <div style={{
            background: 'var(--primary-glow)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            {isOwner ? (
              // Owner controls
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Did you receive your item?</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Once you meet the finder and physically retrieve your item, confirm below.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {item.status === 'CONTACTED' && (
                    <button 
                      onClick={handleProposeHandover} 
                      className="btn btn-secondary"
                      disabled={updating}
                    >
                      Propose/Arrange Handover
                    </button>
                  )}
                  <button 
                    onClick={handleConfirmReceipt} 
                    className="btn btn-primary"
                    disabled={updating}
                  >
                    Yes, I Received It
                  </button>
                </div>
              </div>
            ) : (
              // Finder controls
              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Recovery in Progress</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Please message the owner to finalize meeting coordinates and hand over the item.
                </p>
                <button 
                  onClick={() => navigate('/messages', { state: { selectItem: item._id } })} 
                  className="btn btn-primary"
                >
                  <MessageSquare size={16} /> Chat with Owner
                </button>
              </div>
            )}
          </div>
        )}

        {/* Solved details banner */}
        {report.returnedAt && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ShieldCheck size={32} style={{ color: 'var(--color-returned)' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Recovery Case Solved</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              This belonging was safely recovered and returned on {new Date(report.returnedAt).toLocaleDateString()}. Case solved!
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

export default ReportDetails;
