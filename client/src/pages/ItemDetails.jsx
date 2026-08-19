import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, ClipboardList, MapPin, Calendar, User } from 'lucide-react';
import * as itemService from '../services/itemService';
import * as qrService from '../services/qrService';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadItemAndScans = async () => {
      setLoading(true);
      try {
        const itemRes = await itemService.getItemById(id);
        if (itemRes.success) {
          const itemData = itemRes.data.item;
          setItem(itemData);

          // Fetch scan history
          const scansRes = await qrService.getQRScanHistory(itemData.itemId);
          if (scansRes.success) {
            setScans(scansRes.data);
          }
        } else {
          setError(itemRes.message || 'Belonging not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading item details');
      } finally {
        setLoading(false);
      }
    };

    loadItemAndScans();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="glass" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '550px', margin: '2rem auto' }}>
        <p style={{ color: 'var(--color-lost)', marginBottom: '1.5rem' }}>{error || 'Item not found'}</p>
        <button onClick={() => navigate('/items')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to My Items
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/items')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Item Details</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage description and monitor label scans.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Card: General item descriptions */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{item.name}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category: {item.category}</span>
            </div>
            <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', fontSize: '0.95rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Unique Item ID:</span>
              <strong style={{ color: 'var(--primary)' }}>{item.itemId}</strong>
            </div>

            {item.brand && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Brand:</span>
                <span style={{ color: 'var(--text-main)' }}>{item.brand}</span>
              </div>
            )}

            {item.color && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Color:</span>
                <span style={{ color: 'var(--text-main)' }}>{item.color}</span>
              </div>
            )}

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Description:</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                {item.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Private Identification Details:</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4, padding: '0.75rem', background: 'var(--bg-surface-opaque)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                {item.identificationDetails || 'No private identifier details recorded.'}
              </p>
            </div>
          </div>

          {/* Label Details button */}
          <button 
            onClick={() => navigate(`/items/${item._id}/qr`)} 
            className="btn btn-secondary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            <QrCode size={16} /> View/Print QR Label
          </button>
        </div>

        {/* Right Card: QR Scan logs history */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} style={{ color: 'var(--primary)' }} /> QR Scan Logs History
          </h3>

          {scans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', margin: 'auto' }}>
              <QrCode size={36} style={{ color: 'var(--text-dark)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No QR scan logs recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '350px' }}>
              {scans.map(scan => (
                <div 
                  key={scan._id}
                  style={{
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      Action: {scan.action}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                      {new Date(scan.scannedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {scan.location && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} /> {scan.location}
                    </span>
                  )}

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} /> Scanner:{' '}
                    <strong>{scan.scanner ? scan.scanner.name : 'Anonymous Scan'}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ItemDetails;
