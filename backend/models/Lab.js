const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  labNumber: {
    type: String,
    required: true,
  },
  labType: {
    type: String,
    required: true,
  },
  labAssets: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Lab', labSchema);