const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Dispatch an in-app notification
 */
const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  try {
    if (!recipient || !title || !message) {
      return null;
    }

    // Do not notify self
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (error) {
    logger.error('Failed to dispatch notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
