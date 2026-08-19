import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  QrCode,
  Search,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Users,
  ShoppingBag,
  Gift,
  Share2,
  Globe,
  MessageCircle,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import axios from 'axios';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [stats, setStats] = useState({
    registered: 48,
    lost: 8,
    found: 4,
    solved: 36
  });

  // How It Works interactive hover step state
  const [hoveredWorkStep, setHoveredWorkStep] = useState(null);

  // Easter Egg state for Register button sparkles & bottom toast
  const [registerMagicActive, setRegisterMagicActive] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const registerHoveredRef = useRef(false);

  const handleRegisterMouseEnter = () => {
    if (registerHoveredRef.current) return;
    registerHoveredRef.current = true;
    setRegisterMagicActive(true);

    const colors = ['#8b5cf6', '#a855f7', '#3b82f6', '#60a5fa', '#ffffff', '#e0e7ff'];
    const newSparkles = Array.from({ length: 14 }).map((_, i) => ({
      id: i + '-' + Date.now(),
      left: Math.random() * 80 + 10 + '%',
      size: Math.random() * 5 + 4 + 'px',
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.25 + 's',
      duration: Math.random() * 0.4 + 1.1 + 's',
      tx: (Math.random() - 0.5) * 36 + 'px'
    }));
    setSparkles(newSparkles);
  };

  const handleRegisterMouseLeave = () => {
    registerHoveredRef.current = false;
    setRegisterMagicActive(false);
    setSparkles([]);
  };

  const handleRegisterTouch = () => {
    if (!registerMagicActive) {
      handleRegisterMouseEnter();
      setTimeout(() => {
        handleRegisterMouseLeave();
      }, 2500);
    }
  };

  // Bomb Easter Egg state for "Create Free Account" button
  const [bombState, setBombState] = useState('idle'); // 'idle' | 'lit' | 'sparkles' | 'blast'
  const bombTimerRef = useRef(null);

  const handleCreateBtnMouseEnter = () => {
    if (bombState === 'idle') {
      setBombState('lit');
    }
  };

  const handleCreateBtnMouseLeave = () => {
    if (bombState === 'lit') {
      setBombState('blast');
      setTimeout(() => {
        setBombState('idle');
      }, 1500);
    }
  };

  const handleCreateBtnClick = () => {
    setBombState('sparkles');
    setTimeout(() => {
      navigate('/signup');
    }, 1200);
  };

  // URL drop animation state on QR logo hover
  const [urlDropActive, setUrlDropActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        if (setTheme) setTheme('light');
      } else if (e.key === 'd' || e.key === 'D') {
        if (setTheme) setTheme('dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTheme]);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/items/public-stats`);
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        // Fallback to default realistic seed stats
      }
    };
    fetchPublicStats();
  }, []);

  return (
    <div className="landing-page-light">
      {/* 1. Header Navigation */}
      <header className="landing-nav">
        <div className="landing-brand" onClick={() => navigate('/')}>
          <div 
            className="landing-brand-logo"
            onMouseEnter={() => setUrlDropActive(true)}
            onMouseLeave={() => setUrlDropActive(false)}
            onTouchStart={() => setUrlDropActive(prev => !prev)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <QrCode size={24} />
          </div>
          <span className="landing-brand-title">CampusRecover</span>
        </div>

        {/* Traveling URL drop pill animation */}
        {urlDropActive && (
          <div className="qr-url-drop-container">
            <div className="qr-url-drop-line" />
            <div className="qr-url-drop-pill">
              https://campusrecover.com/scan/item-8921 🔗
            </div>
          </div>
        )}

        <nav className="landing-nav-links">
          <a href="#how-it-works" className="landing-nav-link">How it Works</a>
          <a href="#about" className="landing-nav-link">About Us</a>
          <a href="#faqs" className="landing-nav-link">FAQs</a>
          <a href="#contact" className="landing-nav-link">Contact</a>
        </nav>

        <div className="landing-nav-actions">
          {/* Theme Toggle Button Symbol */}
          <button 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode (Key: L)' : 'Switch to Dark Mode (Key: D)'}
            className="btn-landing-outline"
            style={{ 
              padding: '0.55rem 0.85rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer' 
            }}
          >
            {theme === 'dark' ? (
              <Sun size={18} style={{ color: '#f59e0b' }} />
            ) : (
              <Moon size={18} style={{ color: '#8b5cf6' }} />
            )}
          </button>
          <Link to="/login" className="btn-landing-outline">Sign In</Link>
          <div 
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={handleRegisterMouseEnter}
            onMouseLeave={handleRegisterMouseLeave}
            onTouchStart={handleRegisterTouch}
            onFocus={handleRegisterMouseEnter}
            onBlur={handleRegisterMouseLeave}
          >
            <Link to="/signup" className="btn-landing-solid">Register</Link>

            {/* Confetti & Sparkles */}
            {registerMagicActive && sparkles.length > 0 && (
              <div className="register-sparkles-container">
                {sparkles.map(sp => (
                  <span
                    key={sp.id}
                    className="register-sparkle-dot"
                    style={{
                      left: sp.left,
                      width: sp.size,
                      height: sp.size,
                      backgroundColor: sp.color,
                      animationDelay: sp.delay,
                      animationDuration: sp.duration,
                      '--tx': sp.tx
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero">
        <div>
          <h1 className="landing-hero-title">
            Lost something <br />
            on campus? <br />
            <span className="gradient-text-purple">We help you</span> <br />
            <span className="text-purple-highlight">get it back.</span>
          </h1>

          <p className="landing-hero-subtitle">
            Protect your belongings, generate secure QR codes, and trace the recovery process step-by-step without disclosing private details.
          </p>

          <div className="landing-hero-buttons">
            <button onClick={() => navigate('/login')} className="btn-hero-primary">
              Report Lost Item <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/scan')} className="btn-hero-secondary">
              <QrCode size={20} /> Scan QR Code
            </button>
          </div>
        </div>

        <div className="landing-hero-image-wrapper">
          <div className="hero-circle-stage">
            <div className="hero-circle-inner">
              <img
                src="/images/hero_3d.png"
                alt="CampusRecover 3D Illustration"
                className="landing-hero-img"
              />
            </div>

            {/* Attractive Floating Badge 1 */}
            <div className="hero-floating-badge badge-top-right">
              <ShieldCheck size={18} className="badge-icon-green" />
              <span>Privacy Sandboxed</span>
            </div>

            {/* Attractive Floating Badge 2 */}
            <div className="hero-floating-badge badge-bottom-left">
              <QrCode size={18} className="badge-icon-purple" />
              <span>Instant QR Scan</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Recovery Statistics Bar */}
      <section className="landing-stats-card">
        <div className="landing-stats-header">
          — Platform Recovery Statistics —
        </div>

        <div className="landing-stats-grid">
          <div className="landing-stat-item">
            <div className="landing-stat-icon-wrap stat-purple">
              <Users size={24} />
            </div>
            <div>
              <div className="landing-stat-number">{stats.registered}</div>
              <div className="landing-stat-label">Registered Items</div>
            </div>
          </div>

          <div className="landing-stat-item">
            <div className="landing-stat-icon-wrap stat-pink">
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className="landing-stat-number">{stats.lost}</div>
              <div className="landing-stat-label">Lost Items</div>
            </div>
          </div>

          <div className="landing-stat-item">
            <div className="landing-stat-icon-wrap stat-orange">
              <Search size={24} />
            </div>
            <div>
              <div className="landing-stat-number">{stats.found}</div>
              <div className="landing-stat-label">Found Items</div>
            </div>
          </div>

          <div className="landing-stat-item">
            <div className="landing-stat-icon-wrap stat-green">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="landing-stat-number">{stats.solved}</div>
              <div className="landing-stat-label">Solved Cases</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Privacy Priority Section */}
      <section className="landing-privacy-card" id="about">
        <div className="landing-privacy-icon-box">
          <ShieldCheck size={42} />
        </div>

        <div>
          <h2 className="landing-privacy-title">Your Privacy is Our Priority</h2>
          <p className="landing-privacy-desc">
            Scanned QR codes <strong>never</strong> reveal your phone number, email address, student ID, or personal profile details. All communications are sandboxed inside the app so you can arrange handovers safely.
          </p>
        </div>

        <div>
          <img
            src="/images/privacy_lock.png"
            alt="Privacy Lock"
            className="landing-privacy-img"
          />
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" style={{ padding: '1rem 1.5rem' }}>
        <h2 className="landing-section-title">
          How it Works
          <div className="title-underline-pill"></div>
        </h2>

        <div className="landing-works-grid">
          {/* Step 1 */}
          <div className="landing-work-card">
            <div className="work-badge badge-purple">01</div>
            <div 
              className={`work-icon-circle stat-purple ${hoveredWorkStep === 1 ? 'qr-easter-egg-active' : ''}`}
              onMouseEnter={() => setHoveredWorkStep(1)}
              onMouseLeave={() => setHoveredWorkStep(null)}
              onTouchStart={() => setHoveredWorkStep(hoveredWorkStep === 1 ? null : 1)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <QrCode size={32} />
              {hoveredWorkStep === 1 && (
                <div className="qr-easter-egg-tooltip">
                  QR Uploading Started
                </div>
              )}
            </div>
            <h3 className="work-card-title">Register & Tag</h3>
            <p className="work-card-desc">
              Create accounts, register belongings, generate unique QR codes and stick them on your items.
            </p>
          </div>

          <div className="work-arrow">
            <ArrowRight size={28} />
          </div>

          {/* Step 2 */}
          <div className="landing-work-card">
            <div className="work-badge badge-pink">02</div>
            <div 
              className={`work-icon-circle stat-pink ${hoveredWorkStep === 2 ? 'qr-easter-egg-active' : ''}`}
              onMouseEnter={() => setHoveredWorkStep(2)}
              onMouseLeave={() => setHoveredWorkStep(null)}
              onTouchStart={() => setHoveredWorkStep(hoveredWorkStep === 2 ? null : 2)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <Search size={32} />
              {hoveredWorkStep === 2 && (
                <div className="qr-easter-egg-tooltip">
                  QR searching started
                </div>
              )}
            </div>
            <h3 className="work-card-title">Report & Scan</h3>
            <p className="work-card-desc">
              If you lose something, report it. If you find something, scan the QR code using the app.
            </p>
          </div>

          <div className="work-arrow">
            <ArrowRight size={28} />
          </div>

          {/* Step 3 */}
          <div className="landing-work-card">
            <div className="work-badge badge-green">03</div>
            <div 
              className={`work-icon-circle stat-green ${hoveredWorkStep === 3 ? 'qr-easter-egg-active' : ''}`}
              onMouseEnter={() => setHoveredWorkStep(3)}
              onMouseLeave={() => setHoveredWorkStep(null)}
              onTouchStart={() => setHoveredWorkStep(hoveredWorkStep === 3 ? null : 3)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <HeartHandshake size={32} />
              {hoveredWorkStep === 3 && (
                <div className="qr-easter-egg-tooltip">
                  QR Owner found
                </div>
              )}
            </div>
            <h3 className="work-card-title">Secure Hand-over</h3>
            <p className="work-card-desc">
              Chat securely in-app to arrange a meetup and confirm safe receipt to complete the recovery.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Protect What Matters Banner */}
      <section className="landing-banner-card">
        <div className="landing-banner-left">
          <div className="landing-banner-icon">
            <Gift size={36} />
          </div>
          <div>
            <h2 className="landing-banner-title">
              Protect what matters. <br />
              Join <span style={{ color: '#6d28d9' }}>CampusRecover</span> today!
            </h2>
            <p className="landing-banner-desc">
              Join hundreds of students securing their electronics and textbooks.
            </p>
          </div>
        </div>

        <div 
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={handleCreateBtnMouseEnter}
          onMouseLeave={handleCreateBtnMouseLeave}
        >
          <button onClick={handleCreateBtnClick} className="btn-hero-primary">
            Create Free Account <ArrowRight size={18} />
          </button>

          {/* Bomb Easter Egg Tooltip & Bomb Overlay */}
          {bombState !== 'idle' && (
            <div className="bomb-easter-egg-wrapper">
              {bombState === 'lit' && (
                <>
                  <div className="bomb-hurry-tooltip">
                    Hurry up! 💣⚡
                  </div>
                  <div className="bomb-icon-container lit-bomb-pulse">
                    <svg width="42" height="42" viewBox="0 0 64 64" fill="none">
                      <circle cx="30" cy="38" r="22" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                      <circle cx="22" cy="30" r="5" fill="#475569" opacity="0.6" />
                      <rect x="25" y="12" width="10" height="6" rx="2" fill="#475569" />
                      <path d="M30 12 Q 36 6 42 10" stroke="#d97706" strokeWidth="3" fill="none" strokeDasharray="2 2" className="fuse-spark" />
                      <circle cx="42" cy="10" r="4" fill="#f59e0b" className="spark-glow" />
                      <circle cx="42" cy="10" r="2" fill="#ef4444" />
                    </svg>
                  </div>
                </>
              )}

              {bombState === 'sparkles' && (
                <div className="bomb-sparkles-celebration">
                  <div className="bomb-hurry-tooltip success-tooltip">
                    Awesome! Redirecting... ✨
                  </div>
                  <div className="sparkle-particles-burst">
                    <span className="b-sparkle s1">✨</span>
                    <span className="b-sparkle s2">🎉</span>
                    <span className="b-sparkle s3">⭐</span>
                    <span className="b-sparkle s4">💜</span>
                    <span className="b-sparkle s5">⚡</span>
                  </div>
                </div>
              )}

              {bombState === 'blast' && (
                <div className="bomb-blast-overlay">
                  <div className="blast-flash"></div>
                  <div className="blast-text">BOOM! 💥</div>
                  <div className="blast-smoke-particles">
                    <span className="smoke p1">💨</span>
                    <span className="smoke p2">💥</span>
                    <span className="smoke p3">🔥</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="landing-footer" id="contact">
        <div className="landing-footer-grid">
          <div>
            <div className="landing-brand" onClick={() => navigate('/')}>
              <div className="landing-brand-logo">
                <QrCode size={22} />
              </div>
              <span className="landing-brand-title">CampusRecover</span>
            </div>
            <p className="landing-footer-brand-desc">
              Built with privacy and care for college campuses.
            </p>
          </div>

          <div>
            <h4 className="landing-footer-heading">Quick Links</h4>
            <ul className="landing-footer-list">
              <li><a href="#how-it-works" className="landing-footer-link">How it Works</a></li>
              <li><a href="#about" className="landing-footer-link">About Us</a></li>
              <li><a href="#faqs" className="landing-footer-link">FAQs</a></li>
              <li><a href="#contact" className="landing-footer-link">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="landing-footer-heading">Resources</h4>
            <ul className="landing-footer-list">
              <li><a href="#" className="landing-footer-link">Privacy Policy</a></li>
              <li><a href="#" className="landing-footer-link">Terms of Service</a></li>
              <li><a href="#" className="landing-footer-link">Community Guidelines</a></li>
            </ul>
          </div>

          <div>
            <h4 className="landing-footer-heading">Connect</h4>
            <div className="social-icons-row">
              <div className="social-circle social-insta" title="Instagram"><Globe size={18} /></div>
              <div className="social-circle social-twitter" title="Twitter"><Share2 size={18} /></div>
              <div className="social-circle social-whatsapp" title="WhatsApp"><MessageCircle size={18} /></div>
              <div className="social-circle social-mail" title="Mail"><Mail size={18} /></div>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          &copy; {new Date().getFullYear()} CampusRecover. All rights reserved.
        </div>
      </footer>

      {/* Register Button Magic Toast */}
      {registerMagicActive && (
        <div className="register-magic-toast">
          🎉 You found a little CampusRecover magic!
        </div>
      )}
    </div>
  );
};

export default LandingPage;
