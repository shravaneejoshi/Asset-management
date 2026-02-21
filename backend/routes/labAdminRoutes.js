const express = require('express');
const { createLab, createAssetCategory, approveUser, getLabs, getAssetCategories, getPendingUsers, handleUserApproval } = require('../controllers/labAdminController');
const auth = require('../middleware/auth');
const router = express.Router();

// Lab admin routes
router.post('/labs', auth, createLab);
router.post('/asset-categories', auth, createAssetCategory);
router.put('/approve/:userId', auth, approveUser);
router.put('/approve-reject/:userId', auth, handleUserApproval);
router.get('/labs', auth, getLabs);
router.get('/asset-categories', auth, getAssetCategories);
router.get('/pending-users', auth, getPendingUsers);

module.exports = router;