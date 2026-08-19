const Message = require('../models/Message');
const Item = require('../models/Item');
const Report = require('../models/Report');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, itemId, reportId, message } = req.body;

    if (!receiverId || !itemId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID, Item ID, and message text are required'
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Determine associated report
    let report;
    if (reportId) {
      report = await Report.findById(reportId);
    } else {
      report = await Report.findOne({ item: itemId, status: { $ne: 'SOLVED' } });
    }

    if (!report) {
      return res.status(400).json({
        success: false,
        message: 'No active lost/found report exists for this item'
      });
    }

    // Rule 7: Only participants (owner or finder) can send/access messages
    const isOwner = item.owner.toString() === req.user.id;
    const isFinder = report.foundBy && report.foundBy.toString() === req.user.id;

    if (!isOwner && !isFinder && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only participants in this recovery flow can exchange messages'
      });
    }

    // Create message
    const msg = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      item: itemId,
      report: report._id,
      message,
      read: false
    });

    // Auto-transition Item status from LOST/FOUND to CONTACTED on first exchange
    if (item.status === 'FOUND' || item.status === 'LOST') {
      item.status = 'CONTACTED';
      await item.save();

      report.status = 'IN_PROGRESS';
      if (!report.contactedAt) {
        report.contactedAt = new Date();
      }
      await report.save();
    }

    // Notify receiver
    await createNotification({
      user: receiverId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      message: `You have a new message from ${req.user.name}: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`,
      relatedItem: itemId,
      relatedReport: report._id
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: msg }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations/chats list for current user
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    // Find messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('item', 'name itemId status')
      .populate('report', 'location status')
      .populate('sender', 'name studentId')
      .populate('receiver', 'name studentId')
      .sort({ createdAt: -1 });

    // Group messages by item/conversation
    const conversationsMap = {};

    messages.forEach((msg) => {
      if (!msg.item) return;
      const conversationKey = msg.item._id.toString();

      if (!conversationsMap[conversationKey]) {
        // Determine the other participant
        const otherParticipant =
          msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender;

        conversationsMap[conversationKey] = {
          item: msg.item,
          report: msg.report,
          otherParticipant,
          lastMessage: {
            text: msg.message,
            senderId: msg.sender._id,
            createdAt: msg.createdAt,
            read: msg.read
          },
          unreadCount: (!msg.read && msg.receiver._id.toString() === req.user.id) ? 1 : 0
        };
      } else {
        // Increment unread count if it's unread and user is the receiver
        if (!msg.read && msg.receiver._id.toString() === req.user.id) {
          conversationsMap[conversationKey].unreadCount += 1;
        }
      }
    });

    const conversations = Object.values(conversationsMap);

    res.status(200).json({
      success: true,
      message: 'Conversations retrieved',
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history for a conversation (conversationId is the Item ID)
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessagesForConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params; // Item ID

    // Rule 7: Verify participation
    const item = await Item.findById(conversationId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const report = await Report.findOne({ item: conversationId, status: { $ne: 'SOLVED' } });

    const isOwner = item.owner.toString() === req.user.id;
    const isFinder = report && report.foundBy && report.foundBy.toString() === req.user.id;

    if (!isOwner && !isFinder && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this conversation.'
      });
    }

    // Get messages
    const messages = await Message.find({
      item: conversationId,
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark messages sent to current user in this conversation as read
    await Message.updateMany(
      { item: conversationId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Message history retrieved',
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a message as read
// @route   PATCH /api/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot mark this message as read'
      });
    }

    message.read = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    next(error);
  }
};
