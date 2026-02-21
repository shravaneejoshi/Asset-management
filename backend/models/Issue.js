const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true
    },

    labId: {
      type: String,
      required: true
      // Example: "ECE Lab 1", "Mechanical Workshop"
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
      // Lab Assistant who reported the issue
    },

    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
      // Lab Technician assigned to fix the issue
    },

    issueType: {
      type: String,
      enum: ['preventive', 'breakdown', 'calibration'],
      required: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    requiredSkill: {
      type: String,
      enum: ['printer_repair', 'computer', 'electronics', 'mechanical', 'calibration', 'civil'],
      required: true
      // Skill required to fix this issue
    },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      required: true
    },

    technicianRemarks: {
      type: String,
      trim: true
    },

    rejectionReason: {
      type: String,
      trim: true
    },

    checklist: {
      type: [{text: String, completed: {type: Boolean, default: false}}],
      default: []
    },

    attachments: {
      type: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadedAt: {type: Date, default: Date.now},
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }],
      default: []
    },

    reportedAt: {
      type: Date,
      default: Date.now
    },

    acceptedAt: {
      type: Date
    },

    startedAt: {
      type: Date
    },

    resolvedAt: {
      type: Date
    },

    closedAt: {
      type: Date
    },

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

// Indexes for faster queries
issueSchema.index({ assetId: 1 });
issueSchema.index({ labId: 1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ assignedTechnician: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ reportedAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
