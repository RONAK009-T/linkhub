const express = require('express');
const router = express.Router();
const linksController = require('../controllers/linksController');
const { optionalAuth, authenticate } = require('../middleware/auth');

// Public or optional-auth resource routes
router.get('/', optionalAuth, linksController.getLinks);
router.get('/categories', linksController.getCategories);
router.get('/:id', optionalAuth, linksController.getLinkById);

// Protected routes (favorites & reporting)
router.post('/:id/favorite', authenticate, linksController.toggleFavorite);
router.get('/user/favorites', authenticate, linksController.getUserFavorites);
router.post('/report', authenticate, linksController.reportResource);

module.exports = router;
