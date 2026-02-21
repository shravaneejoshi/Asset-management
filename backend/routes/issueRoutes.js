const express = require('express');
const router = express.Router();
const {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssueStatus,
  getIssuesByLab,
  closeIssue,
  getTechnicianStats,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment
} = require('../controllers/issueController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

// Get technician stats - MUST be before /:id route
router.get('/stats/technician-stats', getTechnicianStats);

// Create issue - Lab Assistant only (with auth to capture reportedBy)
router.post('/', verifyToken, createIssue);

// Get all issues - filtered by role (with auth)
router.get('/', verifyToken, getAllIssues);

// Get issues by lab - Lab Technician only
router.get('/lab/:labId', verifyToken, getIssuesByLab);

// File upload endpoints
router.post('/:id/upload', verifyToken, uploadAttachment);
router.get('/:id/attachment/:attachmentId', verifyToken, downloadAttachment);
router.delete('/:id/attachment/:attachmentId', verifyToken, deleteAttachment);

// Get single issue
router.get('/:id', getIssueById);

// Update issue status - Lab Technician/Admin only
router.patch('/:id/status', updateIssueStatus);

// Close issue - Lab Assistant only
router.patch('/:id/close', closeIssue);

module.exports = router;
