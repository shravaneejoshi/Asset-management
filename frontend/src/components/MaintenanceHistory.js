import React, { useState, useEffect } from 'react';
import maintenanceService from '../services/maintenanceService';
import MaintenanceStatusTracker from './MaintenanceStatusTracker';
import '../styles/MaintenanceHistory.css';

const MaintenanceHistory = ({ assetId }) => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await maintenanceService.getMaintenanceByAsset(assetId);
        setMaintenanceRecords(response.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load maintenance history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (assetId) fetchHistory();
  }, [assetId]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'in_progress':
        return 'badge-info';
      case 'completed':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'repair':
        return 'type-repair';
      case 'preventive':
        return 'type-preventive';
      case 'calibration':
        return 'type-calibration';
      default:
        return 'type-default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="maintenance-history loading">Loading maintenance history...</div>;
  }

  if (error) {
    return <div className="maintenance-history error">{error}</div>;
  }

  if (!maintenanceRecords || maintenanceRecords.length === 0) {
    return (
      <div className="maintenance-history empty">
        <p>No maintenance records found for this asset</p>
      </div>
    );
  }

  return (
    <div className="maintenance-history">
      <h3>Maintenance History</h3>

      <div className="timeline">
        {maintenanceRecords.map((record, index) => (
          <div key={record._id} className="timeline-item">
            <div className="timeline-marker"></div>

            <div className="timeline-content">
              <div className="record-header">
                <div className="header-left">
                  <span className={`badge type-badge ${getTypeBadgeClass(record.maintenanceType)}`}>
                    {record.maintenanceType.charAt(0).toUpperCase() + record.maintenanceType.slice(1)}
                  </span>
                  <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                    {record.status === 'in_progress' ? 'In Progress' : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                  {record.priorityLevel && (
                    <span className={`priority priority-${record.priorityLevel}`}>
                      {record.priorityLevel.charAt(0).toUpperCase() + record.priorityLevel.slice(1)} Priority
                    </span>
                  )}
                </div>
                <div className="header-right">
                  <span className="date">{formatDate(record.reportedDate)}</span>
                </div>
              </div>

              <div className="record-body">
                <p className="issue-description">
                  <strong>Checklist:</strong>
                  {record.checklist && record.checklist.length > 0 ? (
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {record.checklist.map((item, index) => (
                        <li key={index}>{typeof item === 'string' ? item : item.text}</li>
                      ))}
                    </ul>
                  ) : (
                    <span> No checklist items</span>
                  )}
                </p>

                {record.sentTo && (
                  <p className="sent-to">
                    <strong>Sent To:</strong> {record.sentTo}
                  </p>
                )}

                {record.workPerformed && (
                  <p className="work-performed">
                    <strong>Work Performed:</strong> {record.workPerformed}
                  </p>
                )}

                <div className="record-details-grid">
                  {record.completedDate && (
                    <div className="detail-item">
                      <span className="detail-label">Completed:</span>
                      <span className="detail-value">{formatDate(record.completedDate)}</span>
                    </div>
                  )}

                  {record.cost > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Cost:</span>
                      <span className="detail-value">₹{record.cost.toLocaleString()}</span>
                    </div>
                  )}

                  {record.performedBy && (
                    <div className="detail-item">
                      <span className="detail-label">Performed By:</span>
                      <span className="detail-value">{record.performedBy}</span>
                    </div>
                  )}

                  {record.maintenanceType === 'calibration' && record.calibrationResult && (
                    <div className="detail-item">
                      <span className="detail-label">Result:</span>
                      <span className={`detail-value calibration-${record.calibrationResult}`}>
                        {record.calibrationResult.charAt(0).toUpperCase() + record.calibrationResult.slice(1)}
                      </span>
                    </div>
                  )}

                  {record.nextCalibrationDue && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Next Calibration Due:</span>
                      <span className="detail-value">{formatDate(record.nextCalibrationDue)}</span>
                    </div>
                  )}
                </div>

                {record.remarks && (
                  <p className="remarks">
                    <strong>Remarks:</strong> {record.remarks}
                  </p>
                )}

                {record.status !== 'rejected' && (
                  <div className="record-actions">
                    <button
                      className="btn btn-track-status"
                      onClick={() => setSelectedMaintenanceId(record._id)}
                    >
                      🔄 Track Status / Update
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Status Tracker Modal */}
      {selectedMaintenanceId && (
        <MaintenanceStatusTracker
          maintenanceId={selectedMaintenanceId}
          onClose={() => setSelectedMaintenanceId(null)}
          onSuccess={() => {
            setSelectedMaintenanceId(null);
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceHistory;
