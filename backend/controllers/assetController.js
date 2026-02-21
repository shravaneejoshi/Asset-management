const Asset = require('../models/Asset');

// @desc    Add new asset
// @route   POST /api/assets
// @access  Public
exports.addAsset = async (req, res) => {
  try {
    const {
      assetName, category, assetType, brand, model, serialNumber,
      quantity, minQuantity, labLocation, purchaseDate, purchaseCost,
      warrantyExpiryDate, status, condition, supplier, invoiceNumber, invoiceImage, notes
    } = req.body;

    // Validation
    if (!assetName || !category || !assetType || !labLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check for duplicate serial number (if provided and not consumable)
    if (serialNumber && assetType === 'non-consumable') {
      const existingAsset = await Asset.findOne({ serialNumber });
      if (existingAsset) {
        return res.status(400).json({
          success: false,
          message: 'Asset with this serial number already exists'
        });
      }
    }

    const asset = new Asset({
      assetName,
      category,
      assetType,
      brand,
      model,
      serialNumber: assetType === 'non-consumable' ? serialNumber : null,
      quantity: quantity || 1,
      minQuantity: minQuantity || 0,
      labLocation,
      purchaseDate,
      purchaseCost,
      warrantyExpiryDate,
      status: status || 'available',
      condition: condition || 'good',
      supplier,
      invoiceNumber,
      invoiceImage: invoiceImage || '',
      notes
    });

    await asset.save();

    res.status(201).json({
      success: true,
      message: 'Asset added successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all assets with filters and search
// @route   GET /api/assets
// @access  Public
exports.getAllAssets = async (req, res) => {
  try {
    const { search, labLocation, category, status, sortBy } = req.query;
    let query = {};

    // Search by name or serial number
    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by lab location
    if (labLocation) {
      query.labLocation = labLocation;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sortBy === 'warrantyExpiring') {
      sortOption = { warrantyExpiryDate: 1 };
    } else if (sortBy === 'lowStock') {
      sortOption = { quantity: 1 };
    }

    const assets = await Asset.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single asset by ID
// @route   GET /api/assets/:id
// @access  Public
exports.getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update asset details
// @route   PUT /api/assets/:id
// @access  Public
exports.updateAsset = async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const updateData = req.body;

    // Check for duplicate serial number if updating it
    if (updateData.serialNumber && updateData.serialNumber !== asset.serialNumber) {
      const existingAsset = await Asset.findOne({ 
        serialNumber: updateData.serialNumber,
        _id: { $ne: req.params.id }
      });
      if (existingAsset) {
        return res.status(400).json({
          success: false,
          message: 'Asset with this serial number already exists'
        });
      }
    }

    asset = await Asset.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update asset status
// @route   PATCH /api/assets/:id/status
// @access  Public
exports.updateAssetStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Asset status updated successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update asset quantity (for consumables)
// @route   PATCH /api/assets/:id/quantity
// @access  Public
exports.updateAssetQuantity = async (req, res) => {
  try {
    const { quantityChange } = req.body;

    if (quantityChange === undefined || quantityChange === null) {
      return res.status(400).json({
        success: false,
        message: 'Quantity change is required'
      });
    }

    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const newQuantity = asset.quantity + quantityChange;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    asset.quantity = newQuantity;
    await asset.save();

    res.status(200).json({
      success: true,
      message: 'Asset quantity updated successfully',
      data: asset,
      isLowStock: asset.isLowStock
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get low stock assets
// @route   GET /api/assets/alerts/low-stock
// @access  Public
exports.getLowStockAssets = async (req, res) => {
  try {
    const assets = await Asset.find({
      assetType: 'consumable',
      isLowStock: true
    });

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get warranty expiring assets
// @route   GET /api/assets/alerts/warranty-expiring
// @access  Public
exports.getWarrantyExpiringAssets = async (req, res) => {
  try {
    const assets = await Asset.find({
      isWarrantyExpiring: true
    });

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Public
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get assets by lab location
// @route   GET /api/assets/location/:labLocation
// @access  Public
exports.getAssetsByLocation = async (req, res) => {
  try {
    const assets = await Asset.find({ labLocation: req.params.labLocation });

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/assets/stats/dashboard
// @access  Public
exports.getDashboardStats = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const availableAssets = await Asset.countDocuments({ status: 'available' });
    const inUseAssets = await Asset.countDocuments({ status: 'in_use' });
    const underMaintenanceAssets = await Asset.countDocuments({ status: 'under_maintenance' });
    const lowStockAssets = await Asset.countDocuments({ isLowStock: true });
    const warrantyExpiringAssets = await Asset.countDocuments({ isWarrantyExpiring: true });

    const categories = await Asset.distinct('category');
    const labLocations = await Asset.distinct('labLocation');

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        availableAssets,
        inUseAssets,
        underMaintenanceAssets,
        lowStockAssets,
        warrantyExpiringAssets,
        categories,
        labLocations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Set or update maintenance cycle for an asset
// @route   PATCH /api/assets/:id/maintenance-cycle
// @access  Public
exports.setMaintenanceCycle = async (req, res) => {
  try {
    const { maintenanceCycleDays } = req.body;

    // Get asset
    let asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Only non-consumable assets can have maintenance cycles
    if (asset.assetType === 'consumable') {
      return res.status(400).json({
        success: false,
        message: 'Maintenance cycles can only be set for non-consumable assets'
      });
    }

    // Validate cycle days
    if (maintenanceCycleDays !== null && maintenanceCycleDays < 30) {
      return res.status(400).json({
        success: false,
        message: 'Maintenance cycle must be at least 30 days'
      });
    }

    // Update maintenance cycle
    asset.maintenanceCycleDays = maintenanceCycleDays;

    // If setting a cycle and no last maintenance date, calculate next due
    if (maintenanceCycleDays && !asset.lastMaintenanceDate) {
      const today = new Date();
      asset.nextMaintenanceDue = new Date(today.getTime() + maintenanceCycleDays * 24 * 60 * 60 * 1000);
    }

    // If removing cycle, clear dates
    if (!maintenanceCycleDays) {
      asset.nextMaintenanceDue = null;
    }

    await asset.save();

    res.status(200).json({
      success: true,
      message: 'Maintenance cycle updated successfully',
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get assets with maintenance due within 7 days
// @route   GET /api/assets/alerts/maintenance-due-soon
// @access  Public
exports.getMaintenanceDueSoon = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const dueSoonAssets = await Asset.find({
      nextMaintenanceDue: {
        $gte: today,
        $lte: sevenDaysFromNow
      },
      assetType: 'non-consumable',
      status: { $ne: 'under_maintenance' }
    }).sort({ nextMaintenanceDue: 1 });

    res.status(200).json({
      success: true,
      count: dueSoonAssets.length,
      data: dueSoonAssets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get assets with overdue maintenance
// @route   GET /api/assets/alerts/maintenance-overdue
// @access  Public
exports.getOverdueMaintenanceAssets = async (req, res) => {
  try {
    const today = new Date();

    const overdueAssets = await Asset.find({
      nextMaintenanceDue: {
        $lt: today
      },
      assetType: 'non-consumable',
      status: { $ne: 'under_maintenance' }
    }).sort({ nextMaintenanceDue: 1 });

    res.status(200).json({
      success: true,
      count: overdueAssets.length,
      data: overdueAssets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};