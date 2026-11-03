const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

const onlineUsers = new Map(); // userId -> Set of socket IDs

function setupChatSocket(io) {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || 
                  socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid or expired token'));
    }

    socket.user = decoded;
    next();
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket] User connected: ${socket.user.username} (ID: ${userId}) [Socket: ${socket.id}]`);

    // Track online user sockets
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // First connection, broadcast online status
      await db.query('UPDATE users SET status = "online", last_seen = NOW() WHERE id = ?', [userId]);
      io.emit('user_status_changed', { userId, status: 'online' });
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user room for direct alerts & notifications
    socket.join(`user_${userId}`);

    // Join specific conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`convo_${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`convo_${conversationId}`);
      }
    });

    // Handle sending a real-time message with 60s temporary expiration
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content } = data;
        if (!conversationId || !content || !content.trim()) {
          if (callback) callback({ error: 'Message cannot be empty.' });
          return;
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60 * 1000); // 60s from server time

        // Insert into database
        const [res] = await db.query(
          'INSERT INTO messages (conversation_id, sender_id, content, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
          [conversationId, userId, content.trim(), now, expiresAt]
        );

        await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId]);

        const messagePayload = {
          id: res.insertId,
          conversation_id: conversationId,
          sender_id: userId,
          sender_name: socket.user.display_name,
          sender_username: socket.user.username,
          sender_avatar: socket.user.avatar_url,
          content: content.trim(),
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          remaining_seconds: 60
        };

        // Broadcast to everyone in conversation room
        io.to(`convo_${conversationId}`).emit('new_message', messagePayload);

        // Also notify conversation members who might be in the chat list screen
        const [members] = await db.query(
          'SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?',
          [conversationId, userId]
        );

        for (const member of members) {
          io.to(`user_${member.user_id}`).emit('chat_notification', {
            conversationId,
            senderName: socket.user.display_name,
            content: content.trim().slice(0, 40),
            created_at: now.toISOString()
          });
        }

        if (callback) callback({ status: 'ok', message: messagePayload });
      } catch (err) {
        console.error('[Socket send_message error]', err);
        if (callback) callback({ error: 'Failed to send message.' });
      }
    });

    // Handle immediate message deletion
    socket.on('delete_message', async ({ messageId, conversationId }, callback) => {
      try {
        await db.query('DELETE FROM messages WHERE id = ?', [messageId]);
        io.to(`convo_${conversationId}`).emit('message_deleted', { messageId, conversationId });
        if (callback) callback({ status: 'ok' });
      } catch (err) {
        if (callback) callback({ error: 'Failed to delete message' });
      }
    });

    // Handle clearing the whole conversation immediately
    socket.on('clear_conversation', async ({ conversationId }, callback) => {
      try {
        await db.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
        io.to(`convo_${conversationId}`).emit('conversation_cleared', { conversationId });
        if (callback) callback({ status: 'ok' });
      } catch (err) {
        if (callback) callback({ error: 'Failed to clear conversation' });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`convo_${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        username: socket.user.display_name || socket.user.username
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`convo_${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          await db.query('UPDATE users SET status = "offline", last_seen = NOW() WHERE id = ?', [userId]);
          io.emit('user_status_changed', { userId, status: 'offline' });
        }
      }
      console.log(`[Socket] User disconnected: ${socket.user.username} [Socket: ${socket.id}]`);
    });
  });
}

module.exports = {
  setupChatSocket,
  getOnlineUserIds: () => Array.from(onlineUsers.keys())
};
