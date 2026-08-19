const User = require('../models/User');
const Item = require('../models/Item');
const Report = require('../models/Report');

// @desc    Get admin dashboard metrics & analytics data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardMetrics = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRegisteredItems = await Item.countDocuments();
    
    // Reports metrics
    const totalLostReports = await Report.countDocuments({ type: 'LOST' });
    const totalFoundReports = await Report.countDocuments({ type: 'FOUND' }); // Finder-initiated reports if any
    const totalSolvedReports = await Report.countDocuments({ status: 'SOLVED' });
    const totalUnsolvedReports = await Report.countDocuments({ status: { $ne: 'SOLVED' }, type: 'LOST' });

    // Recovery Rate
    const recoveryRate = totalLostReports > 0 
      ? Math.round((totalSolvedReports / totalLostReports) * 100)
      : 0;

    // Charts: Lost items by category
    const categoryData = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // Charts: Lost items by location
    const locationData = await Report.aggregate([
      { $match: { type: 'LOST' } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
      { $limit: 10 }
    ]);

    // Charts: Monthly lost/found trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyData = await Report.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly trend data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      trendMap[key] = { name: key, lost: 0, found: 0 };
    }

    monthlyData.forEach((item) => {
      const monthIdx = item._id.month - 1;
      const key = `${monthNames[monthIdx]} ${item._id.year}`;
      if (trendMap[key]) {
        if (item._id.type === 'LOST') {
          trendMap[key].lost = item.count;
        } else {
          trendMap[key].found = item.count;
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Admin metrics retrieved',
      data: {
        metrics: {
          totalStudents,
          totalRegisteredItems,
          totalLostReports,
          totalFoundReports,
          totalSolvedReports,
          totalUnsolvedReports,
          recoveryRate
        },
        analytics: {
          categoryData,
          locationData,
          monthlyTrend: Object.values(trendMap)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Users retrieved',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend or unsuspend a user account
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private/Admin
exports.toggleSuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend admin accounts'
      });
    }

    // Toggle suspension flag
    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account successfully ${user.isSuspended ? 'suspended' : 'activated'}`,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items list (admin override)
// @route   GET /api/admin/items
// @access  Private/Admin
exports.getItems = async (req, res, next) => {
  try {
    const items = await Item.find()
      .populate('owner', 'name studentId email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Items retrieved',
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports list (admin override)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('item', 'name itemId category status')
      .populate('owner', 'name studentId email')
      .populate('foundBy', 'name studentId email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Reports retrieved',
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Remove report (admin override)
// @route   DELETE /api/admin/reports/:id
// @access  Private/Admin
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Reset item status back to ACTIVE if report is deleted
    const item = await Item.findById(report.item);
    if (item && item.status !== 'RETURNED') {
      item.status = 'ACTIVE';
      await item.save();
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report removed successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
