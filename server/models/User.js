const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    studentId: {
      type: String,
      required: [true, 'Please add a student ID or roll number'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    year: {
      type: mongoose.Schema.Types.Mixed
    },
    passwordHash: {
      type: String,
      required: [true, 'Please add a password']
    },
    profileImage: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isSuspended: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
