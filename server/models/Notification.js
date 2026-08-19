const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'QR_SCANNED',
        'ITEM_FOUND',
        'NEW_MESSAGE',
        'HANDOVER_PENDING',
        'ITEM_RETURNED',
        'REPORT_UPDATED'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    relatedReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
