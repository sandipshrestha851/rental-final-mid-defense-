const { verifyToken } = require('../utils/jwt');
const messageModel = require('../models/messageModel');
const { logger } = require('../utils/logger');

const onlineUsers = new Map();

function addOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}

function removeOnline(socketId) {
  for (const [userId, sids] of onlineUsers.entries()) {
    if (sids.has(socketId)) {
      sids.delete(socketId);
      const wentOffline = sids.size === 0;
      if (wentOffline) onlineUsers.delete(userId);
      return { userId, wentOffline };
    }
  }
  return null;
}

function isOnline(userId) {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

let ioInstance = null;

function verifySocketToken(socket) {
  let token =
    (socket.handshake.auth && socket.handshake.auth.token) ||
    (socket.handshake.query && socket.handshake.query.token) ||
    null;

  if (!token) {
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
      const cookies = {};
      cookieHeader.split(';').forEach(c => {
        const parts = c.split('=');
        if (parts.length === 2) {
          cookies[parts[0].trim()] = parts[1].trim();
        }
      });
      const cookieToken = cookies['access_token'];
      if (cookieToken) token = cookieToken;
    }
  }

  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (err) {
    return null;
  }
}


function setupSocket(io) {
  ioInstance = io;
  io.use((socket, next) => {
    const decoded = verifySocketToken(socket);
    if (!decoded || !decoded.user_id) {
      logger.warn('Socket connection rejected: Invalid Token');
      return next(new Error('Unauthorized'));
    }
    socket.data.userId = decoded.user_id;
    socket.data.role = decoded.role || null;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;

    addOnline(userId, socket.id);
    socket.join(`user_${userId}`);
    if (role === 'admin') {
      socket.join('admin_room');
      logger.info(`Admin user ${userId} joined admin_room`);
    }
    logger.info(`User ${userId} (role: ${role}) connected on socket ${socket.id}`);

    io.emit('user_status', { user_id: userId, status: 'online' });

    socket.on('send_message', async (data = {}) => {
      let senderId;
      try {
        const decoded = verifyToken(data.token);
        senderId = decoded.user_id;
      } catch (err) {
        socket.emit('error', { message: 'Unauthorized token' });
        return;
      }

      const receiverId = data.receiver_id;
      const messageText = (data.message || '').trim();
      if (!receiverId || !messageText) return;

      try {
        const insertId = await messageModel.create(senderId, receiverId, messageText);
        const payload = {
          id: insertId,
          sender_id: senderId,
          receiver_id: receiverId,
          message: messageText,
          created_at: new Date().toISOString(),
        };

        io.to(`user_${receiverId}`).emit('new_message', payload);
        io.to(`user_${senderId}`).emit('new_message', payload);

        // Trigger real-time in-app notification
        const NotificationService = require('../services/notificationService');
        await NotificationService.notify({
          recipientUserId: receiverId,
          senderUserId: senderId,
          type: 'new_message',
          title: 'New Message Received',
          message: `You received a new message: "${messageText.length > 50 ? messageText.substring(0, 47) + '...' : messageText}"`,
          referenceType: 'chat',
          referenceId: senderId
        });
      } catch (err) {
        socket.emit('error', { message: `Failed to send message: ${err.message}` });
      }
    });


    socket.on('typing', (data = {}) => {
      let senderId;
      try {
        const decoded = verifyToken(data.token);
        senderId = decoded.user_id;
      } catch (err) {
        return;
      }

      const receiverId = data.receiver_id;
      const isTyping = Boolean(data.is_typing);

      if (receiverId) {
        io.to(`user_${receiverId}`).emit('user_typing', {
          sender_id: senderId,
          is_typing: isTyping,
        });
      }
    });

    socket.on('disconnect', () => {
      const info = removeOnline(socket.id);
      if (info) {
        logger.info(`User ${info.userId} disconnected from socket ${socket.id}`);
        if (info.wentOffline) {
          io.emit('user_status', { user_id: info.userId, status: 'offline' });
        }
      }
    });
  });
}

function sendRealtimeNotification(recipientUserId, recipientRole, notification) {
  if (!ioInstance) {
    logger.warn('Socket.IO instance not initialized yet. Cannot send real-time notification.');
    return;
  }

  const payload = {
    id: notification.id,
    user_id: notification.recipient_user_id,
    sender_user_id: notification.sender_user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    reference_type: notification.reference_type,
    reference_id: notification.reference_id,
    related_id: notification.reference_id,
    is_read: notification.is_read || 0,
    created_at: notification.created_at || new Date().toISOString(),
  };

  if (recipientRole === 'admin') {
    ioInstance.to('admin_room').emit('new_notification', payload);
    logger.info(`Emitted notification to admin_room: ${notification.title}`);
  } else if (recipientUserId) {
    ioInstance.to(`user_${recipientUserId}`).emit('new_notification', payload);
    logger.info(`Emitted notification to user_${recipientUserId}: ${notification.title}`);
  }
}

module.exports = { setupSocket, isOnline, sendRealtimeNotification };
