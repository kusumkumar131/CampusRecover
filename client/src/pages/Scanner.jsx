import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Camera, AlertCircle, Laptop, Smartphone, FileText } from 'lucide-react';
import * as itemService from '../services/itemService';

const Scanner = () => {
  const navigate = useNavigate();
  const [demoItemId, setDemoItemId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myItems, setMyItems] = useState([]);

  // Load user items in dev simulator to make testing simple
  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await itemService.getMyItems();
        if (response.success) {
          setMyItems(response.data);
        }
      } catch (err) {
        console.log('Not logged in or failed to load my items for simulation');
      }
    };
    fetchMyItems();
  }, []);

  // HTML5-QRCode Scanner initialization
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    });

    const onScanSuccess = (decodedText) => {
      scanner.clear();
      // Extract Item ID from scanned URL
      // If URL is e.g. http://localhost:5173/scan/CR-ELE-B00DBE
      // The Item ID is the last segment
      try {
        const urlParts = decodedText.split('/');
        const itemId = urlParts[urlParts.length - 1];
        if (itemId.startsWith('CR-')) {
          navigate(`/scan/${itemId}`);
        } else {
          setError('Invalid QR code format. Not a CampusRecover label.');
        }
      } catch (err) {
        setError('Failed to parse scanned QR content.');
      }
    };

    const onScanFailure = (error) => {
      // Quietly log scanner failures as they happen continuously
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.log('Scanner cleanup warning:', err));
    };
  }, [navigate]);

  const handleSimulateScan = (e) => {
    e.preventDefault();
    if (!demoItemId) return;
    
    // Cleanup input and navigate to the public scan details page
    const cleanId = demoItemId.trim();
    navigate(`/scan/${cleanId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '650px', margin: '0 auto' }}>
      
      <div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Scan QR Code</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Scan the QR sticker on the item using your camera to identify it and contact the owner.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          color: 'var(--color-lost)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Camera Reader Area */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Camera size={18} className="brand-logo" /> Live Camera Scanner
        </h3>
        
        <div 
          id="qr-reader" 
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            margin: '0 auto', 
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            background: 'black'
          }}
        ></div>
        
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          Please authorize camera permissions if prompted. Works best on mobile browsers.
        </p>
      </div>

      {/* Developer / Testing Simulator Section */}
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <QrCode size={18} style={{ color: 'var(--color-found)' }} /> QR Scanner Simulator (Development Mode)
        </h3>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Since testing webcams locally can be tricky, paste an Item ID below (e.g. <code>CR-ELE-B00DBE</code>) or select a quick option to simulate a successful scan.
        </p>

        <form onSubmit={handleSimulateScan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Item ID / Scan Payload</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CR-ELE-B00DBE"
              value={demoItemId}
              onChange={(e) => setDemoItemId(e.target.value)}
              required
            />
          </div>

          {/* Quick presets list for testing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>Quick Presets (Seeded items):</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={() => setDemoItemId('CR-ELE-B00DBE')} 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Kumar's Headset (LOST)
              </button>
              <button 
                type="button" 
                onClick={() => setDemoItemId('CR-BOK-ALGO1')} 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Kumar's CLRS Book (ACTIVE)
              </button>
            </div>

            {myItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>Your newly registered items:</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {myItems.map(item => (
                    <button 
                      key={item._id} 
                      type="button" 
                      onClick={() => setDemoItemId(item.itemId)} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--primary)' }}
                    >
                      {item.name} ({item.itemId})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', width: '100%' }}>
            Simulate Successful Scan
          </button>
        </form>
      </div>

    </div>
  );
};

export default Scanner;
