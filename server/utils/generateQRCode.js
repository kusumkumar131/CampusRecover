const QRCode = require('qrcode');

/**
 * Generates a base64 QR code image string from a given URL or text
 * @param {string} text The text/URL to encode inside the QR code
 * @returns {Promise<string>} Base64 image data URL
 */
const generateQRCode = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#1e1b4b', // Deep indigo
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('QR Code Generation Error:', error.message);
    throw new Error('Failed to generate QR Code');
  }
};

module.exports = generateQRCode;
