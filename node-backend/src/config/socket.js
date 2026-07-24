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

function verifySocketToken(socket) {
  let token =
    (socket.handshake.auth && socket.handshake.auth.token) ||
    (socket.handshake.query && socket.handshake.query.token) ||
    null;
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded.user_id;
  } catch (err) {
    return null;
  }
}

function setupSocket(io) {
  io.use((socket, next) => {
    const userId = verifySocketToken(socket);
    if (!userId) {
      logger.warn('Socket connection rejected: Invalid Token');
      return next(new Error('Unauthorized'));
    }
    socket.data.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    addOnline(userId, socket.id);
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} connected on socket ${socket.id}`);

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

module.exports = { setupSocket, isOnline };
