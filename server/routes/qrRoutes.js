const express = require('express');
const { scanQRCode, scanQRCodePost, getQRScanHistory } = require('../controllers/qrController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public endpoints
router.get('/:itemId', scanQRCode);
router.post('/scan', scanQRCodePost);

// Protected endpoints
router.get('/:itemId/history', protect, getQRScanHistory);

module.exports = router;
