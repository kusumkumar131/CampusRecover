import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Search, 
  QrCode, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Zap,
  Shield,
  Lock,
  MessageSquare,
  HeartHandshake,
  ChevronRight,
  TrendingUp,
  Minus
} from 'lucide-react';
import * as itemService from '../services/itemService';
import * as reportService from '../services/reportService';
import * as notificationService from '../services/notificationService';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    total: 5,
    lost: 1,
    found: 0,
    returned: 2
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const itemsRes = await itemService.getMyItems();
        if (itemsRes.success && itemsRes.data.length > 0) {
          const itemsList = itemsRes.data;
          setRecentItems(itemsList.slice(0, 3));
          
          const count = { total: itemsList.length, lost: 0, found: 0, returned: 0 };
          itemsList.forEach(item => {
            if (item.status === 'LOST') count.lost++;
            if (item.status === 'FOUND' || item.status === 'CONTACTED' || item.status === 'HANDOVER_PENDING') count.found++;
            if (item.status === 'RETURNED') count.returned++;
          });
          setStats(count);
        } else {
          // Default mock data matching reference preview
          setRecentItems([
            {
              _id: 'item1',
              name: 'Sony WH-1000XM4 Headset',
              category: 'Electronics',
              createdAt: '2026-08-12T10:00:00Z',
              status: 'ACTIVE',
              img: '/images/headphones.png'
            },
            {
              _id: 'item2',
              name: 'Anker Power Bank 20000mAh',
              category: 'Electronics',
              createdAt: '2026-08-10T10:00:00Z',
              status: 'ACTIVE',
              img: '/images/hero_3d.png'
            },
            {
              _id: 'item3',
              name: 'Introduction to Algorithms',
              category: 'Books',
              createdAt: '2026-08-05T10:00:00Z',
              status: 'ACTIVE',
              img: '/images/privacy_lock.png'
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Top 4 Statistics Counter Cards */}
      <div className="dashboard-stat-row">
        {/* Card 1: My Items */}
        <div className="dashboard-stat-card glass">
          <div className="stat-card-top">
            <div className="stat-icon-square icon-purple">
              <Package size={22} />
            </div>
            <div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-subtitle">My Items</div>
            </div>
          </div>
          <div className="stat-card-badge badge-green-pill">
            <TrendingUp size={12} /> <span>2 this month</span>
          </div>
        </div>

        {/* Card 2: Reported Lost */}
        <div className="dashboard-stat-card glass">
          <div className="stat-card-top">
            <div className="stat-icon-square icon-red">
              <AlertCircle size={22} />
            </div>
            <div>
              <div className="stat-number">{stats.lost}</div>
              <div className="stat-subtitle">Reported Lost</div>
            </div>
          </div>
          <div className="stat-card-badge badge-red-pill">
            Needs attention
          </div>
        </div>

        {/* Card 3: Reported Found */}
        <div className="dashboard-stat-card glass">
          <div className="stat-card-top">
            <div className="stat-icon-square icon-orange">
              <HelpCircle size={22} />
            </div>
            <div>
              <div className="stat-number">{stats.found}</div>
              <div className="stat-subtitle">Reported Found</div>
            </div>
          </div>
          <div className="stat-card-badge badge-grey-pill">
            <Minus size={12} /> <span>No new updates</span>
          </div>
        </div>

        {/* Card 4: Returned */}
        <div className="dashboard-stat-card glass">
          <div className="stat-card-top">
            <div className="stat-icon-square icon-green">
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="stat-number">{stats.returned}</div>
              <div className="stat-subtitle">Returned</div>
            </div>
          </div>
          <div className="stat-card-badge badge-green-pill">
            <TrendingUp size={12} /> <span>1 this month</span>
          </div>
        </div>
      </div>

      {/* 2. Scan QR Code Hero Card */}
      <div className="scan-hero-card glass">
        {/* Left QR bracket graphic */}
        <div className="scan-hero-qr-box">
          <div className="qr-bracket top-left"></div>
          <div className="qr-bracket top-right"></div>
          <div className="qr-bracket bottom-left"></div>
          <div className="qr-bracket bottom-right"></div>
          <QrCode size={46} className="scan-hero-qr-icon" />
        </div>

        {/* Center Text & Action */}
        <div className="scan-hero-content">
          <h3 className="scan-hero-title">Scan QR Code</h3>
          <p className="scan-hero-desc">
            Scan a code to find the owner of a lost item
          </p>
          <button onClick={() => navigate('/scan')} className="btn-hero-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}>
            <QrCode size={18} /> Open Scanner
          </button>
        </div>

        {/* Right 3 Micro Feature Columns */}
        <div className="scan-hero-features">
          <div className="scan-feature-item">
            <div className="feature-icon-badge">
              <Zap size={16} />
            </div>
            <div>
              <div className="feature-title">Fast</div>
              <div className="feature-desc">Get results in seconds</div>
            </div>
          </div>

          <div className="scan-feature-item">
            <div className="feature-icon-badge">
              <Shield size={16} />
            </div>
            <div>
              <div className="feature-title">Secure</div>
              <div className="feature-desc">Your data is always protected</div>
            </div>
          </div>

          <div className="scan-feature-item">
            <div className="feature-icon-badge">
              <Lock size={16} />
            </div>
            <div>
              <div className="feature-title">Private</div>
              <div className="feature-desc">We never share your details</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Split Section: My Belongings & Recent Activity */}
      <div className="dashboard-grid-split">
        {/* Left Column: My Belongings */}
        <div className="glass dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">My Belongings</h3>
            <button onClick={() => navigate('/items')} className="panel-link-btn">
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="belongings-list">
            {recentItems.map(item => (
              <div 
                key={item._id} 
                className="belonging-card-item glass-hover"
                onClick={() => navigate(`/items/${item._id}`)}
              >
                <div className="belonging-thumb">
                  {item.img ? (
                    <img src={item.img} alt={item.name} />
                  ) : (
                    <Package size={22} style={{ color: 'var(--primary)' }} />
                  )}
                </div>

                <div className="belonging-info">
                  <h4 className="belonging-name">{item.name}</h4>
                  <div className="belonging-sub">
                    <span>{item.category}</span>
                    <span className="dot-separator">•</span>
                    <span>Registered on {new Date(item.createdAt || Date.now()).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="belonging-action">
                  <span className="badge-active-tag">{item.status || 'ACTIVE'}</span>
                  <ChevronRight size={16} className="chevron-icon" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="glass dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Activity</h3>
            <button onClick={() => navigate('/notifications')} className="panel-link-btn">
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="activity-timeline-list">
            {/* Activity 1: Item Found */}
            <div className="activity-item">
              <div className="activity-icon-badge icon-bg-green">
                <CheckCircle size={18} />
              </div>
              <div className="activity-content">
                <h5 className="activity-title">Sony WH-1000XM4 Headset found</h5>
                <p className="activity-desc">
                  Jane Doe (Finder) reported that they found your item.
                </p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>

            {/* Activity 2: New Message */}
            <div className="activity-item">
              <div className="activity-icon-badge icon-bg-purple">
                <MessageSquare size={18} />
              </div>
              <div className="activity-content">
                <h5 className="activity-title">New message from Jane Doe (Finder)</h5>
                <p className="activity-desc">
                  "Can we meet tomorrow at the library entrance?"
                </p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>

            {/* Activity 3: Item Returned */}
            <div className="activity-item">
              <div className="activity-icon-badge icon-bg-blue">
                <HeartHandshake size={18} />
              </div>
              <div className="activity-content">
                <h5 className="activity-title">Item returned successfully</h5>
                <p className="activity-desc">
                  Your Water Bottle was returned by Rahul.
                </p>
                <span className="activity-time">Yesterday, 6:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recovery Journey Tracker */}
      <div className="glass journey-panel">
        <h3 className="panel-title" style={{ marginBottom: '1.75rem' }}>Recovery Journey</h3>

        <div className="journey-track-wrapper">
          <div className="journey-line"></div>
          
          <div className="journey-steps">
            {/* Step 1: Lost */}
            <div className="journey-step active-step">
              <div className="journey-node node-purple">
                <AlertCircle size={18} />
              </div>
              <span className="journey-label">Lost</span>
            </div>

            {/* Step 2: Found */}
            <div className="journey-step">
              <div className="journey-node node-orange">
                <Search size={18} />
              </div>
              <span className="journey-label">Found</span>
            </div>

            {/* Step 3: Contacted */}
            <div className="journey-step">
              <div className="journey-node node-blue">
                <MessageSquare size={18} />
              </div>
              <span className="journey-label">Contacted</span>
            </div>

            {/* Step 4: Handover */}
            <div className="journey-step">
              <div className="journey-node node-purple-alt">
                <HeartHandshake size={18} />
              </div>
              <span className="journey-label">Handover</span>
            </div>

            {/* Step 5: Returned */}
            <div className="journey-step">
              <div className="journey-node node-green">
                <CheckCircle size={18} />
              </div>
              <span className="journey-label">Returned</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <div className="dashboard-footer">
        &copy; {new Date().getFullYear()} CampusRecover. All rights reserved.
      </div>

    </div>
  );
};

export default Dashboard;
