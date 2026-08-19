const express = require('express');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validateFields = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.route('/me')
  .get(getProfile)
  .patch(updateProfile);

router.patch(
  '/me/password',
  [
    body('currentPassword', 'Current password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 }),
    validateFields
  ],
  changePassword
);

module.exports = router;
