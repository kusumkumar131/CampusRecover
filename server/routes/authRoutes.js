const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateFields = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Full Name is required').notEmpty().trim(),
    body('studentId', 'Student ID / Roll Number is required').notEmpty().trim(),
    body('email', 'Please include a valid college email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
    validateFields
  ],
  register
);

router.post(
  '/login',
  [
    body('emailOrStudentId', 'Email or Student ID is required').notEmpty().trim(),
    body('password', 'Password is required').notEmpty(),
    validateFields
  ],
  login
);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
