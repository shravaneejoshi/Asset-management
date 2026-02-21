const express = require('express');
const router = express.Router();
const {
  addAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  updateAssetStatus,
  updateAssetQuantity,
  getLowStockAssets,
  getWarrantyExpiringAssets,
  deleteAsset,
  getAssetsByLocation,
  getDashboardStats,
  setMaintenanceCycle,
  getMaintenanceDueSoon,
  getOverdueMaintenanceAssets
} = require('../controllers/assetController');


// Get dashboard statistics
router.get('/stats/dashboard', getDashboardStats);

// Get filtered assets (must be before :id routes)
router.get('/', getAllAssets);

// Get low stock assets
router.get('/alerts/low-stock', getLowStockAssets);

// Get warranty expiring assets
router.get('/alerts/warranty-expiring', getWarrantyExpiringAssets);

// Get maintenance due soon
router.get('/alerts/maintenance-due-soon', getMaintenanceDueSoon);

// Get overdue maintenance assets
router.get('/alerts/maintenance-overdue', getOverdueMaintenanceAssets);

// Get single asset
router.get('/:id', getAssetById);

// Get assets by location
router.get('/location/:labLocation', getAssetsByLocation);

// Add new asset
router.post('/', addAsset);

// Update asset
router.put('/:id', updateAsset);

// Update asset status
router.patch('/:id/status', updateAssetStatus);

// Update asset quantity
router.patch('/:id/quantity', updateAssetQuantity);

// Set maintenance cycle
router.patch('/:id/maintenance-cycle', setMaintenanceCycle);

// Delete asset
router.delete('/:id', deleteAsset);

module.exports = router;
