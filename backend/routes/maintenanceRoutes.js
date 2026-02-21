const express = require('express');
const router = express.Router();
const {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceByAsset,
  getMaintenanceById,
  completeMaintenance,
  getCalibrationDueAlerts,
  getOverdueAlerts,
  getMaintenanceStats,
  updateMaintenanceStatus,
  deleteMaintenance
} = require('../controllers/maintenanceController');

// Specific routes first (before parameterized routes)
router.get('/stats', getMaintenanceStats);
router.get('/alerts/calibration-due', getCalibrationDueAlerts);
router.get('/alerts/overdue', getOverdueAlerts);

// Generic CRUD operations
router.get('/', getAllMaintenance);
router.post('/', createMaintenance);

// Asset-specific route
router.get('/asset/:assetId', getMaintenanceByAsset);

// ID-specific routes (most specific at end)
router.get('/:id', getMaintenanceById);
router.patch('/:id/complete', completeMaintenance);
router.patch('/:id/status', updateMaintenanceStatus);
router.delete('/:id', deleteMaintenance);

module.exports = router;
