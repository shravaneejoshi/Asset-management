import React, { useState, useEffect } from 'react';
import issueService from '../services/issueService';
import '../styles/LabTechnicianDashboard.css';

const LabTechnicianDashboard = ({ user }) => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    unassigned: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    severity: ''
  });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [fileUpload, setFileUpload] = useState(null);

  // Fetch issues and stats
  const fetchIssuesAndStats = async () => {
    try {
      setLoading(true);

      // Fetch all issues
      const issuesData = await issueService.getAllIssues(filters);
      setIssues(issuesData.data || []);

      // Fetch stats
      const statsData = await issueService.getTechnicianStats();
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistItemToggle = async (itemIndex) => {
    if (!selectedIssue) return;

    try {
      const updatedChecklist = [...selectedIssue.checklist];
      updatedChecklist[itemIndex] = {
        ...updatedChecklist[itemIndex],
        completed: !updatedChecklist[itemIndex].completed
      };

      console.log('Updating checklist item:', itemIndex, updatedChecklist);

      const response = await issueService.updateIssueStatus(selectedIssue._id, {
        checklist: updatedChecklist
      });

      console.log('Checklist update response:', response);

      if (response.success) {
        setSelectedIssue(response.data);
        // Update issues list
        setIssues(issues.map(issue =>
          issue._id === selectedIssue._id ? response.data : issue
        ));
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Error updating checklist: ' + (error.response?.data?.message || error.message));
    }
  };

  const getChecklistProgress = () => {
    if (!selectedIssue || !selectedIssue.checklist || selectedIssue.checklist.length === 0) {
      return 0;
    }
    const completed = selectedIssue.checklist.filter(item => item.completed).length;
    return Math.round((completed / selectedIssue.checklist.length) * 100);
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

  useEffect(() => {
    fetchIssuesAndStats();
  }, [filters]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      setLoading(true);
      const updateData = { status: newStatus };

      if (newStatus === 'resolved' && remarks) {
        updateData.technicianRemarks = remarks;
      }

      if (newStatus === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const response = await issueService.updateIssueStatus(issueId, updateData);
      if (response.success) {
        // Update local state
        setIssues(issues.map(issue =>
          issue._id === issueId ? response.data : issue
        ));
        setSelectedIssue(null);
        setStatusAction(null);
        setRemarks('');
        setRejectionReason('');
        // Refresh stats
        fetchIssuesAndStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating issue status');
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
    <div className="lab-technician-dashboard">
      <h2>Lab Technician Dashboard</h2>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card stat-pending">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pending}</p>
        </div>
        <div className="stat-card stat-in-progress">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.inProgress}</p>
        </div>
        <div className="stat-card stat-resolved">
          <h3>Resolved</h3>
          <p className="stat-number">{stats.resolved}</p>
        </div>
        <div className="stat-card stat-rejected">
          <h3>Rejected</h3>
          <p className="stat-number">{stats.rejected}</p>
        </div>
        <div className="stat-card stat-unassigned">
          <h3>Unassigned</h3>
          <p className="stat-number">{stats.unassigned}</p>
        </div>
      </div>

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

        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="issues-container">
        <h3>All Issues</h3>
        {loading && <p className="loading">Loading...</p>}
        {!loading && issues.length === 0 && (
          <p className="no-issues">No issues found</p>
        )}

        {!loading && issues.length > 0 && (
          <div className="issues-table-wrapper">
            <table className="issues-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Reported Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr key={issue._id}>
                    <td>{issue.assetId?.assetName || 'Unknown'}</td>
                    <td>{issue.issueType}</td>
                    <td>
                      <span className={getSeverityBadgeClass(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(issue.status)}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>{issue.reportedBy?.name || 'N/A'}</td>
                    <td>{new Date(issue.reportedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => setSelectedIssue(issue)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <label>Serial Number:</label>
                <span>{selectedIssue.assetId?.serialNumber || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <label>Reported By:</label>
                <span>{selectedIssue.reportedBy?.name || 'Lab Assistant'}</span>
              </div>

              <div className="detail-row">
                <label>Issue Type:</label>
                <span>{selectedIssue.issueType}</span>
              </div>

              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedIssue.description}</span>
              </div>

              <div className="detail-row">
                <label>Severity:</label>
                <span className={getSeverityBadgeClass(selectedIssue.severity)}>
                  {selectedIssue.severity.toUpperCase()}
                </span>
              </div>

              <div className="detail-row">
                <label>Status:</label>
                <span className={getStatusBadgeClass(selectedIssue.status)}>
                  {selectedIssue.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="detail-row">
                <label>Reported By:</label>
                <span>{selectedIssue.reportedBy?.name}</span>
              </div>

              <div className="detail-row">
                <label>Reported Date:</label>
                <span>{new Date(selectedIssue.reportedAt).toLocaleString()}</span>
              </div>

              {selectedIssue.checklist && selectedIssue.checklist.length > 0 && (
                <div className="detail-row">
                  <label>Task Checklist ({getChecklistProgress()}% Complete):</label>
                  <div className="checklist-progress">
                    <div className="progress-bar" style={{ width: `${getChecklistProgress()}%` }}></div>
                  </div>
                  <div className="checklist-interactive">
                    {selectedIssue.checklist.map((item, idx) => (
                      <div key={idx} className="checklist-item">
                        <input
                          type="checkbox"
                          id={`checklist-${idx}`}
                          checked={item.completed || false}
                          onChange={() => handleChecklistItemToggle(idx)}
                          disabled={selectedIssue.status === 'resolved' || selectedIssue.status === 'closed'}
                        />
                        <label htmlFor={`checklist-${idx}`} className={item.completed ? 'completed' : ''}>
                          {typeof item === 'string' ? item : item.text}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedIssue.technicianRemarks && (
                <div className="detail-row">
                  <label>Technician Remarks:</label>
                  <span>{selectedIssue.technicianRemarks}</span>
                </div>
              )}

              {selectedIssue.rejectionReason && (
                <div className="detail-row">
                  <label>Rejection Reason:</label>
                  <span>{selectedIssue.rejectionReason}</span>
                </div>
              )}

              {/* File Attachments Section */}
              <div className="detail-row">
                <label>Attachments:</label>
                <div className="attachments-section">
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-input"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                      disabled={loading}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="btn btn-upload"
                      onClick={() => document.getElementById('file-input').click()}
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

            {/* Action Buttons */}
            <div className="modal-footer">
              {selectedIssue.status === 'pending' && (
                <>
                  <button
                    className="btn btn-accept"
                    onClick={() => handleStatusChange(selectedIssue._id, 'accepted')}
                    disabled={loading}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => setStatusAction('reject')}
                    disabled={loading}
                  >
                    Reject
                  </button>
                </>
              )}

              {selectedIssue.status === 'accepted' && (
                <button
                  className="btn btn-progress"
                  onClick={() => handleStatusChange(selectedIssue._id, 'in_progress')}
                  disabled={loading}
                >
                  Mark as In Progress
                </button>
              )}

              {selectedIssue.status === 'in_progress' && (
                <button
                  className="btn btn-resolve"
                  onClick={() => setStatusAction('resolve')}
                  disabled={loading}
                >
                  Mark as Resolved
                </button>
              )}

              <button
                className="btn btn-close"
                onClick={() => setSelectedIssue(null)}
              >
                Close
              </button>
            </div>

            {/* Rejection Form */}
            {statusAction === 'reject' && (
              <div className="action-form">
                <h4>Reject Issue</h4>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason"
                  rows="3"
                  required
                />
                <div className="form-buttons">
                  <button
                    className="btn btn-submit"
                    onClick={() =>
                      handleStatusChange(selectedIssue._id, 'rejected')
                    }
                    disabled={!rejectionReason || loading}
                  >
                    Submit Rejection
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={() => setStatusAction(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Resolution Form */}
            {statusAction === 'resolve' && (
              <div className="action-form">
                <h4>Mark as Resolved</h4>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter technician remarks"
                  rows="3"
                  required
                />
                <div className="form-buttons">
                  <button
                    className="btn btn-submit"
                    onClick={() =>
                      handleStatusChange(selectedIssue._id, 'resolved')
                    }
                    disabled={!remarks || loading}
                  >
                    Submit Resolution
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={() => setStatusAction(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTechnicianDashboard;
