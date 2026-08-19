import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ShieldAlert, HeartHandshake, MessageSquare, ArrowLeft } from 'lucide-react';
import * as qrService from '../services/qrService';
import * as reportService from '../services/reportService';
import * as messageService from '../services/messageService';

const ScanResult = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [foundLocation, setFoundLocation] = useState('');

  const fetchScanResult = async () => {
    setLoading(true);
    try {
      const response = await qrService.scanQRCode(itemId);
      if (response.success) {
        setItem(response.data.item);
      } else {
        setError(response.message || 'Item not recognized');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error identifying scanned item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanResult();
  }, [itemId]);

  const handleReportFound = async () => {
    if (!isAuthenticated) {
      // Store current path to redirect back after logging in
      navigate('/login', { state: { from: `/scan/${itemId}` } });
      return;
    }

    setReporting(true);
    try {
      const response = await reportService.reportFound({
        itemId: item.itemId,
        location: foundLocation || item.report?.location || 'Campus'
      });

      if (response.success) {
        setConfirmOpen(false);
        // Create an automatic initial message in chat to kick off communication
        try {
          const report = response.data.report;
          const ownerId = item.owner._id || report.owner;
          
          await messageService.sendMessage({
            receiverId: ownerId,
            itemId: item._id,
            reportId: report._id,
            message: `I found your "${item.name}" at ${foundLocation || 'Campus'}. Let's arrange a handover!`
          });
        } catch (msgErr) {
          console.error('Failed to send auto-message:', msgErr);
        }

        // Navigate to the direct chat thread (where conversationId is the Item ID)
        navigate('/messages', { state: { selectItem: item._id } });
      } else {
        alert(response.message || 'Failed to report item found');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error reporting item found');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Identifying scanned item...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="glass animate-fade-in" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '550px', margin: '2rem auto' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-lost)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Scan Error</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'This QR code is not recognized by CampusRecover.'}</p>
        <button onClick={() => navigate('/scan')} className="btn btn-primary">
          <ArrowLeft size={16} /> Try Scanning Again
        </button>
      </div>
    );
  }

  // Check if current user is the owner of the scanned item
  const isOwner = user && user.name === item.owner.name;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Safe scan banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/scan')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Item Details Identified</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Privacy Mode Active: Owner contact details are encrypted and hidden.
          </p>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Title & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{item.name}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category: {item.category}</span>
          </div>
          <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
        </div>

        {/* Safe details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner:</span>
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>{item.owner.name}</p>
          </div>
          {item.owner.department && (
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Department:</span>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.owner.department}</p>
            </div>
          )}
          {item.brand && (
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brand:</span>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.brand}</p>
            </div>
          )}
          {item.color && (
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Color:</span>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.color}</p>
            </div>
          )}
        </div>

        {/* Lost Report Details (if LOST) */}
        {item.status === 'LOST' && item.report && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.05)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <h4 style={{ color: 'var(--color-lost)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> Reported Lost on Campus
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Last Seen Location: <strong>{item.report.location}</strong>
            </p>
            {item.report.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                "{item.report.description}"
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>
              Lost Date: {new Date(item.report.date).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Action Panel */}
        <div>
          {isOwner ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
              🔒 You own this item. Use your Dashboard or My Items tab to manage reports.
            </div>
          ) : item.status === 'LOST' ? (
            <button 
              onClick={() => setConfirmOpen(true)} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem' }}
            >
              <HeartHandshake size={20} /> I've Found This Item
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span>ℹ️ This item's status is currenty <strong>{item.status}</strong>.</span>
              <span>Scanning registered items helps verify labels. Only items reported lost can be claimed found.</span>
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
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
          <div className="glass" style={{
            width: '90%',
            maxWidth: '480px',
            borderRadius: 'var(--radius-lg)',
            padding: '2.25rem 2rem',
            margin: '0 auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Report Item Found</h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you found this <strong>{item.name}</strong>? An alert will be sent to the owner, and a chat connection will open.
            </p>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Where did you find it? *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Library desk, classroom 204 corner"
                value={foundLocation}
                onChange={(e) => setFoundLocation(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setConfirmOpen(false)} 
                className="btn btn-secondary"
                disabled={reporting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleReportFound} 
                className="btn btn-primary"
                disabled={reporting || !foundLocation}
              >
                {reporting ? 'Reporting...' : 'Yes, I Found It'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScanResult;
