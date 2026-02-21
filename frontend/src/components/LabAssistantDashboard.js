import React, { useState, useEffect } from 'react';
import issueService from '../services/issueService';
import assetService from '../services/assetService';
import authService from '../services/authService';
import '../styles/LabAssistantDashboard.css';

const LabAssistantDashboard = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewType, setViewType] = useState('my'); // 'my' or 'all'
  const [filters, setFilters] = useState({
    status: ''
  });

  const [formData, setFormData] = useState({
    assetId: '',
    issueType: 'breakdown',
    description: '',
    severity: 'medium',
    requiredSkill: 'computer',
    assignedTechnician: '',
    checklist: []
  });

  const [checklistItem, setChecklistItem] = useState('');
  const [fileUpload, setFileUpload] = useState(null);

  // Fetch issues and assets
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch issues with viewType parameter
      const issuesResponse = await issueService.getAllIssues({ ...filters, viewType });
      const issuesArray = Array.isArray(issuesResponse) 
        ? issuesResponse 
        : (issuesResponse.data || []);
      setIssues(issuesArray);

      // Fetch assets
      const assetsResponse = await assetService.getAllAssets();
      
      // The assetService returns full axios response, so we need response.data
      // which contains { success, count, data: [...assets] }
      const assetsArray = Array.isArray(assetsResponse) 
        ? assetsResponse 
        : Array.isArray(assetsResponse.data) 
          ? assetsResponse.data 
          : (assetsResponse.data?.data || []);
      
      setAssets(assetsArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading assets or issues. Make sure the backend is running. Check browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechniciansBySkill = async (skill) => {
    try {
      console.log('Fetching technicians for skill:', skill);
      const technicians = await authService.getTechniciansBySkill(skill);
      console.log('Technicians received:', technicians);
      setAvailableTechnicians(technicians || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Error fetching available technicians');
      setAvailableTechnicians([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, viewType]);

  const handleAddChecklistItem = () => {
    if (checklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, { text: checklistItem, completed: false }]
      }));
      setChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();

    if (!formData.assetId || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.checklist.length === 0) {
      alert('Please add at least one checklist item');
      return;
    }

    if (!formData.assignedTechnician) {
      alert('Please select a technician to assign to this issue');
      return;
    }

    try {
      setLoading(true);
      const response = await issueService.createIssue({
        assetId: formData.assetId,
        issueType: formData.issueType,
        description: formData.description,
        severity: formData.severity,
        requiredSkill: formData.requiredSkill,
        assignedTechnician: formData.assignedTechnician,
        checklist: formData.checklist
      });

      if (response.success) {
        setFormData({
          assetId: '',
          issueType: 'breakdown',
          description: '',
          severity: 'medium',
          requiredSkill: 'computer',
          assignedTechnician: '',
          checklist: []
        });
        setAvailableTechnicians([]);
        setShowCreateForm(false);
        fetchData();
        alert('Issue created successfully!');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Error creating issue');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseIssue = async (issueId) => {
    if (window.confirm('Are you sure you want to close this issue?')) {
      try {
        setLoading(true);
        const response = await issueService.closeIssue(issueId);
        if (response.success) {
          fetchData();
          setSelectedIssue(null);
          alert('Issue closed successfully!');
        }
      } catch (error) {
        console.error('Error closing issue:', error);
        alert('Error closing issue');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !selectedIssue) return;

    try {
      setLoading(true);
      const response = await issueService.uploadAttachment(selectedIssue._id, file);
      if (response.success) {
        setSelectedIssue(response.data);
        // Update issues list
        setIssues(issues.map(issue =>
          issue._id === selectedIssue._id ? response.data : issue
        ));
        setFileUpload(null);
        alert('File uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      setLoading(true);
      const response = await issueService.deleteAttachment(selectedIssue._id, attachmentId);
      if (response.success) {
        setSelectedIssue(response.data);
        // Update issues list
        setIssues(issues.map(issue =>
          issue._id === selectedIssue._id ? response.data : issue
        ));
        alert('File deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status.replace('_', '-')}`;
  };

  const getSeverityBadgeClass = (severity) => {
    return `severity-badge severity-${severity}`;
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  return (
    <div className="lab-assistant-dashboard">
      <div className="dashboard-header">
        <h2>Lab Assistant Dashboard - Issue Management</h2>
        <button
          className="btn btn-primary-action"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Issue'}
        </button>
      </div>

      {/* Create Issue Form */}
      {showCreateForm && (
        <div className="create-issue-form">
          <h3>Report New Issue</h3>
          <form onSubmit={handleCreateIssue}>
            <div className="form-group">
              <label>Asset *</label>
              <select
                value={formData.assetId}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    assetId: e.target.value
                  }))
                }
                required
              >
                <option value="">Select Asset</option>
                {assets.map(asset => (
                  <option key={asset._id} value={asset._id}>
                    {asset.assetName} ({asset.serialNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Issue Type *</label>
              <select
                value={formData.issueType}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    issueType: e.target.value
                  }))
                }
              >
                <option value="preventive">Preventive</option>
                <option value="breakdown">Breakdown</option>
                <option value="calibration">Calibration</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity *</label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    severity: e.target.value
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Required Skill *</label>
              <select
                value={formData.requiredSkill}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    requiredSkill: e.target.value,
                    assignedTechnician: '' // Reset technician when skill changes
                  }));
                  fetchTechniciansBySkill(e.target.value);
                }}
              >
                <option value="computer">Computer</option>
                <option value="electronics">Electronics</option>
                <option value="mechanical">Mechanical</option>
                <option value="printer_repair">Printer Repair</option>
                <option value="calibration">Calibration</option>
                <option value="civil">Civil</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign Technician *</label>
              <select
                value={formData.assignedTechnician}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    assignedTechnician: e.target.value
                  }))
                }
                required
              >
                <option value="">Select Technician</option>
                {availableTechnicians.length > 0 ? (
                  availableTechnicians.map(tech => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No technicians available for this skill</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                placeholder="Describe the issue"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Maintenance Checklist *</label>
              <div className="checklist-input">
                <input
                  type="text"
                  value={checklistItem}
                  onChange={(e) => setChecklistItem(e.target.value)}
                  placeholder="Add checklist item"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-add"
                  onClick={handleAddChecklistItem}
                >
                  Add
                </button>
              </div>

              {formData.checklist.length > 0 && (
                <div className="checklist-display">
                  <ul>
                    {formData.checklist.map((item, idx) => (
                      <li key={idx}>
                        <span>{item.text}</span>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemoveChecklistItem(idx)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Issue'}
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="view-toggle-container">
        <button
          className={`view-toggle-btn ${viewType === 'my' ? 'active' : ''}`}
          onClick={() => setViewType('my')}
        >
          My Issues
        </button>
        <button
          className={`view-toggle-btn ${viewType === 'all' ? 'active' : ''}`}
          onClick={() => setViewType('all')}
        >
          All Issues
        </button>
      </div>

      {/* Issues List */}
      <div className="issues-container">
        <h3>{viewType === 'my' ? 'My Issues' : 'All Issues in Lab'}</h3>
        {loading && <p className="loading">Loading...</p>}
        {!loading && issues.length === 0 && (
          <p className="no-issues">No issues found</p>
        )}

        {!loading && issues.length > 0 && (
          <div className="issues-grid">
            {issues.map(issue => (
              <div key={issue._id} className="issue-card">
                <div className="card-header">
                  <h4>{issue.assetId?.assetName || 'Unknown Asset'}</h4>
                  <span className={getStatusBadgeClass(issue.status)}>
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="label">Type:</span>
                    <span>{issue.issueType}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Severity:</span>
                    <span className={getSeverityBadgeClass(issue.severity)}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">Date:</span>
                    <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Description:</span>
                    <p>{issue.description}</p>
                  </div>

                  {issue.assignedTechnician && (
                    <div className="info-row">
                      <span className="label">Assigned Technician:</span>
                      <span>{issue.assignedTechnician?.name}</span>
                    </div>
                  )}

                  {issue.technicianRemarks && (
                    <div className="info-row">
                      <span className="label">Technician Remarks:</span>
                      <p>{issue.technicianRemarks}</p>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button
                    className="btn btn-view"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    View Details
                  </button>
                  {issue.status === 'resolved' && (
                    <button
                      className="btn btn-close"
                      onClick={() => handleCloseIssue(issue._id)}
                      disabled={loading}
                    >
                      Close Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Issue Details</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedIssue(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <label>Asset Name:</label>
                <span>{selectedIssue.assetId?.assetName}</span>
              </div>

              <div className="detail-row">
                <label>Reported By:</label>
                <span>{selectedIssue.reportedBy?.name || 'Lab Assistant'}</span>
              </div>

              <div className="detail-row">
                <label>Status:</label>
                <span className={getStatusBadgeClass(selectedIssue.status)}>
                  {selectedIssue.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="detail-row">
                <label>Issue Type:</label>
                <span>{selectedIssue.issueType}</span>
              </div>

              <div className="detail-row">
                <label>Severity:</label>
                <span className={getSeverityBadgeClass(selectedIssue.severity)}>
                  {selectedIssue.severity.toUpperCase()}
                </span>
              </div>

              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedIssue.description}</span>
              </div>

              {selectedIssue.checklist && selectedIssue.checklist.length > 0 && (
                <div className="detail-row">
                  <label>Maintenance Checklist:</label>
                  <div className="checklist-details">
                    {(() => {
                      const completed = selectedIssue.checklist.filter(item => item.completed).length;
                      const total = selectedIssue.checklist.length;
                      const percentage = Math.round((completed / total) * 100);
                      return (
                        <>
                          <div className="checklist-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{width: `${percentage}%`}}
                              ></div>
                            </div>
                            <p className="progress-text">{completed}/{total} Complete ({percentage}%)</p>
                          </div>
                          <ul className="checklist">
                            {selectedIssue.checklist.map((item, idx) => (
                              <li key={idx} className={item.completed ? 'completed' : ''}>
                                <span className="checkbox-display">
                                  {item.completed ? '✓' : '○'}
                                </span>
                                <span className="item-text">
                                  {typeof item === 'string' ? item : item.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {selectedIssue.assignedTechnician && (
                <div className="detail-row">
                  <label>Assigned Technician:</label>
                  <span>{selectedIssue.assignedTechnician?.name}</span>
                </div>
              )}

              {selectedIssue.technicianRemarks && (
                <div className="detail-row">
                  <label>Technician Remarks:</label>
                  <span>{selectedIssue.technicianRemarks}</span>
                </div>
              )}

              {selectedIssue.rejectionReason && (
                <div className="detail-row rejected-reason">
                  <label>Rejection Reason:</label>
                  <span>{selectedIssue.rejectionReason}</span>
                </div>
              )}

              <div className="detail-row">
                <label>Reported Date:</label>
                <span>{new Date(selectedIssue.reportedAt).toLocaleString()}</span>
              </div>

              {/* File Attachments Section */}
              <div className="detail-row">
                <label>Attachments:</label>
                <div className="attachments-section">
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-input-assistant"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="btn btn-upload"
                      onClick={() => document.getElementById('file-input-assistant').click()}
                      disabled={loading}
                    >
                      + Upload File
                    </button>
                  </div>

                  {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                    <div className="attachments-list">
                      <h4>Files ({selectedIssue.attachments.length}):</h4>
                      <ul>
                        {selectedIssue.attachments.map((attachment) => (
                          <li key={attachment._id} className="attachment-item">
                            <div className="attachment-info">
                              <span className="filename">{attachment.originalName}</span>
                              <span className="filesize">({(attachment.size / 1024).toFixed(2)} KB)</span>
                              <span className="upload-date">
                                Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              className="btn btn-delete-file"
                              onClick={() => handleDeleteAttachment(attachment._id)}
                              disabled={loading}
                              title="Delete file"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedIssue.status === 'resolved' && (
                <button
                  className="btn btn-close"
                  onClick={() => handleCloseIssue(selectedIssue._id)}
                  disabled={loading}
                >
                  Close Issue
                </button>
              )}
              <button
                className="btn btn-cancel"
                onClick={() => setSelectedIssue(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabAssistantDashboard;
