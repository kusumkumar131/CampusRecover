import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Plus } from 'lucide-react';
import * as itemService from '../services/itemService';

const RegisterItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    brand: '',
    color: '',
    identificationDetails: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Keys',
    'Wallet/Bag',
    'Water Bottle',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      setError('Item Name and Category are required');
      return;
    }

    setLoading(true);
    try {
      const response = await itemService.registerItem(formData);
      if (response.success) {
        // Redirect to items list
        navigate('/items');
      } else {
        setError(response.message || 'Failed to register item');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Header & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/items')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Register Belonging</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Add details to register your item and generate a unique QR code.
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          color: 'var(--color-lost)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Laptop Charger, Economics Textbook"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
            <label className="form-label">Category *</label>
            <select
              name="category"
              className="form-input"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={loading}
              style={{ height: '45px' }}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
            <label className="form-label">Brand</label>
            <input
              type="text"
              name="brand"
              className="form-input"
              placeholder="e.g. Dell, Anker, Apple"
              value={formData.brand}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '240px', marginBottom: 0 }}>
            <label className="form-label">Color</label>
            <input
              type="text"
              name="color"
              className="form-input"
              placeholder="e.g. Matte Black, Space Gray"
              value={formData.color}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description / Features</label>
          <textarea
            name="description"
            className="form-input"
            placeholder="Provide a general description of the item."
            rows={3}
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Private Identification Details (Serial Number, Marks, Stickers)</label>
          <textarea
            name="identificationDetails"
            className="form-input"
            placeholder="Only visible to you and administrators. Help verify your ownership. E.g. Serial: 87FJK32, Github sticker."
            rows={3}
            value={formData.identificationDetails}
            onChange={handleChange}
            disabled={loading}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            ℹ️ These details will <strong>never</strong> be shown to a finder scanning the QR code.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            type="button" 
            onClick={() => navigate('/items')} 
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            <Plus size={18} /> {loading ? 'Registering...' : 'Register Item'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default RegisterItem;
