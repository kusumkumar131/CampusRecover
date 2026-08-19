import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, QrCode } from 'lucide-react';
import * as itemService from '../services/itemService';

const ItemQR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await itemService.getItemById(id);
        if (response.success) {
          setItem(response.data.item);
        } else {
          setError(response.message || 'Failed to fetch item details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error occurred while loading item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDownload = () => {
    if (!item?.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = item.qrCodeUrl;
    link.download = `CampusRecover_QR_${item.itemId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    // Open a simple print window with just the QR badge
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${item.name}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 90vh;
              text-align: center;
              background: white;
              color: black;
            }
            .qr-card {
              border: 3px solid black;
              padding: 2.5rem;
              border-radius: 16px;
              display: inline-block;
            }
            .qr-img {
              width: 250px;
              height: 250px;
              margin-bottom: 1rem;
            }
            h1 { font-size: 1.8rem; margin: 0 0 0.5rem 0; }
            p { font-size: 1.1rem; color: #444; margin: 0; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="qr-card">
            <h1>${item.name}</h1>
            <p>ID: ${item.itemId}</p>
            <img class="qr-img" src="${item.qrCodeUrl}" alt="QR Code" />
            <p style="font-size: 0.9rem; color: #666; font-weight: normal; margin-top: 1rem;">
              Scan to report lost/found on CampusRecover
            </p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading QR code...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-lost)', marginBottom: '1.5rem' }}>{error || 'Item not found'}</p>
        <button onClick={() => navigate('/items')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to items
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/items')} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>Item QR Label</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Download or print this QR label and stick it securely to your belonging.
          </p>
        </div>
      </div>

      {/* QR Card */}
      <div className="glass" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{item.name}</h2>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Item ID: <strong style={{ color: 'var(--primary)' }}>{item.itemId}</strong>
          </span>
        </div>

        {/* QR Code Wrapper */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {item.qrCodeUrl ? (
            <img 
              src={item.qrCodeUrl} 
              alt={`QR Code for ${item.name}`} 
              style={{ width: '220px', height: '220px', display: 'block' }}
            />
          ) : (
            <div style={{ width: '220px', height: '220px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
              <QrCode size={48} />
            </div>
          )}
        </div>

        {/* Instructions */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '360px', lineHeight: 1.5 }}>
          Attach this QR code securely to your item. Anyone who scans it will be able to contact you safely without seeing your private details.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '360px' }}>
          <button onClick={handleDownload} className="btn btn-primary" style={{ flex: 1 }}>
            <Download size={18} /> Download
          </button>
          <button onClick={handlePrint} className="btn btn-secondary" style={{ flex: 1 }}>
            <Printer size={18} /> Print QR
          </button>
        </div>

      </div>

    </div>
  );
};

export default ItemQR;
