import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, Eye, QrCode, Edit2, AlertCircle } from 'lucide-react';
import * as itemService from '../services/itemService';

const MyItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await itemService.getMyItems({
        status: statusFilter,
        search: searchTerm
      });
      if (response.success) {
        // Fetch QR Scans counts for these items from a local scan counts fetch or backend aggregate
        // For simplicity, we can load it. We will also update the controller to inject 'scanCount' into each item!
        setItems(response.data);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [statusFilter, searchTerm]);

  const filterTabs = ['All', 'ACTIVE', 'LOST', 'FOUND', 'CONTACTED', 'HANDOVER_PENDING', 'RETURNED'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header and Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>My Registered Belongings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Register items, generate sticky QR codes, and trace lost objects
          </p>
        </div>
        <button onClick={() => navigate('/items/add')} className="btn btn-primary">
          <Plus size={18} /> Register New Item
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search belongings by name..."
            style={{ paddingLeft: '2.75rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tab filters */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {filterTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className="btn"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                borderRadius: '9999px',
                background: statusFilter === tab ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === tab ? 'white' : 'var(--text-muted)',
                border: statusFilter === tab ? 'none' : '1px solid var(--border-color)'
              }}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading belongings...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          <Package size={48} style={{ color: 'var(--text-dark)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No items registered yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Get started by registering your first student belonging to generate a QR label.
          </p>
          <button onClick={() => navigate('/items/add')} className="btn btn-primary">
            + Add Belonging
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {items.map(item => (
            <div key={item._id} className="item-card glass glass-hover">
              <div className="item-card-header">
                <div>
                  <h3 className="item-card-title">{item.name}</h3>
                  <span className="item-card-category">{item.category}</span>
                </div>
                <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
              
              <p className="item-card-desc">
                {item.description || 'No description provided.'}
              </p>

              {/* Scans info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                <QrCode size={16} style={{ color: 'var(--primary)' }} />
                <span>QR Label Scans: <strong>{item.scanCount || 0}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="item-card-footer">
                <button 
                  onClick={() => navigate(`/items/${item._id}`)} 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                >
                  <Eye size={14} /> View
                </button>
                <button 
                  onClick={() => navigate(`/items/${item._id}/qr`)} 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                >
                  <QrCode size={14} /> QR Label
                </button>
                
                {item.status === 'ACTIVE' && (
                  <button 
                    onClick={() => navigate(`/reports`, { state: { itemId: item.itemId, reportOpen: true } })} 
                    className="btn btn-danger" 
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                  >
                    <AlertCircle size={14} /> Report Lost
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MyItems;
