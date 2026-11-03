const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

// All admin routes require admin role
router.use(requireAdmin);

// Dashboard metrics
router.get('/stats', adminController.getStats);

// User moderation
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);

// Link management
router.post('/links', adminController.createLink);
router.put('/links/:id', adminController.updateLink);
router.delete('/links/:id', adminController.deleteLink);

// Category management
router.post('/categories', adminController.createCategory);

// Reports moderation
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReportStatus);

module.exports = router;
