const Report = require('../models/Report');
const Item = require('../models/Item');
const QRScan = require('../models/QRScan');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Report an item as LOST
// @route   POST /api/reports/lost
// @access  Private
exports.reportLost = async (req, res, next) => {
  try {
    const { itemId, location, date, time, description } = req.body;

    if (!itemId || !location) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and location are required'
      });
    }

    const item = await Item.findOne({ itemId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Rule 1: Only the owner can report item as lost
    if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can report this item as lost'
      });
    }

    // Rule 4: A returned item cannot be reported as lost without a new report/recovery cycle
    if (item.status === 'LOST' || item.status === 'FOUND' || item.status === 'CONTACTED' || item.status === 'HANDOVER_PENDING') {
      return res.status(400).json({
        success: false,
        message: `This item is already in a recovery cycle (Current status: ${item.status})`
      });
    }

    // Create Report
    const report = await Report.create({
      item: item._id,
      owner: req.user.id,
      type: 'LOST',
      location,
      date: date ? new Date(date) : new Date(),
      time: time || '',
      description: description || '',
      status: 'UNSOLVED'
    });

    // Transition Item status to LOST
    item.status = 'LOST';
    await item.save();

    res.status(201).json({
      success: true,
      message: 'Item reported as lost successfully',
      data: { report, item }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finder reports item as FOUND
// @route   POST /api/reports/found
// @access  Private
exports.reportFound = async (req, res, next) => {
  try {
    const { itemId, location, date, time, description } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    const item = await Item.findOne({ itemId });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Verify item is currently lost
    if (item.status !== 'LOST') {
      return res.status(400).json({
        success: false,
        message: 'This item has not been reported as lost'
      });
    }

    // Rule 3: A user cannot report their own item as found through this finder flow
    if (item.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report your own item as found. Use the dashboard to manage your item.'
      });
    }

    // Find the active report for this item
    let report = await Report.findOne({ item: item._id, type: 'LOST', status: 'UNSOLVED' });
    if (!report) {
      // If no report, create one (fallback, though one should exist if status is LOST)
      report = new Report({
        item: item._id,
        owner: item.owner,
        type: 'LOST',
        location: location || 'Campus',
        status: 'UNSOLVED'
      });
    }

    // Update Report details
    report.status = 'FOUND';
    report.foundBy = req.user.id;
    report.foundAt = new Date();
    if (location) report.location = location; // Update if finder provides more details
    await report.save();

    // Transition Item status to FOUND
    item.status = 'FOUND';
    await item.save();

    // Record the QR scan action as FOUND_REPORTED
    await QRScan.create({
      item: item._id,
      scanner: req.user.id,
      action: 'FOUND_REPORTED',
      location: location || ''
    });

    // Notify the owner
    await createNotification({
      user: item.owner,
      type: 'ITEM_FOUND',
      title: 'Item Found!',
      message: `Great news! Someone has found your "${item.name}". They have contacted you through the app.`,
      relatedItem: item._id,
      relatedReport: report._id
    });

    res.status(200).json({
      success: true,
      message: 'Item reported as found. Owner has been notified.',
      data: { report, item }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (with search & filters)
// @route   GET /api/reports
// @access  Private
exports.getAllReports = async (req, res, next) => {
  try {
    const { type, category, location, status, search, page = 1, limit = 12 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };

    // Filter by item category (requires joining Item schema)
    let itemQuery = {};
    if (category) itemQuery.category = category;
    if (search) itemQuery.name = { $regex: search, $options: 'i' };

    let itemsMatching = [];
    if (category || search) {
      itemsMatching = await Item.find(itemQuery).select('_id');
      query.item = { $in: itemsMatching.map(i => i._id) };
    }

    const skip = (page - 1) * limit;
    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('item')
      .populate('owner', 'name studentId department')
      .populate('foundBy', 'name studentId department')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Reports retrieved',
      data: reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my reports (tabs: Lost vs Found)
// @route   GET /api/reports/my
// @access  Private
exports.getMyReports = async (req, res, next) => {
  try {
    const { tab } = req.query; // 'lost' or 'found'

    let query = {};
    if (tab === 'found') {
      // Reports where I am the finder
      query.foundBy = req.user.id;
    } else {
      // Default: Reports where I am the owner
      query.owner = req.user.id;
      query.type = 'LOST';
    }

    const reports = await Report.find(query)
      .populate('item')
      .populate('owner', 'name studentId department')
      .populate('foundBy', 'name studentId department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'My reports retrieved',
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single report with timeline details
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('item')
      .populate('owner', 'name studentId email phone department year')
      .populate('foundBy', 'name studentId email phone department year');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Only owner, finder, or admin can view report details
    const isOwner = report.owner._id.toString() === req.user.id;
    const isFinder = report.foundBy && report.foundBy._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFinder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this report details'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report retrieved',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report details (e.g. location, description, or status)
// @route   PATCH /api/reports/:id
// @access  Private
exports.updateReport = async (req, res, next) => {
  try {
    const { location, description, status } = req.body;
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const isOwner = report.owner.toString() === req.user.id;
    const isFinder = report.foundBy && report.foundBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFinder && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this report'
      });
    }

    // Status transitions
    if (status) {
      // Validate transition rules
      const item = await Item.findById(report.item);
      
      if (status === 'IN_PROGRESS') {
        // Can transition from FOUND to IN_PROGRESS (Contacted)
        if (report.status !== 'FOUND' && report.status !== 'UNSOLVED') {
          return res.status(400).json({ success: false, message: 'Invalid status transition' });
        }
        report.status = 'IN_PROGRESS';
        if (!report.contactedAt) report.contactedAt = new Date();
        item.status = 'CONTACTED';
      } else if (status === 'HANDOVER_PENDING') {
        // Can transition to HANDOVER_PENDING from IN_PROGRESS
        if (report.status !== 'IN_PROGRESS') {
          return res.status(400).json({ success: false, message: 'Cannot arrange handover before contacting' });
        }
        report.status = 'IN_PROGRESS'; // Report status remains IN_PROGRESS as per spec section 21, but Item becomes HANDOVER_PENDING
        report.handoverAt = new Date();
        item.status = 'HANDOVER_PENDING';
        
        // Notify the other party
        const notifyRecipient = isOwner ? report.foundBy : report.owner;
        await createNotification({
          user: notifyRecipient,
          type: 'HANDOVER_PENDING',
          title: 'Handover Proposed',
          message: `${req.user.name} has proposed meeting up to return your item.`,
          relatedItem: item._id,
          relatedReport: report._id
        });
      }
      
      await item.save();
    }

    if (location) report.location = location;
    if (description) report.description = description;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner confirms receipt of item (SOLVED)
// @route   POST /api/reports/:id/confirm-return
// @access  Private
exports.confirmReturn = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('item');
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Rule 1: Only the owner can confirm return
    if (report.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can confirm receipt of the item'
      });
    }

    // Transition state
    report.status = 'SOLVED';
    report.returnedAt = new Date();
    await report.save();

    const item = report.item;
    item.status = 'RETURNED';
    await item.save();

    // Notify finder if there is one
    if (report.foundBy) {
      await createNotification({
        user: report.foundBy,
        type: 'ITEM_RETURNED',
        title: 'Recovery Confirmed!',
        message: `${req.user.name} has confirmed that they safely received their "${item.name}". Thank you for your help!`,
        relatedItem: item._id,
        relatedReport: report._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Return confirmed. Case marked as SOLVED.',
      data: { report, item }
    });
  } catch (error) {
    next(error);
  }
};
