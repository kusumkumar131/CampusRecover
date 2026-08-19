const Item = require('../models/Item');
const User = require('../models/User');
const QRScan = require('../models/QRScan');
const Report = require('../models/Report');
const { createNotification } = require('../utils/notificationHelper');
const jwt = require('jsonwebtoken');

// Helper to optionally identify scanner from cookie/headers
const getScannerIdFromRequest = (req) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_recover_super_secret_session_key');
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// @desc    Scan QR Code / Fetch safe public details
// @route   GET /api/qr/:itemId
// @access  Public
exports.scanQRCode = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { location } = req.query; // Optional scan location

    // Find the item
    const item = await Item.findOne({ itemId }).populate('owner', 'name department');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'QR code not recognized. Item not found.'
      });
    }

    // Identify scanner if logged in
    const scannerId = getScannerIdFromRequest(req);

    // Record the scan in QRScan collection
    const qrScan = await QRScan.create({
      item: item._id,
      scanner: scannerId,
      action: 'VIEWED',
      location: location || ''
    });

    // Notify the owner (Rule 5: QR scan must be recorded and owner notified)
    // Only notify if scanner is NOT the owner
    if (!scannerId || scannerId.toString() !== item.owner._id.toString()) {
      await createNotification({
        user: item.owner._id,
        type: 'QR_SCANNED',
        title: 'QR Code Scanned',
        message: `Someone scanned the QR code on your "${item.name}".`,
        relatedItem: item._id
      });
    }

    // Find associated active report if item is LOST
    let activeReport = null;
    if (item.status === 'LOST') {
      activeReport = await Report.findOne({ item: item._id, status: { $ne: 'SOLVED' } });
    }

    // Return PRIVACY-SAFE details (Rule 6: Never expose owner phone/email)
    const safeItem = {
      _id: item._id,
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      brand: item.brand,
      color: item.color,
      status: item.status,
      owner: {
        name: item.owner.name,
        department: item.owner.department
      },
      report: activeReport ? {
        _id: activeReport._id,
        location: activeReport.location,
        date: activeReport.date,
        description: activeReport.description
      } : null
    };

    res.status(200).json({
      success: true,
      message: 'QR code successfully identified',
      data: {
        item: safeItem,
        scanId: qrScan._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Alternative POST Scan Endpoint
// @route   POST /api/qr/scan
// @access  Public
exports.scanQRCodePost = async (req, res, next) => {
  try {
    const { itemId, location } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Reuse the scanning logic
    req.params.itemId = itemId;
    req.query.location = location;
    return exports.scanQRCode(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Get scan history for a specific item
// @route   GET /api/qr/:itemId/history
// @access  Private
exports.getQRScanHistory = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findOne({ itemId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Only owner or admin can see scan history
    if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this item\'s scan history'
      });
    }

    const scans = await QRScan.find({ item: item._id })
      .populate('scanner', 'name studentId department')
      .sort({ scannedAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Scan history retrieved',
      data: scans
    });
  } catch (error) {
    next(error);
  }
};
