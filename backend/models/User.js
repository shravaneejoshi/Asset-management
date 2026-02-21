const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['lab_assistant', 'lab_technician', 'lab_admin', 'admin', 'labAdmin'],
      default: 'lab_assistant',
      required: true
    },

    lab: {
      type: String,
      default: ''
      // Optional: Lab location
    },

    department: {
      type: String
      // Example: "Electronics", "Mechanical", "Chemistry"
    },

    skills: {
      type: [String],
      enum: ['printer_repair', 'computer', 'electronics', 'mechanical', 'calibration', 'civil'],
      default: []
      // For lab_technician role: selected skills
    },

    firstName: {
      type: String
      // For signup form
    },

    lastName: {
      type: String
      // For signup form
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    },

    isApproved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ lab: 1 });

module.exports = mongoose.model('User', userSchema);
