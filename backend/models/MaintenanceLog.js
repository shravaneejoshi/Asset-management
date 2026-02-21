const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema(
  {
    // Section 1: Asset Information (Auto-filled from Asset)
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    },

    assetName: {
      type: String,
      required: true
    },

    assetId: {
      type: String
    },

    serialNumber: {
      type: String
    },

    labLocation: {
      type: String,
      required: true
    },

    // Section 2: Maintenance Details (When reporting)
    maintenanceType: {
      type: String,
      enum: ['preventive', 'breakdown', 'calibration'],
      required: true
    },

    checklist: {
      type: [{text: String, completed: {type: Boolean, default: false}}],
      default: []
    },

    priorityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },

    reportedDate: {
      type: Date,
      default: Date.now
    },

    sentTo: {
      type: String
      // "Internal Technician" or vendor name like "ABC Instruments Pvt Ltd"
    },

    expectedCompletionDate: {
      type: Date
    },

    // Section 3: Completion Details (When marking completed)
    completedDate: {
      type: Date
    },

    workPerformed: {
      type: String,
      trim: true
    },

    cost: {
      type: Number,
      default: 0
    },

    performedBy: {
      type: String
    },

    // Calibration-specific fields (Values: 'passed', 'failed', 'partial' - validated in controller)
    calibrationResult: {
      type: String
    },

    nextCalibrationDue: {
      type: Date
    },

    remarks: {
      type: String,
      trim: true
    },

    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'rejected'],
      default: 'pending'
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
maintenanceLogSchema.index({ asset: 1, status: 1 });
maintenanceLogSchema.index({ reportedDate: -1 });
maintenanceLogSchema.index({ nextCalibrationDue: 1 });

// Pre-save hook to update timestamps
maintenanceLogSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
