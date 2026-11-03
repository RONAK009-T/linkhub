const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// All chat routes are protected
router.use(authenticate);

// Conversations
router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);

// Messages (Enforces 60-second expiration server-side)
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.delete('/conversations/:id/messages', chatController.clearConversation);
router.delete('/messages/:messageId', chatController.deleteMessage);

// User Blocking & Safety
router.post('/block/:userId', chatController.blockUser);
router.delete('/block/:userId', chatController.unblockUser);
router.get('/blocks', chatController.getBlockedUsers);

// Message Reporting
router.post('/report-message', chatController.reportMessage);

module.exports = router;
