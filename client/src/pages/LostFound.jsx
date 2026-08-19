import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Clipboard, Filter } from 'lucide-react';
import * as reportService from '../services/reportService';

const LostFound = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' (all), 'LOST', 'FOUND'
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' (all), 'UNSOLVED', 'FOUND', 'IN_PROGRESS'

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Keys',
    'Wallet/Bag',
    'Water Bottle',
    'Other'
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Build query filters
      const filters = {};
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      if (locationFilter) filters.location = locationFilter;
      if (search) filters.search = search;

      const response = await reportService.getAllReports(filters);
      if (response.success) {
        setReports(response.data);
      }
    } catch (err) {
      console.error('Failed to load public reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [typeFilter, statusFilter, categoryFilter, locationFilter, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Campus Lost & Found Bulletin Board</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Browse lost and found items submitted by students on campus.
        </p>
      </div>

      {/* Search & Filters Row */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search items by name (e.g. Dell charger, Sony headset)..."
            style={{ paddingLeft: '2.75rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters Selects */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Type</span>
            <select
              className="form-input"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ height: '40px', padding: '0.25rem 0.5rem' }}
            >
              <option value="">All Reports</option>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Category</span>
            <select
              className="form-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ height: '40px', padding: '0.25rem 0.5rem' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Location</span>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Library, SAC"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{ height: '40px' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Case Status</span>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: '40px', padding: '0.25rem 0.5rem' }}
            >
              <option value="">All Statuses</option>
              <option value="UNSOLVED">Unsolved</option>
              <option value="FOUND">Found (Awaiting Claim)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SOLVED">Solved (Returned)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Bulletins list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading bulletins...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          <Clipboard size={48} style={{ color: 'var(--text-dark)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No bulletins found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try adjusting your search terms or filters.
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {reports.map(report => (
            <div 
              key={report._id} 
              className="item-card glass glass-hover"
              onClick={() => navigate(`/scan/${report.item.itemId}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="item-card-header">
                <div>
                  <h3 className="item-card-title">{report.item.name}</h3>
                  <span className="item-card-category">{report.item.category}</span>
                </div>
                <span className={`badge badge-${report.status.toLowerCase()}`}>{report.status}</span>
              </div>

              <p className="item-card-desc">
                {report.description || report.item.description || 'No description provided.'}
              </p>

              {/* Safe owner details & Location Info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} />
                  Last seen: <strong>{report.location}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} style={{ color: 'var(--primary)' }} />
                  Reported: {new Date(report.createdAt).toLocaleDateString()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textAlign: 'right', marginTop: '0.5rem' }}>
                  Click to scan / view details
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default LostFound;
