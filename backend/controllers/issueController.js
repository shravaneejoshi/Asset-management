const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Asset = require('../models/Asset');
const User = require('../models/User');

// @desc    Create new issue / maintenance request
// @route   POST /api/issues
// @access  Lab Assistant
exports.createIssue = async (req, res) => {
  try {
    const {
      assetId,
      issueType,
      description,
      severity,
      requiredSkill,
      assignedTechnician,
      checklist
    } = req.body;

    // Validation
    if (!assetId || !issueType || !description || !severity || !requiredSkill) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assetId, issueType, description, severity, and requiredSkill'
      });
    }

    if (!assignedTechnician) {
      return res.status(400).json({
        success: false,
        message: 'Please assign a technician to this issue'
      });
    }

    // Check if asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if technician exists and has required skill
    const technician = await User.findById(assignedTechnician);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    if (technician.role !== 'lab_technician') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a technician'
      });
    }

    if (!technician.skills.includes(requiredSkill)) {
      return res.status(400).json({
        success: false,
        message: 'Selected technician does not have the required skill'
      });
    }

    // For demo mode, use a valid ObjectId if req.user doesn't exist
    const reportedById = req.user?.id || new mongoose.Types.ObjectId();

    // Create issue
    const issueData = {
      assetId,
      labId: asset.labLocation,
      reportedBy: reportedById,
      issueType,
      description,
      severity,
      requiredSkill,
      assignedTechnician,
      checklist: checklist || [],
      status: 'pending',
      reportedAt: new Date()
    };

    const issue = new Issue(issueData);
    await issue.save();

    // Populate the issue data
    await issue.populate({
      path: 'reportedBy',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assignedTechnician',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assetId',
      select: 'assetName serialNumber labLocation'
    });

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating issue',
      error: error.message
    });
  }
};

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Lab Technician, Lab Assistant, Admin
exports.getAllIssues = async (req, res) => {
  try {
    const { status, severity, labId, assignedTechnician, reportedBy, viewType } = req.query;

    // Build filter
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    if (labId) {
      filter.labId = labId;
    }

    if (assignedTechnician) {
      filter.assignedTechnician = assignedTechnician;
    }

    if (reportedBy) {
      filter.reportedBy = reportedBy;
    }

    // For Lab Assistants
    if (req.user && req.user.role === 'lab_assistant') {
      // viewType = 'my' shows only their issues, 'all' shows all issues
      if (viewType !== 'all') {
        filter.reportedBy = req.user.id;
      }
    }

    // For Lab Technicians, show issues assigned to them OR related to their skills
    if (req.user && req.user.role === 'lab_technician') {
      // Get technician's skills
      const technician = await User.findById(req.user.id);
      
      if (technician && technician.skills && technician.skills.length > 0) {
        // Show issues that are either:
        // 1. Assigned to this technician, OR
        // 2. Match their skills (not yet assigned but they can accept)
        filter.$or = [
          { assignedTechnician: req.user.id },
          { requiredSkill: { $in: technician.skills } }
        ];
      } else {
        // If no skills, only show assigned issues
        filter.assignedTechnician = req.user.id;
      }
    }

    // If not authenticated, return all issues (demo mode)

    const issues = await Issue.find(filter)
      .populate({
        path: 'reportedBy',
        select: 'name email role lab'
      })
      .populate({
        path: 'assignedTechnician',
        select: 'name email role lab'
      })
      .populate({
        path: 'assetId',
        select: 'assetName serialNumber labLocation'
      })
      .sort({ reportedAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
};

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Lab Technician, Lab Assistant, Admin
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate({
        path: 'reportedBy',
        select: 'name email role lab'
      })
      .populate({
        path: 'assignedTechnician',
        select: 'name email role lab'
      })
      .populate({
        path: 'assetId',
        select: 'assetName serialNumber labLocation'
      });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issue',
      error: error.message
    });
  }
};

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Lab Technician, Admin
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, technicianRemarks, rejectionReason, assignTechnician, checklist } = req.body;

    console.log('Update issue status request:', {
      issueId: req.params.id,
      status,
      technicianRemarks,
      checklist
    });

    if (!status && !checklist) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new status or checklist update'
      });
    }

    // Valid status transitions
    const validStatuses = ['pending', 'accepted', 'rejected', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Update checklist if provided
    if (checklist) {
      issue.checklist = checklist;
      console.log('Checklist updated:', checklist);
    }

    // Update status if provided
    if (status) {
      issue.status = status;

      // Update timestamps based on status
      if (status === 'accepted' && !issue.acceptedAt) {
        issue.acceptedAt = new Date();
        issue.assignedTechnician = req.user?.id || new mongoose.Types.ObjectId();
      }

      if (status === 'in_progress' && !issue.startedAt) {
        issue.startedAt = new Date();
      }

      if (status === 'resolved' && !issue.resolvedAt) {
        issue.resolvedAt = new Date();
        if (technicianRemarks) {
          issue.technicianRemarks = technicianRemarks;
        }
      }

      if (status === 'rejected' && rejectionReason) {
        issue.rejectionReason = rejectionReason;
      }

      if (status === 'closed' && !issue.closedAt) {
        issue.closedAt = new Date();
      }
    }

    issue.updatedAt = new Date();
    await issue.save();

    console.log('Issue saved successfully');

    // Populate and return
    await issue.populate({
      path: 'reportedBy',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assignedTechnician',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assetId',
      select: 'assetName serialNumber labLocation'
    });

    res.status(200).json({
      success: true,
      message: `Issue ${status ? 'status updated to ' + status : ''} ${checklist ? 'and checklist updated' : ''}`,
      data: issue
    });
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating issue status',
      error: error.message
    });
  }
};

// @desc    Get issues by lab and filters
// @route   GET /api/issues/lab/:labId
// @access  Lab Technician
exports.getIssuesByLab = async (req, res) => {
  try {
    const { status, severity } = req.query;
    const { labId } = req.params;

    // Build filter
    let filter = { labId };

    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email role lab')
      .populate('assignedTechnician', 'name email role lab')
      .populate('assetId', 'assetName serialNumber')
      .sort({ reportedAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    console.error('Error fetching issues by lab:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
};

// @desc    Close issue (Lab Assistant only after resolution)
// @route   PATCH /api/issues/:id/close
// @access  Lab Assistant
exports.closeIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Lab Assistant can only close their own resolved issues (if authenticated)
    if (req.user && issue.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only close your own issues'
      });
    }

    if (issue.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Only resolved issues can be closed'
      });
    }

    issue.status = 'closed';
    issue.closedAt = new Date();
    issue.updatedAt = new Date();
    await issue.save();

    await issue.populate('reportedBy', 'name email role lab');
    await issue.populate('assignedTechnician', 'name email role lab');
    await issue.populate('assetId', 'assetName serialNumber');

    res.status(200).json({
      success: true,
      message: 'Issue closed successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error closing issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing issue',
      error: error.message
    });
  }
};

// @desc    Get dashboard stats for technician
// @route   GET /api/issues/stats/technician
// @access  Lab Technician
exports.getTechnicianStats = async (req, res) => {
  try {
    const technicianId = req.user?.id;

    // For demo mode, return stats for all issues when not authenticated
    const pending = await Issue.countDocuments({ 
      ...(technicianId ? { assignedTechnician: technicianId } : {}),
      status: 'pending' 
    });

    const inProgress = await Issue.countDocuments({ 
      ...(technicianId ? { assignedTechnician: technicianId } : {}),
      status: 'in_progress' 
    });

    const resolved = await Issue.countDocuments({ 
      ...(technicianId ? { assignedTechnician: technicianId } : {}),
      status: 'resolved' 
    });

    const rejected = await Issue.countDocuments({ 
      ...(technicianId ? { assignedTechnician: technicianId } : {}),
      status: 'rejected' 
    });

    const unassigned = await Issue.countDocuments({ 
      assignedTechnician: { $exists: false },
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      data: {
        pending,
        inProgress,
        resolved,
        rejected,
        unassigned
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

// @desc    Upload file attachment to issue
// @route   POST /api/issues/:id/upload
// @access  Lab Technician, Lab Assistant
exports.uploadAttachment = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { filename, originalName, data, mimetype, size } = req.body;

    if (!filename || !data) {
      return res.status(400).json({
        success: false,
        message: 'Filename and file data are required'
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add attachment to issue
    issue.attachments.push({
      filename,
      originalName,
      mimetype,
      size,
      uploadedBy: req.user?.id || new mongoose.Types.ObjectId(),
      uploadedAt: new Date()
    });

    await issue.save();

    // Populate and return
    await issue.populate({
      path: 'reportedBy',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assignedTechnician',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assetId',
      select: 'assetName serialNumber labLocation'
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// @desc    Download file attachment
// @route   GET /api/issues/:id/attachment/:attachmentId
// @access  Lab Technician, Lab Assistant, Admin
exports.downloadAttachment = async (req, res) => {
  try {
    const { issueId, attachmentId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const attachment = issue.attachments.find(att => att._id.toString() === attachmentId);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attachment
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
};

// @desc    Delete file attachment
// @route   DELETE /api/issues/:id/attachment/:attachmentId
// @access  Lab Technician, Lab Assistant, Admin
exports.deleteAttachment = async (req, res) => {
  try {
    const { issueId, attachmentId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    issue.attachments = issue.attachments.filter(att => att._id.toString() !== attachmentId);
    await issue.save();

    // Populate and return
    await issue.populate({
      path: 'reportedBy',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assignedTechnician',
      select: 'name email role lab'
    });
    await issue.populate({
      path: 'assetId',
      select: 'assetName serialNumber labLocation'
    });

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully',
      data: issue
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting attachment',
      error: error.message
    });
  }
};
