const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: true
    },
    location: {
      type: String,
      required: [true, 'Please add a location']
    },
    date: {
      type: Date,
      default: Date.now
    },
    time: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['UNSOLVED', 'FOUND', 'IN_PROGRESS', 'SOLVED'],
      default: 'UNSOLVED'
    },
    foundBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    foundAt: {
      type: Date
    },
    contactedAt: {
      type: Date
    },
    handoverAt: {
      type: Date
    },
    returnedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', reportSchema);
