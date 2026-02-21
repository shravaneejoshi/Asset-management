import React, { useState, useEffect } from 'react';
import maintenanceService from '../services/maintenanceService';
import '../styles/MaintenanceForm.css';

const MaintenanceStatusTracker = ({ maintenanceId, onClose, onSuccess }) => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [maintenanceStatus, setMaintenanceStatus] = useState('');
  const [formMode, setFormMode] = useState('view-status');

  // Completion Details
  const [completedDate, setCompletedDate] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [cost, setCost] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [calibrationResult, setCalibrationResult] = useState('passed');
  const [nextCalibrationDue, setNextCalibrationDue] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch existing maintenance record
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true); 
        const response = await maintenanceService.getMaintenanceById(maintenanceId);
        const maintenance = response.data;
        
        setRecord(maintenance);
        setMaintenanceStatus(maintenance.status);
        
        // Pre-fill completion fields if already completed
        if (maintenance.completedDate) {
          setCompletedDate(maintenance.completedDate.split('T')[0]);
        } else {
          setCompletedDate(new Date().toISOString().split('T')[0]);
        }
        
        setWorkPerformed(maintenance.workPerformed || '');
        setCost(maintenance.cost || '');
        setPerformedBy(maintenance.performedBy || '');
        setRemarks(maintenance.remarks || '');
        
        if (maintenance.maintenanceType === 'calibration') {
          setCalibrationResult(maintenance.calibrationResult || 'passed');
          setNextCalibrationDue(maintenance.nextCalibrationDue?.split('T')[0] || '');
        }

        setError('');
      } catch (err) {
        setError('Failed to load maintenance record');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (maintenanceId) fetchRecord();
  }, [maintenanceId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const response = await maintenanceService.updateMaintenanceStatus(maintenanceId, newStatus);

      if (response.success) {
        setMaintenanceStatus(newStatus);
        setRecord(response.data);
        
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

  const handleCompleteMaintenance = async (e) => {
    e.preventDefault();

    if (!workPerformed.trim()) {
      setError('Please describe the work performed');
      return;
    }

    if (record.maintenanceType === 'calibration' && !nextCalibrationDue) {
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

      if (record.maintenanceType === 'calibration') {
        completionData.calibrationResult = calibrationResult;
        completionData.nextCalibrationDue = nextCalibrationDue;
      }

      const response = await maintenanceService.completeMaintenance(maintenanceId, completionData);

      if (response.success) {
        setError('');
        setRecord(response.data);
        if (onSuccess) onSuccess(response.data);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete maintenance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !record) {
    return (
      <div className="maintenance-form-wrapper">
        <div className="maintenance-form loading">Loading maintenance record...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="maintenance-form-wrapper">
        <div className="maintenance-form error">
          <h2>Error</h2>
          <p>{error || 'Maintenance record not found'}</p>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-form-wrapper">
      <div className="maintenance-form">
        <h2>
          {formMode === 'view-status' && '🔄 Track Maintenance Status'}
          {formMode === 'complete' && '✅ Complete Maintenance Work'}
        </h2>

        {error && <div className="error-message">{error}</div>}

        {formMode === 'view-status' ? (
          <div>
            <div className="form-section">
              <h3>Maintenance Details</h3>

              <div className="maintenance-info">
                <div className="info-item">
                  <label>Asset:</label>
                  <span className="info-value">{record.assetName || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <label>Maintenance Type:</label>
                  <span className="info-value">{record.maintenanceType?.charAt(0).toUpperCase() + record.maintenanceType?.slice(1)}</span>
                </div>
                <div className="info-item">
                  <label>Checklist:</label>
                  <span className="info-value">
                    {record.checklist && record.checklist.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {record.checklist.map((item, index) => (
                          <li key={index}>{typeof item === 'string' ? item : item.text}</li>
                        ))}
                      </ul>
                    ) : (
                      'No checklist items'
                    )}
                  </span>
                </div>
                <div className="info-item">
                  <label>Priority Level:</label>
                  <span className={`info-value priority priority-${record.priorityLevel}`}>
                    {record.priorityLevel?.toUpperCase()}
                  </span>
                </div>
                <div className="info-item">
                  <label>Reported Date:</label>
                  <span className="info-value">{new Date(record.reportedDate).toLocaleDateString()}</span>
                </div>
                {record.sentTo && (
                  <div className="info-item">
                    <label>Sent To:</label>
                    <span className="info-value">{record.sentTo}</span>
                  </div>
                )}
                {record.expectedCompletionDate && (
                  <div className="info-item">
                    <label>Expected Completion:</label>
                    <span className="info-value">{new Date(record.expectedCompletionDate).toLocaleDateString()}</span>
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
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Close
              </button>
            </div>
          </div>
        ) : (
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

              {record.maintenanceType === 'calibration' && (
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
                {loading ? 'Saving...' : 'Mark as Completed'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MaintenanceStatusTracker;
