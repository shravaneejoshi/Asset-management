const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.get('/technicians/by-skill', auth, authController.getTechniciansBySkill);
router.patch('/update-skills', auth, authController.updateTechnicianSkills);

module.exports = router;
