const db = require('../config/db');

/**
 * Get conversations for the authenticated user
 */
async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    // Fetch conversation IDs where user is member
    const [memberships] = await db.query(
      `SELECT cm.conversation_id, c.is_group, c.title, c.created_at, c.updated_at
       FROM conversation_members cm
       JOIN conversations c ON cm.conversation_id = c.id
       WHERE cm.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    const conversations = [];

    for (const item of memberships) {
      // Fetch members of this conversation
      const [members] = await db.query(
        `SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, u.last_seen
         FROM conversation_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.conversation_id = ?`,
        [item.conversation_id]
      );

      // Fetch the latest active (non-expired) message
      const [recentMsgs] = await db.query(
        `SELECT id, sender_id, content, created_at, expires_at 
         FROM messages 
         WHERE conversation_id = ? AND expires_at > NOW() AND is_deleted = FALSE 
         ORDER BY created_at DESC LIMIT 1`,
        [item.conversation_id]
      );

      // Total count of active temporary messages
      const [countResult] = await db.query(
        `SELECT COUNT(*) as active_count 
         FROM messages 
         WHERE conversation_id = ? AND expires_at > NOW() AND is_deleted = FALSE`,
        [item.conversation_id]
      );

      const latestMsg = recentMsgs && recentMsgs[0] ? recentMsgs[0] : null;

      let displayTitle = item.title;
      let displayAvatar = null;
      let otherMember = null;

      if (!item.is_group) {
        otherMember = members.find(m => m.id !== userId) || members[0];
        if (otherMember) {
          displayTitle = otherMember.display_name || otherMember.username;
          displayAvatar = otherMember.avatar_url;
        }
      }

      conversations.push({
        id: item.conversation_id,
        is_group: Boolean(item.is_group),
        title: displayTitle,
        avatar_url: displayAvatar,
        members,
        other_user: otherMember,
        last_message: latestMsg ? latestMsg.content : (item.is_group ? 'Active lounge' : 'Temporary chat ready'),
        last_message_time: latestMsg ? latestMsg.created_at : item.created_at,
        active_messages: countResult && countResult[0] ? countResult[0].active_count : 0
      });
    }

    return res.json({ conversations });
  } catch (error) {
    console.error('[Get Conversations Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
}

/**
 * Get or create a 1-on-1 conversation, or create a group conversation
 */
async function createConversation(req, res) {
  try {
    const { recipientId, participantIds, title, isGroup } = req.body;
    const currentUserId = req.user.id;

    if (isGroup) {
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Group title is required.' });
      }

      const allMembers = Array.from(new Set([currentUserId, ...(participantIds || [])]));

      const [resConvo] = await db.query(
        'INSERT INTO conversations (is_group, title, created_by) VALUES (?, ?, ?)',
        [true, title.trim(), currentUserId]
      );
      const conversationId = resConvo.insertId;

      for (const uid of allMembers) {
        await db.query(
          'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
          [conversationId, uid]
        );
      }

      return res.status(201).json({
        message: 'Group chat created!',
        conversation: {
          id: conversationId,
          is_group: true,
          title: title.trim()
        }
      });
    }

    // 1-on-1 conversation
    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required for direct chat.' });
    }

    if (Number(recipientId) === currentUserId) {
      return res.status(400).json({ error: 'Cannot start conversation with yourself.' });
    }

    // Check block list between these two users
    const [blocked] = await db.query(
      'SELECT id FROM user_blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
      [currentUserId, Number(recipientId), Number(recipientId), currentUserId]
    );

    if (blocked && blocked.length > 0) {
      return res.status(403).json({ error: 'Cannot initiate chat. One of the users has blocked communications.' });
    }

    // Check if 1-on-1 conversation already exists between these two users
    const [existing] = await db.query(
      `SELECT c.id 
       FROM conversations c
       JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = ?
       JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = ?
       WHERE c.is_group = FALSE LIMIT 1`,
      [currentUserId, Number(recipientId)]
    );

    if (existing && existing.length > 0) {
      return res.json({
        conversationId: existing[0].id,
        isExisting: true
      });
    }

    // Create new 1-on-1 conversation
    const [resConvo] = await db.query(
      'INSERT INTO conversations (is_group, title, created_by) VALUES (?, ?, ?)',
      [false, null, currentUserId]
    );
    const newConvoId = resConvo.insertId;

    await db.query('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [newConvoId, currentUserId]);
    await db.query('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)', [newConvoId, Number(recipientId)]);

    return res.status(201).json({
      conversationId: newConvoId,
      isExisting: false
    });
  } catch (error) {
    console.error('[Create Conversation Error]', error);
    return res.status(500).json({ error: 'Failed to create conversation.' });
  }
}

/**
 * Get active non-expired messages for a conversation
 * SERVER-SIDE 60-SECOND ENFORCEMENT:
 * Filters out any messages where expires_at <= NOW()
 */
async function getMessages(req, res) {
  try {
    const conversationId = Number(req.params.id);
    const userId = req.user.id;

    // Check membership
    const [membership] = await db.query(
      'SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (!membership || membership.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this conversation.' });
    }

    // STRICT EXPIRATION CHECK: expires_at must be strictly in the future
    const [messages] = await db.query(
      `SELECT m.id, m.conversation_id, m.sender_id, m.content, m.created_at, m.expires_at,
              u.username as sender_username, u.display_name as sender_name, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.expires_at > NOW() AND m.is_deleted = FALSE
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Compute exact remaining seconds from current server timestamp
    const nowTime = Date.now();
    const enrichedMessages = messages.map(msg => {
      const expiresTime = new Date(msg.expires_at).getTime();
      const remainingSeconds = Math.max(0, Math.ceil((expiresTime - nowTime) / 1000));
      return {
        ...msg,
        remaining_seconds: remainingSeconds,
        is_mine: msg.sender_id === userId
      };
    }).filter(m => m.remaining_seconds > 0);

    return res.json({
      conversation_id: conversationId,
      messages: enrichedMessages,
      server_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Get Messages Error]', error);
    return res.status(500).json({ error: 'Failed to fetch messages.' });
  }
}

/**
 * Send a message with strict 60-second server-side expiration
 */
async function sendMessage(req, res) {
  try {
    const conversationId = Number(req.params.id);
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be blank.' });
    }

    // Validate membership
    const [membership] = await db.query(
      'SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (!membership || membership.length === 0) {
      return res.status(403).json({ error: 'You cannot send messages to this conversation.' });
    }

    // Check block list in 1-on-1 conversations
    const [convoDetails] = await db.query('SELECT is_group FROM conversations WHERE id = ?', [conversationId]);
    if (convoDetails && convoDetails.length > 0 && !convoDetails[0].is_group) {
      const [otherMembers] = await db.query('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?', [conversationId, userId]);
      if (otherMembers && otherMembers.length > 0) {
        const otherId = otherMembers[0].user_id;
        const [blocked] = await db.query(
          'SELECT id FROM user_blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
          [userId, otherId, otherId, userId]
        );
        if (blocked && blocked.length > 0) {
          return res.status(403).json({ error: 'Message blocked. Communications with this user are suspended.' });
        }
      }
    }

    // Exactly 60 seconds from current server timestamp
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 1000);

    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
      [conversationId, userId, content.trim(), now, expiresAt]
    );

    // Update conversation timestamp
    await db.query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId]);

    const message = {
      id: result.insertId,
      conversation_id: conversationId,
      sender_id: userId,
      sender_name: req.user.display_name,
      sender_username: req.user.username,
      sender_avatar: req.user.avatar_url,
      content: content.trim(),
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      remaining_seconds: 60,
      is_mine: true
    };

    return res.status(201).json({
      message: 'Message sent. Disappears in 60s.',
      data: message
    });
  } catch (error) {
    console.error('[Send Message Error]', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}

/**
 * Delete message immediately
 */
async function deleteMessage(req, res) {
  try {
    const messageId = Number(req.params.messageId);
    const userId = req.user.id;

    const [msg] = await db.query('SELECT * FROM messages WHERE id = ?', [messageId]);
    if (!msg || msg.length === 0) {
      return res.status(404).json({ error: 'Message not found or already deleted.' });
    }

    if (msg[0].sender_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own messages.' });
    }

    await db.query('DELETE FROM messages WHERE id = ?', [messageId]);

    return res.json({ message: 'Message permanently removed.' });
  } catch (error) {
    console.error('[Delete Message Error]', error);
    return res.status(500).json({ error: 'Failed to delete message.' });
  }
}

/**
 * Clear conversation (Delete all messages immediately)
 */
async function clearConversation(req, res) {
  try {
    const conversationId = Number(req.params.id);
    const userId = req.user.id;

    const [membership] = await db.query(
      'SELECT id FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (!membership || membership.length === 0) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await db.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);

    return res.json({ message: 'Conversation history cleared successfully.' });
  } catch (error) {
    console.error('[Clear Conversation Error]', error);
    return res.status(500).json({ error: 'Failed to clear conversation.' });
  }
}

/**
 * Block a user
 */
async function blockUser(req, res) {
  try {
    const targetUserId = Number(req.params.userId);
    const userId = req.user.id;

    if (targetUserId === userId) {
      return res.status(400).json({ error: 'Cannot block yourself.' });
    }

    await db.query(
      'INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id',
      [userId, targetUserId]
    );

    return res.json({ message: 'User has been blocked. They will not be able to message you.' });
  } catch (error) {
    console.error('[Block User Error]', error);
    return res.status(500).json({ error: 'Failed to block user.' });
  }
}

/**
 * Unblock a user
 */
async function unblockUser(req, res) {
  try {
    const targetUserId = Number(req.params.userId);
    const userId = req.user.id;

    await db.query(
      'DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?',
      [userId, targetUserId]
    );

    return res.json({ message: 'User has been unblocked.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to unblock user.' });
  }
}

/**
 * Get blocked users list
 */
async function getBlockedUsers(req, res) {
  try {
    const userId = req.user.id;
    const [blocked] = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url 
       FROM user_blocks b 
       JOIN users u ON b.blocked_id = u.id 
       WHERE b.blocker_id = ?`,
      [userId]
    );
    return res.json({ blocked_users: blocked });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get blocked list.' });
  }
}

/**
 * Report an offensive or abusive message
 */
async function reportMessage(req, res) {
  try {
    const { messageId, reason, details } = req.body;
    const userId = req.user.id;

    if (!messageId || !reason) {
      return res.status(400).json({ error: 'messageId and reason are required' });
    }

    const [msg] = await db.query('SELECT sender_id FROM messages WHERE id = ?', [messageId]);

    await db.query(
      `INSERT INTO reports (reporter_id, reported_user_id, reported_message_id, reason, details, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, msg && msg[0] ? msg[0].sender_id : null, messageId, reason, details || null]
    );

    return res.status(201).json({ message: 'Message report submitted. Moderation will review.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to report message.' });
  }
}

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  clearConversation,
  blockUser,
  unblockUser,
  getBlockedUsers,
  reportMessage
};
