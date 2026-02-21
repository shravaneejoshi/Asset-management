const Asset = require('../models/Asset');
const MaintenanceLog = require('../models/MaintenanceLog');

// @desc    Create new maintenance request
// @route   POST /api/maintenance
// @access  Public
exports.createMaintenance = async (req, res) => {
  try {
    const {
      assetId,
      maintenanceType,
      checklist,
      priorityLevel,
      sentTo,
      expectedCompletionDate
    } = req.body;

    // Validation
    if (!assetId || !maintenanceType || !checklist || checklist.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assetId, maintenanceType, and checklist with at least one item'
      });
    }

    console.log('Creating maintenance for asset:', assetId);

    // Check if asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      console.log('Asset not found:', assetId);
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    console.log('Asset found:', asset.assetName);
    console.log('Asset full object:', JSON.stringify(asset, null, 2));

    // Create maintenance log
    const maintenanceData = {
      asset: assetId,
      assetName: asset?.assetName || 'Unknown Asset',
      assetId: asset?._id?.toString() || assetId,
      serialNumber: asset?.serialNumber || null,
      labLocation: asset?.labLocation || 'Unknown',
      maintenanceType: maintenanceType?.toLowerCase() || 'preventive',
      checklist: checklist.map(item => ({
        text: typeof item === 'string' ? item : item.text,
        completed: item.completed || false
      })),
      priorityLevel: (priorityLevel || 'medium')?.toLowerCase(),
      sentTo: sentTo || null,
      expectedCompletionDate: expectedCompletionDate || null,
      reportedDate: new Date(),
      status: 'pending'
    };

    console.log('Maintenance data to save:', JSON.stringify(maintenanceData, null, 2));

    const maintenanceLog = new MaintenanceLog(maintenanceData);

    console.log('Saving maintenance log...');
    const validationError = maintenanceLog.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: Object.values(validationError.errors).map(e => e.message).join(', ')
      });
    }
    
    await maintenanceLog.save();
    console.log('Maintenance log saved:', maintenanceLog._id);

    // Update asset status to "under_maintenance"
    asset.status = 'under_maintenance';
    console.log('Updating asset status to under_maintenance');
    await asset.save();
    console.log('Asset status updated');

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: maintenanceLog
    });
  } catch (error) {
    console.error('Error creating maintenance log:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance request',
      error: error.message
    });
  }
};

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Public
exports.getAllMaintenance = async (req, res) => {
  try {
    const { status, assetId } = req.query;

    let query = {};
    if (status) query.status = status;
    if (assetId) query.asset = assetId;

    const maintenanceLogs = await MaintenanceLog.find(query)
      .populate('asset', 'assetName serialNumber labLocation')
      .sort({ reportedDate: -1 });

    res.status(200).json({
      success: true,
      count: maintenanceLogs.length,
      data: maintenanceLogs
    });
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance logs',
      error: error.message
    });
  }
};

// @desc    Get maintenance logs for a specific asset
// @route   GET /api/maintenance/asset/:assetId
// @access  Public
exports.getMaintenanceByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    const maintenanceLogs = await MaintenanceLog.find({ asset: assetId })
      .sort({ reportedDate: -1 });

    if (!maintenanceLogs || maintenanceLogs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No maintenance records found for this asset',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      count: maintenanceLogs.length,
      data: maintenanceLogs
    });
  } catch (error) {
    console.error('Error fetching asset maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance records',
      error: error.message
    });
  }
};

// @desc    Get single maintenance log
// @route   GET /api/maintenance/:id
// @access  Public
exports.getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenanceLog = await MaintenanceLog.findById(id)
      .populate('asset');

    if (!maintenanceLog) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: maintenanceLog
    });
  } catch (error) {
    console.error('Error fetching maintenance log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance record',
      error: error.message
    });
  }
};

// @desc    Mark maintenance as completed
// @route   PATCH /api/maintenance/:id/complete
// @access  Public
exports.completeMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      completedDate,
      workPerformed,
      cost,
      performedBy,
      calibrationResult,
      nextCalibrationDue,
      remarks
    } = req.body;

    // Validation
    if (!workPerformed) {
      return res.status(400).json({
        success: false,
        message: 'Please provide work performed details'
      });
    }

    // Find maintenance log
    const maintenanceLog = await MaintenanceLog.findById(id);
    if (!maintenanceLog) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    // Update maintenance log
    maintenanceLog.completedDate = completedDate || new Date();
    maintenanceLog.workPerformed = workPerformed;
    maintenanceLog.cost = cost || 0;
    maintenanceLog.performedBy = performedBy;
    maintenanceLog.remarks = remarks;
    maintenanceLog.status = 'completed';

    // Handle calibration-specific fields
    if (maintenanceLog.maintenanceType === 'calibration') {
      if (!calibrationResult) {
        return res.status(400).json({
          success: false,
          message: 'Calibration result is required for calibration maintenance'
        });
      }
      
      const validResults = ['passed', 'failed', 'partial'];
      if (!validResults.includes(calibrationResult.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Calibration result must be passed, failed, or partial'
        });
      }
      
      maintenanceLog.calibrationResult = calibrationResult.toLowerCase();
      maintenanceLog.nextCalibrationDue = nextCalibrationDue;
    }

    await maintenanceLog.save();

    // Update asset status back to "available" and set maintenance dates
    const asset = await Asset.findById(maintenanceLog.asset);
    if (asset) {
      asset.status = 'available';
      // Update condition if repair was successful
      if (maintenanceLog.maintenanceType === 'repair') {
        asset.condition = 'good';
      }
      // Update last maintenance date - this will trigger pre-save middleware to calculate next due
      asset.lastMaintenanceDate = maintenanceLog.completedDate || new Date();
      await asset.save();
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance marked as completed successfully',
      data: maintenanceLog
    });
  } catch (error) {
    console.error('Error completing maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking maintenance as completed',
      error: error.message
    });
  }
};

// @desc    Get calibration due alerts
// @route   GET /api/maintenance/alerts/calibration-due
// @access  Public
exports.getCalibrationDueAlerts = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find calibration maintenance where nextDueDate is within 7 days
    const alerts = await MaintenanceLog.find({
      maintenanceType: 'calibration',
      status: 'completed',
      nextCalibrationDue: {
        $lte: sevenDaysLater,
        $gte: today
      }
    })
      .populate('asset', 'assetName labLocation')
      .sort({ nextCalibrationDue: 1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      message: `${alerts.length} calibration(s) due within 7 days`,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching calibration alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calibration alerts',
      error: error.message
    });
  }
};

// @desc    Get overdue maintenance alerts
// @route   GET /api/maintenance/alerts/overdue
// @access  Public
exports.getOverdueAlerts = async (req, res) => {
  try {
    const today = new Date();

    // Find pending/in_progress maintenance beyond expected date
    const overdueAlerts = await MaintenanceLog.find({
      status: { $in: ['pending', 'in_progress'] },
      expectedCompletionDate: { $lt: today }
    })
      .populate('asset', 'assetName labLocation')
      .sort({ reportedDate: 1 });

    res.status(200).json({
      success: true,
      count: overdueAlerts.length,
      message: `${overdueAlerts.length} maintenance request(s) overdue`,
      data: overdueAlerts
    });
  } catch (error) {
    console.error('Error fetching overdue alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue alerts',
      error: error.message
    });
  }
};

// @desc    Get maintenance statistics for dashboard
// @route   GET /api/maintenance/stats
// @access  Public
exports.getMaintenanceStats = async (req, res) => {
  try {
    const totalMaintenance = await MaintenanceLog.countDocuments();
    const pendingMaintenance = await MaintenanceLog.countDocuments({ status: 'pending' });
    const inProgressMaintenance = await MaintenanceLog.countDocuments({ status: 'in_progress' });
    const completedMaintenance = await MaintenanceLog.countDocuments({ status: 'completed' });

    // Get assets under maintenance
    const assetsUnderMaintenance = await Asset.countDocuments({ status: 'under_maintenance' });

    // Get total maintenance cost
    const costData = await MaintenanceLog.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    const totalCost = costData.length > 0 ? costData[0].totalCost : 0;

    res.status(200).json({
      success: true,
      data: {
        totalMaintenance,
        pendingMaintenance,
        inProgressMaintenance,
        completedMaintenance,
        assetsUnderMaintenance,
        totalCost
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance statistics',
      error: error.message
    });
  }
};

// @desc    Update maintenance status
// @route   PATCH /api/maintenance/:id/status
// @access  Public
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'in_progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, in_progress, completed, or rejected'
      });
    }

    const maintenanceLog = await MaintenanceLog.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!maintenanceLog) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance status updated successfully',
      data: maintenanceLog
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance status',
      error: error.message
    });
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Public
exports.deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenanceLog = await MaintenanceLog.findByIdAndDelete(id);

    if (!maintenanceLog) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully',
      data: maintenanceLog
    });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance record',
      error: error.message
    });
  }
};
