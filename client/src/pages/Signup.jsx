import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QrCode, AlertTriangle } from 'lucide-react';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.email.endsWith('@college.edu') && !formData.email.includes('.edu')) {
      setError('Please register with a valid college (.edu) email');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      studentId: formData.studentId,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      year: Number(formData.year) || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <QrCode size={36} className="brand-logo" />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>CampusRecover</h2>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Create an account</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Join to protect your belongings and recover lost items
      </p>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(244, 63, 94, 0.15)',
          color: 'var(--color-lost)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Kumar K."
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Student ID / Roll Number *</label>
            <input
              type="text"
              name="studentId"
              className="form-input"
              placeholder="STU1001"
              value={formData.studentId}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">College Email *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="student@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-input"
              placeholder="Computer Science"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Academic Year</label>
            <select
              name="year"
              className="form-input"
              value={formData.year}
              onChange={handleChange}
              disabled={loading}
              style={{ height: '45px' }}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
      </p>

      <div style={{ marginTop: '1rem' }}>
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&larr; Back to homepage</Link>
      </div>
    </div>
  );
};

export default Signup;
