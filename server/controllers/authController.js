const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT and set HttpOnly Cookie
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'campus_recover_super_secret_session_key',
    { expiresIn: '1d' }
  );

  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd
  };

  // Safe user data to return
  const userData = {
    _id: user._id,
    name: user.name,
    studentId: user.studentId,
    email: user.email,
    phone: user.phone,
    department: user.department,
    year: user.year,
    role: user.role,
    isVerified: user.isVerified
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token, // Send in body as well for alternative header usage
      data: {
        user: userData
      }
    });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, studentId, email, phone, department, year, password } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email is already registered.'
      });
    }

    // Check if student ID already exists
    const idExists = await User.findOne({ studentId });
    if (idExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this Student ID is already registered.'
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      studentId,
      email,
      phone,
      department,
      year,
      passwordHash
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Login User (Email or Student ID)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { emailOrStudentId, password } = req.body;

    if (!emailOrStudentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/student ID and password'
      });
    }

    // Find user by email OR studentId
    const user = await User.findOne({
      $or: [
        { email: emailOrStudentId.toLowerCase() },
        { studentId: emailOrStudentId }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User / Clear Cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by authMiddleware
    res.status(200).json({
      success: true,
      message: 'Current user profile retrieved',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password (Mock)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email does not exist.'
      });
    }

    // In a production app, we would send a token.
    // For local/demo testing, return success and a mock token
    res.status(200).json({
      success: true,
      message: 'Password reset link simulated. Check dev console.',
      data: {
        resetToken: 'mock-reset-token-xyz-123'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password (Mock)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid reset token and new password.'
      });
    }

    // Mock verification for local demonstration
    if (token !== 'mock-reset-token-xyz-123') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Fetch student Kumar as mock or retrieve user from email if stored
    const user = await User.findOne({ email: 'kumar@example.com' });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found to reset password.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You may now sign in.',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
