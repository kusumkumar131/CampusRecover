const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get Current User Profile
// @route   GET /api/users/me
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({
      success: true,
      message: 'Profile retrieved',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Current User Profile
// @route   PATCH /api/users/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, year, profileImage } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (department !== undefined) fieldsToUpdate.department = department;
    if (year !== undefined && year !== '') {
      const parsedYear = parseInt(year, 10);
      if (Number.isInteger(parsedYear) && parsedYear >= 1) {
        fieldsToUpdate.year = parsedYear;
      }
    }
    if (profileImage !== undefined) fieldsToUpdate.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change User Password
// @route   PATCH /api/users/me/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new passwords'
      });
    }

    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
