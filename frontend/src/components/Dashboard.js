import React, { useState, useEffect } from 'react';
import assetService from '../services/assetService';
import maintenanceService from '../services/maintenanceService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    inUseAssets: 0,
    underMaintenanceAssets: 0,
    lowStockAssets: 0,
    warrantyExpiringAssets: 0
  });

  const [maintenanceStats, setMaintenanceStats] = useState({
    totalMaintenance: 0,
    pendingMaintenance: 0,
    inProgressMaintenance: 0,
    completedMaintenance: 0,
    assetsUnderMaintenance: 0,
    totalCost: 0
  });

  const [lowStockAssets, setLowStockAssets] = useState([]);
  const [warrantyAssets, setWarrantyAssets] = useState([]);
  const [calibrationDueAlerts, setCalibrationDueAlerts] = useState([]);
  const [overdueAlerts, setOverdueAlerts] = useState([]);
  const [maintenanceDueSoon, setMaintenanceDueSoon] = useState([]);
  const [overdueMaintenanceAssets, setOverdueMaintenanceAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, lowStockRes, warrantyRes, maintenanceStatsRes, calibrationAlertsRes, overdueAlertsRes, maintenanceDueRes, overdueMaintenanceRes] = await Promise.all([
        assetService.getDashboardStats(),
        assetService.getLowStockAssets(),
        assetService.getWarrantyExpiringAssets(),
        maintenanceService.getMaintenanceStats(),
        maintenanceService.getCalibrationDueAlerts(),
        maintenanceService.getOverdueAlerts(),
        assetService.getMaintenanceDueSoon(),
        assetService.getOverdueMaintenanceAssets()
      ]);

      setStats(statsRes.data.data || {});
      setLowStockAssets(lowStockRes.data.data || []);
      setWarrantyAssets(warrantyRes.data.data || []);
      setMaintenanceStats(maintenanceStatsRes.data.data || {
        totalMaintenance: 0,
        pendingMaintenance: 0,
        inProgressMaintenance: 0,
        completedMaintenance: 0,
        assetsUnderMaintenance: 0,
        totalCost: 0
      });
      setCalibrationDueAlerts(calibrationAlertsRes.data.data || []);
      setOverdueAlerts(overdueAlertsRes.data.data || []);
      setMaintenanceDueSoon(maintenanceDueRes.data.data || []);
      setOverdueMaintenanceAssets(overdueMaintenanceRes.data.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Asset Management Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📦</div>
          <div className="stat-content">
            <h3>Total Assets</h3>
            <p className="stat-number">{stats.totalAssets}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available">✅</div>
          <div className="stat-content">
            <h3>Available</h3>
            <p className="stat-number">{stats.availableAssets}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon in-use">🔧</div>
          <div className="stat-content">
            <h3>In Use</h3>
            <p className="stat-number">{stats.inUseAssets}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon maintenance">⚠️</div>
          <div className="stat-content">
            <h3>Under Maintenance</h3>
            <p className="stat-number">{stats.underMaintenanceAssets}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon low-stock">📉</div>
          <div className="stat-content">
            <h3>Low Stock</h3>
            <p className="stat-number">{stats.lowStockAssets}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warranty">⏰</div>
          <div className="stat-content">
            <h3>Warranty Expiring</h3>
            <p className="stat-number">{stats.warrantyExpiringAssets}</p>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon maintenance-pending">🔧</div>
          <div className="stat-content">
            <h3>Pending Maintenance</h3>
            <p className="stat-number">{maintenanceStats?.pendingMaintenance || 0}</p>
          </div>
        </div> 

        <div className="stat-card">
          <div className="stat-icon maintenance-cost">💰</div>
          <div className="stat-content">
            <h3>Maintenance Cost</h3>
            <p className="stat-number">₹{(maintenanceStats?.totalCost || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="alerts-section">
        {/* Low Stock Alert */}
        <div className="alert-box">
          <h3>📉 Low Stock Alert</h3>
          {lowStockAssets.length === 0 ? (
            <p className="no-alerts">All consumables are well stocked</p>
          ) : (
            <div className="alert-list">
              {lowStockAssets.map((asset) => (
                <div key={asset._id} className="alert-item low-stock-item">
                  <div className="alert-item-content">
                    <strong>{asset.assetName}</strong>
                    <p>Current: {asset.quantity} | Min: {asset.minQuantity}</p>
                    <span className="lab-location">{asset.labLocation}</span>
                  </div>
                  <span className="alert-badge">Low Stock</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warranty Expiring Alert */}
        <div className="alert-box">
          <h3>⏰ Warranty Expiring Soon (Within 30 Days)</h3>
          {warrantyAssets.length === 0 ? (
            <p className="no-alerts">No warranty expiring soon</p>
          ) : (
            <div className="alert-list">
              {warrantyAssets.map((asset) => (
                <div key={asset._id} className="alert-item warranty-item">
                  <div className="alert-item-content">
                    <strong>{asset.assetName}</strong>
                    <p>Expiry: {new Date(asset.warrantyExpiryDate).toLocaleDateString()}</p>
                    <span className="lab-location">{asset.labLocation}</span>
                  </div>
                  <span className="alert-badge">Expiring</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calibration Due Alert */}
        <div className="alert-box">
          <h3>📊 Calibration Due Soon (Within 7 Days)</h3>
          {calibrationDueAlerts.length === 0 ? (
            <p className="no-alerts">No calibration due soon</p>
          ) : (
            <div className="alert-list">
              {calibrationDueAlerts.map((record) => {
                const assetName = record.assetName || record.asset?.assetName || 'Unknown';
                const labLocation = record.labLocation || record.asset?.labLocation || 'Unknown';
                const dueDate = record.nextCalibrationDue ? new Date(record.nextCalibrationDue).toLocaleDateString() : 'N/A';
                
                return (
                  <div key={record._id} className="alert-item calibration-item">
                    <div className="alert-item-content">
                      <strong>{assetName}</strong>
                      <p>Due: {dueDate}</p>
                      <span className="lab-location">{labLocation}</span>
                    </div>
                    <span className="alert-badge">Calibration Due</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue Maintenance Alert */}
        <div className="alert-box">
          <h3>⚠️ Maintenance Overdue</h3>
          {overdueAlerts.length === 0 ? (
            <p className="no-alerts">No overdue maintenance</p>
          ) : (
            <div className="alert-list">
              {overdueAlerts.map((record) => {
                const assetName = record.assetName || 'Unknown';
                const checklistSummary = record.checklist && record.checklist.length > 0 
                  ? `${record.checklist.length} checklist items` 
                  : 'No checklist';
                const labLocation = record.labLocation || 'Unknown';
                const priority = (record.priorityLevel || 'medium').toUpperCase();
                
                return (
                  <div key={record._id} className="alert-item overdue-item">
                    <div className="alert-item-content">
                      <strong>{assetName}</strong>
                      <p>{checklistSummary}</p>
                      <span className="lab-location">{labLocation}</span>
                    </div>
                    <span className="alert-badge overdue-badge">{priority} PRIORITY</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Maintenance Cycle Due Soon */}
        <div className="alert-box">
          <h3>🔄 Maintenance Due Soon (Within 7 Days)</h3>
          {maintenanceDueSoon.length === 0 ? (
            <p className="no-alerts">No maintenance due soon</p>
          ) : (
            <div className="alert-list">
              {maintenanceDueSoon.map((asset) => {
                const dueDate = asset.nextMaintenanceDue ? new Date(asset.nextMaintenanceDue).toLocaleDateString() : 'N/A';
                const cycleInfo = asset.maintenanceCycleDays ? `Every ${asset.maintenanceCycleDays} days` : 'Custom cycle';
                
                return (
                  <div key={asset._id} className="alert-item maintenance-cycle-item">
                    <div className="alert-item-content">
                      <strong>{asset.assetName}</strong>
                      <p>Due: {dueDate} | {cycleInfo}</p>
                      <span className="lab-location">{asset.labLocation}</span>
                    </div>
                    <span className="alert-badge">Service Due</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue Maintenance Cycles */}
        <div className="alert-box">
          <h3>🚨 Maintenance Overdue (Past Due Date)</h3>
          {overdueMaintenanceAssets.length === 0 ? (
            <p className="no-alerts">No overdue maintenance cycles</p>
          ) : (
            <div className="alert-list">
              {overdueMaintenanceAssets.map((asset) => {
                const dueDate = asset.nextMaintenanceDue ? new Date(asset.nextMaintenanceDue).toLocaleDateString() : 'N/A';
                const cycleInfo = asset.maintenanceCycleDays ? `Every ${asset.maintenanceCycleDays} days` : 'Custom cycle';
                
                return (
                  <div key={asset._id} className="alert-item overdue-cycle-item">
                    <div className="alert-item-content">
                      <strong>{asset.assetName}</strong>
                      <p>Was Due: {dueDate} | {cycleInfo}</p>
                      <span className="lab-location">{asset.labLocation}</span>
                    </div>
                    <span className="alert-badge critical-badge">OVERDUE</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
