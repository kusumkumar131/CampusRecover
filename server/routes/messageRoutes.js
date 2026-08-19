const express = require('express');
const { body } = require('express-validator');
const { sendMessage, getConversations, getMessagesForConversation, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const validateFields = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(
    [
      body('receiverId', 'Receiver ID is required').notEmpty(),
      body('itemId', 'Item ID is required').notEmpty(),
      body('message', 'Message text is required').notEmpty().trim(),
      validateFields
    ],
    sendMessage
  )
  .get(getConversations);

router.get('/:conversationId', getMessagesForConversation);
router.patch('/:id/read', markAsRead);

module.exports = router;
