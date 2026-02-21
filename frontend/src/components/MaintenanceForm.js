import React, { useState, useEffect } from 'react';
import maintenanceService from '../services/maintenanceService';
import assetService from '../services/assetService';
import '../styles/MaintenanceForm.css';

const MaintenanceForm = ({ assetId, onSuccess, onCancel }) => {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maintenanceId, setMaintenanceId] = useState(null);
  const [maintenanceRecord, setMaintenanceRecord] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'view-status', or 'complete'

  // Section 2: Maintenance Details
  const [maintenanceType, setMaintenanceType] = useState('preventive');
  const [checklist, setChecklist] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('medium');
  const [sentTo, setSentTo] = useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState('pending');

  // Section 3: Completion Details
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workPerformed, setWorkPerformed] = useState('');
  const [cost, setCost] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [calibrationResult, setCalibrationResult] = useState('passed');
  const [nextCalibrationDue, setNextCalibrationDue] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch asset data when component mounts
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const response = await assetService.getAssetById(assetId);
        setAsset(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load asset details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (assetId) fetchAsset();
  }, [assetId]);

  // Handle form submission for creating maintenance request
  const handleCreateMaintenance = async (e) => {
    e.preventDefault();

    if (checklist.length === 0) {
      setError('Please add at least one checklist item');
      return;
    }

    try {
      setLoading(true);
      const maintenanceData = {
        assetId,
        maintenanceType,
        checklist,
        priorityLevel,
        sentTo: sentTo || undefined,
        expectedCompletionDate: expectedCompletionDate || undefined
      };

      const response = await maintenanceService.createMaintenance(maintenanceData);

      if (response.success) {
        setMaintenanceId(response.data._id);
        setMaintenanceRecord(response.data);
        setMaintenanceStatus(response.data.status || 'pending');
        setFormMode('view-status');
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Failed to create maintenance request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle completing maintenance
  const handleCompleteMaintenance = async (e) => {
    e.preventDefault();

    if (!workPerformed.trim()) {
      setError('Please describe the work performed');
      return;
    }

    if (maintenanceType === 'calibration' && !nextCalibrationDue) {
      setError('Please set the next calibration due date');
      return;
    }

    try {
      setLoading(true);
      const completionData = {
        completedDate: completedDate || new Date().toISOString().split('T')[0],
        workPerformed,
        cost: cost ? parseInt(cost) : 0,
        performedBy: performedBy || undefined,
        remarks: remarks || undefined
      };

      if (maintenanceType === 'calibration') {
        completionData.calibrationResult = calibrationResult;
        completionData.nextCalibrationDue = nextCalibrationDue;
      }

      const response = await maintenanceService.completeMaintenance(maintenanceId, completionData);

      if (response.success) {
        setError('');
        if (onSuccess) onSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete maintenance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const response = await maintenanceService.updateMaintenanceStatus(maintenanceId, newStatus);

      if (response.success) {
        setMaintenanceStatus(newStatus);
        setMaintenanceRecord(response.data);
        
        // If status changed to completed, show completion form
        if (newStatus === 'completed') {
          setFormMode('complete');
        }
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Failed to update status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !asset) {
    return <div className="maintenance-form loading">Loading asset details...</div>;
  }

  if (!asset) {
    return <div className="maintenance-form error">Asset not found</div>;
  }

  return (
    <div className="maintenance-form-wrapper">
      <div className="maintenance-form">
        <h2>
          {formMode === 'create' && 'Report Issue / Send for Maintenance'}
          {formMode === 'view-status' && 'Maintenance Request Details'}
          {formMode === 'complete' && 'Complete Maintenance Work'}
        </h2>

        {error && <div className="error-message">{error}</div>}

        {/* SECTION 1: Asset Information (Auto-filled & Read-only) */}
        <div className="form-section">
          <h3>Asset Information</h3>
          <div className="section-note">These fields are auto-filled from asset database</div>

          <div className="form-grid">
            <div className="form-group">
              <label>Asset Name</label>
              <input type="text" value={asset?.assetName || maintenanceRecord?.assetName || ''} disabled />
            </div>

            <div className="form-group">
              <label>Asset ID</label>
              <input type="text" value={asset?._id || maintenanceRecord?.assetId || ''} disabled />
            </div>

            <div className="form-group">
              <label>Serial Number</label>
              <input type="text" value={asset?.serialNumber || maintenanceRecord?.serialNumber || 'N/A'} disabled />
            </div>

            <div className="form-group">
              <label>Lab Location</label>
              <input type="text" value={asset?.labLocation || maintenanceRecord?.labLocation || ''} disabled />
            </div>

            <div className="form-group">
              <label>Current Status</label>
              <input type="text" value={asset?.status || maintenanceRecord?.asset?.status || ''} disabled />
            </div>

            <div className="form-group">
              <label>Condition</label>
              <input type="text" value={asset?.condition || ''} disabled />
            </div>
          </div>
        </div>

        {formMode === 'create' ? (
          /* SECTION 2: Maintenance Details (Create) */
          <form onSubmit={handleCreateMaintenance}>
            <div className="form-section">
              <h3>Maintenance Details</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Maintenance Type <span className="required">*</span>
                  </label>
                  <select
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
                    required
                  >
                    <option value="preventive">Preventive</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="calibration">Calibration</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Priority Level
                  </label>
                  <select value={priorityLevel} onChange={(e) => setPriorityLevel(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Maintenance Checklist <span className="required">*</span>
                </label>
                <div className="checklist-container">
                  <div className="add-checklist-item">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add checklist item (e.g., Check power supply, Inspect cables)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newChecklistItem.trim()) {
                            setChecklist([...checklist, { text: newChecklistItem, completed: false }]);
                            setNewChecklistItem('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-add-item"
                      onClick={() => {
                        if (newChecklistItem.trim()) {
                          setChecklist([...checklist, { text: newChecklistItem, completed: false }]);
                          setNewChecklistItem('');
                        }
                      }}
                    >
                      + Add Item
                    </button>
                  </div>

                  {checklist.length > 0 && (
                    <div className="checklist-items">
                      <ul>
                        {checklist.map((item, index) => (
                          <li key={index}>
                            <span>{item.text}</span>
                            <button
                              type="button"
                              className="btn-remove-item"
                              onClick={() => {
                                setChecklist(checklist.filter((_, i) => i !== index));
                              }}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                      <p className="checklist-count">{checklist.length} item(s) in checklist</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Sent To (Technician/Vendor)</label>
                  <input
                    type="text"
                    value={sentTo}
                    onChange={(e) => setSentTo(e.target.value)}
                    placeholder="e.g., ABC Instruments Pvt Ltd or Internal Technician"
                  />
                </div>

                <div className="form-group">
                  <label>Expected Completion Date</label>
                  <input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={(e) => setExpectedCompletionDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Maintenance Request'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        ) : formMode === 'view-status' ? (
          /* SECTION 2B: View Status & Update Status */
          <div>
            <div className="form-section">
              <h3>Maintenance Request Details</h3>

              <div className="maintenance-info">
                <div className="info-item">
                  <label>Maintenance Type:</label>
                  <span className="info-value">{maintenanceRecord?.maintenanceType?.charAt(0).toUpperCase() + maintenanceRecord?.maintenanceType?.slice(1)}</span>
                </div>
                <div className="info-item">
                  <label>Checklist:</label>
                  <div className="info-value checklist-display">
                    {maintenanceRecord?.checklist && maintenanceRecord.checklist.length > 0 ? (
                      <ul>
                        {maintenanceRecord.checklist.map((item, index) => (
                          <li key={index}>{typeof item === 'string' ? item : item.text}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>No checklist items</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <label>Priority Level:</label>
                  <span className={`info-value priority priority-${maintenanceRecord?.priorityLevel}`}>
                    {maintenanceRecord?.priorityLevel?.toUpperCase()}
                  </span>
                </div>
                <div className="info-item">
                  <label>Sent To:</label>
                  <span className="info-value">{maintenanceRecord?.sentTo || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Reported Date:</label>
                  <span className="info-value">{new Date(maintenanceRecord?.reportedDate).toLocaleDateString()}</span>
                </div>
                {maintenanceRecord?.expectedCompletionDate && (
                  <div className="info-item">
                    <label>Expected Completion:</label>
                    <span className="info-value">{new Date(maintenanceRecord?.expectedCompletionDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>🔄 Update Maintenance Status</h3>
              
              <div className="status-display">
                <div className="current-status">
                  <label>Current Status:</label>
                  <span className={`status-badge status-${maintenanceStatus}`}>
                    {maintenanceStatus?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="status-buttons">
                <button
                  type="button"
                  className="btn btn-status"
                  onClick={() => {
                    if (window.confirm('Change status to Pending?')) {
                      handleStatusChange('pending');
                    }
                  }}
                  disabled={loading || maintenanceStatus === 'pending'}
                >
                  ⏸️ Pending
                </button>

                <button
                  type="button"
                  className="btn btn-status"
                  onClick={() => {
                    if (window.confirm('Change status to In Progress?')) {
                      handleStatusChange('in_progress');
                    }
                  }}
                  disabled={loading || maintenanceStatus === 'in_progress'}
                >
                  ⚙️ In Progress
                </button>

                <button
                  type="button"
                  className={`btn btn-status ${maintenanceStatus === 'completed' ? 'active' : ''}`}
                  onClick={() => {
                    if (maintenanceStatus === 'completed') {
                      setFormMode('complete');
                    } else if (window.confirm('Mark as completed? You will need to fill in the completion details.')) {
                      handleStatusChange('completed');
                    }
                  }}
                  disabled={loading}
                >
                  {maintenanceStatus === 'completed' ? '✅ Completed - View Form' : '✅ Mark as Completed'}
                </button>

                <button
                  type="button"
                  className="btn btn-status btn-danger"
                  onClick={() => {
                    if (window.confirm('Reject this maintenance request? This action cannot be undone.')) {
                      handleStatusChange('rejected');
                    }
                  }}
                  disabled={loading}
                >
                  ❌ Reject
                </button>
              </div>

              <div className="status-info">
                {maintenanceStatus === 'pending' && (
                  <div className="info-box info-pending">
                    <p><strong>Status: PENDING</strong></p>
                    <p>This maintenance request is waiting to be started. Change status to "In Progress" when work begins.</p>
                  </div>
                )}
                {maintenanceStatus === 'in_progress' && (
                  <div className="info-box info-in-progress">
                    <p><strong>Status: IN PROGRESS</strong></p>
                    <p>Work is currently being done. Once completed, click "Mark as Completed" to fill in the completion details.</p>
                  </div>
                )}
                {maintenanceStatus === 'completed' && (
                  <div className="info-box info-completed">
                    <p><strong>Status: COMPLETED ✓</strong></p>
                    <p>Click the "Completed - View Form" button above to fill in the maintenance work details.</p>
                  </div>
                )}
                {maintenanceStatus === 'rejected' && (
                  <div className="info-box info-rejected">
                    <p><strong>Status: REJECTED</strong></p>
                    <p>This maintenance request has been rejected. No further action needed.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                Close
              </button>
            </div>
          </div>
        ) : (
          /* SECTION 3: Completion Details */
          <form onSubmit={handleCompleteMaintenance}>
            <div className="form-section">
              <h3>Completion Details</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Completed Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Performed By</label>
                  <input
                    type="text"
                    value={performedBy}
                    onChange={(e) => setPerformedBy(e.target.value)}
                    placeholder="Technician or vendor name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Work Performed <span className="required">*</span>
                </label>
                <textarea
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="Describe the work done, repairs, replacements, etc."
                  rows={4}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Cost (Optional)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="Maintenance cost"
                    min="0"
                  />
                </div>
              </div>

              {maintenanceType === 'calibration' && (
                <div className="calibration-section">
                  <h4>Calibration Details</h4>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Calibration Result <span className="required">*</span>
                      </label>
                      <select
                        value={calibrationResult}
                        onChange={(e) => setCalibrationResult(e.target.value)}
                        required
                      >
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="partial">Partial</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Next Calibration Due <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={nextCalibrationDue}
                        onChange={(e) => setNextCalibrationDue(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any additional remarks or notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Completing...' : 'Mark as Completed'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MaintenanceForm;
