const mongoose = require('mongoose');

const qrScanSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    scanner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Can be null if scanned anonymously or before logging in
    },
    scannedAt: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['VIEWED', 'FOUND_REPORTED', 'CONTACTED'],
      default: 'VIEWED'
    },
    location: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('QRScan', qrScanSchema);
