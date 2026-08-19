const Notification = require('../models/Notification');

/**
 * Creates and saves a notification to the database
 * @param {Object} params Notification parameters
 * @param {string} params.user ObjectId of the recipient user
 * @param {string} params.type Notification type (e.g. QR_SCANNED, ITEM_FOUND)
 * @param {string} params.title Notification title
 * @param {string} params.message Notification body text
 * @param {string} [params.relatedItem] Optional Item ObjectId
 * @param {string} [params.relatedReport] Optional Report ObjectId
 * @returns {Promise<Object>} The saved notification document
 */
const createNotification = async ({ user, type, title, message, relatedItem, relatedReport }) => {
  try {
    const notification = new Notification({
      user,
      type,
      title,
      message,
      relatedItem,
      relatedReport
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    // Do not throw to avoid crashing parent flows on notification failures
    return null;
  }
};

module.exports = { createNotification };
