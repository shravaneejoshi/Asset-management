const Lab = require('../models/Lab');
const User = require('../models/User');
const AssetCategory = require('../models/AssetCategory');

// Create a new lab
exports.createLab = async (req, res) => {
  try {
    const { name, labNumber, labType, labAssets } = req.body;
    const lab = new Lab({
      name,
      labNumber,
      labType,
      labAssets,
      createdBy: req.user._id,
    });
    await lab.save();
    res.status(201).json({ message: 'Lab created successfully', lab });
  } catch (error) {
    res.status(500).json({ message: 'Error creating lab', error });
  }
};

// Create a new asset category
exports.createAssetCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = new AssetCategory({
      name,
      createdBy: req.user._id,
    });
    await category.save();
    res.status(201).json({ message: 'Asset category created successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating asset category', error });
  }
};

// Approve user signup requests
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isApproved = true;
    await user.save();
    res.status(200).json({ message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error approving user', error });
  }
};

// Approve or reject user signup requests
exports.handleUserApproval = async (req, res) => {
  try {
    const { userId } = req.params;
    const { approve } = req.body; // true for approve, false for reject

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (approve) {
      user.isApproved = true;
      await user.save();
      return res.status(200).json({ message: 'User approved successfully', user });
    } else {
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ message: 'User rejected and deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error handling user approval', error });
  }
};

// Fetch all labs
exports.getLabs = async (req, res) => {
  try {
    const labs = await Lab.find();
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching labs', error });
  }
};

// Fetch all asset categories
exports.getAssetCategories = async (req, res) => {
  try {
    const categories = await AssetCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching asset categories', error });
  }
};

// Fetch all pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false, role: { $in: ['lab_assistant', 'lab_technician'] } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending users', error });
  }
};