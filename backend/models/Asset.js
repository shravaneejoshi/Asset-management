const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true
      // Example: Electronics, Mechanical, Computer, Civil, Tools
    },

    assetType: {
      type: String,
      enum: ["consumable", "non-consumable"],
      required: true
    },

    brand: {
      type: String
    },

    model: {
      type: String
    },

    serialNumber: {
      type: String
      // Note: Uniqueness is enforced at compound index level (only for non-consumables)
    },

    quantity: {
      type: Number,
      default: 1 // More than 1 mainly for consumables
    },

    minQuantity: {
      type: Number,
      default: 0 // For low stock alert
    },

    labLocation: {
      type: String,
      required: true
      // Example: "ECE Lab 1", "Mechanical Workshop"
    },

    purchaseDate: {
      type: Date
    },

    purchaseCost: {
      type: Number
    },

    warrantyExpiryDate: {
      type: Date
    },

    status: {
      type: String,
      enum: ["available", "in_use", "under_maintenance", "disposed"],
      default: "available"
    },

    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "damaged"],
      default: "good"
    },

    supplier: {
      type: String
    },

    invoiceNumber: {
      type: String
    },

    invoiceImage: {
      type: String
      // Stored as base64 encoded image data
    },

    // Maintenance Cycle Fields
    maintenanceCycleDays: {
      type: Number,
      default: null,
      // Only for non-consumable assets, minimum 30 days
      validate: {
        validator: function(value) {
          // If null, it's valid (no maintenance cycle)
          if (value === null) return true;
          // If set, must be at least 30 days
          return value >= 30;
        },
        message: 'Maintenance cycle must be at least 30 days'
      }
    },

    // New: Maintenance cycle in months and years for easier input
    maintenanceCycleMonths: {
      type: Number,
      default: null,
      // Easy input: e.g., 3 (3 months), 6 (6 months)
      validate: {
        validator: function(value) {
          if (value === null || value === undefined) return true;
          return value > 0;
        },
        message: 'Maintenance cycle months must be greater than 0'
      }
    },

    maintenanceCycleYears: {
      type: Number,
      default: null,
      // Easy input: e.g., 1 (1 year), 2 (2 years)
      validate: {
        validator: function(value) {
          if (value === null || value === undefined) return true;
          return value > 0;
        },
        message: 'Maintenance cycle years must be greater than 0'
      }
    },

    lastMaintenanceDate: {
      type: Date,
      default: null
    },

    nextMaintenanceDue: {
      type: Date,
      default: null
    },

    // Additional tracking fields
    lastUpdatedBy: {
      type: String
    },

    notes: {
      type: String
    },

    isLowStock: {
      type: Boolean,
      default: false
    },

    isWarrantyExpiring: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for frequent searches
assetSchema.index({ assetName: 1 });
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ labLocation: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ warrantyExpiryDate: 1 });

// Virtual to check if warranty is expiring soon (within 30 days)
assetSchema.virtual('warrantyExpiringSoon').get(function() {
  if (!this.warrantyExpiryDate) return false;
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  return this.warrantyExpiryDate <= thirtyDaysFromNow && this.warrantyExpiryDate >= today;
});

// Pre-save middleware to calculate flags and maintenance dates
assetSchema.pre('save', function(next) {
  // Convert months and years to days
  if ((this.maintenanceCycleMonths || this.maintenanceCycleYears) && !this.maintenanceCycleDays) {
    let totalDays = 0;
    if (this.maintenanceCycleMonths) {
      totalDays += this.maintenanceCycleMonths * 30; // Approximate 30 days per month
    }
    if (this.maintenanceCycleYears) {
      totalDays += this.maintenanceCycleYears * 365; // 365 days per year
    }
    if (totalDays >= 30) {
      this.maintenanceCycleDays = totalDays;
    }
  }

  // Maintenance cycle validation: only for non-consumable assets
  if (this.maintenanceCycleDays !== null && this.maintenanceCycleDays !== undefined) {
    if (this.assetType === 'consumable') {
      return next(new Error('Maintenance cycles can only be set for non-consumable assets'));
    }
  }

  // Calculate nextMaintenanceDue if cycle is set and nextMaintenanceDue not already set
  if (this.maintenanceCycleDays && !this.nextMaintenanceDue && !this.lastMaintenanceDate) {
    const today = new Date();
    this.nextMaintenanceDue = new Date(today.getTime() + this.maintenanceCycleDays * 24 * 60 * 60 * 1000);
  }

  // Recalculate nextMaintenanceDue if lastMaintenanceDate is updated
  if (this.lastMaintenanceDate && this.maintenanceCycleDays) {
    const nextDue = new Date(this.lastMaintenanceDate.getTime() + this.maintenanceCycleDays * 24 * 60 * 60 * 1000);
    this.nextMaintenanceDue = nextDue;
  }

  // Check if low stock
  if (this.assetType === 'consumable' && this.quantity < this.minQuantity) {
    this.isLowStock = true;
  } else {
    this.isLowStock = false;
  }

  // Check if warranty expiring soon
  if (this.warrantyExpiryDate) {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (this.warrantyExpiryDate <= thirtyDaysFromNow && this.warrantyExpiryDate >= today) {
      this.isWarrantyExpiring = true;
    } else {
      this.isWarrantyExpiring = false;
    }
  }

  next();
});

module.exports = mongoose.model('Asset', assetSchema);
