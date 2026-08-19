const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please add item name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    identificationDetails: {
      type: String,
      trim: true
    },
    qrCodeUrl: {
      type: String
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'LOST', 'FOUND', 'CONTACTED', 'HANDOVER_PENDING', 'RETURNED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Item', itemSchema);
