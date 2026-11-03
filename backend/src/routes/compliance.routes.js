const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Public statutory info
router.get('/info', complianceController.getComplianceInfo);
router.post('/grievance', optionalAuth, complianceController.submitGrievance);
router.get('/grievance/:ticketId', complianceController.getGrievanceStatus);

// Protected DPDPA consent tracking
router.post('/consent', authenticate, complianceController.recordConsent);
router.get('/consent', authenticate, complianceController.getConsents);

module.exports = router;
