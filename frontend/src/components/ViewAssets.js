import React, { useState, useEffect } from 'react';
import assetService from '../services/assetService';
import MaintenanceForm from './MaintenanceForm';
import MaintenanceHistory from './MaintenanceHistory';
import '../styles/ViewAssets.css';

const ViewAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectingAsset, setSelectingAsset] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    labLocation: '',
    category: '',
    status: ''
  });

  const [categories, setCategories] = useState([]);
  const [labLocations, setLabLocations] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await assetService.getDashboardStats();
      setCategories(response.data.data.categories || []);
      setLabLocations(response.data.data.labLocations || []);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchAssets = async (filterData = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await assetService.getAllAssets(filterData);
      setAssets(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchAssets(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      labLocation: '',
      category: '',
      status: ''
    };
    setFilters(resetFilters);
    fetchAssets(resetFilters);
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetService.deleteAsset(id);
        setAssets(assets.filter(asset => asset._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete asset');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await assetService.updateAssetStatus(id, newStatus);
      setAssets(assets.map(asset => asset._id === id ? response.data.data : asset));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const toggleAssetDetails = (asset) => {
    setSelectingAsset(selectingAsset?._id === asset._id ? null : asset);
  };

  const isWarrantyExpiringSoon = (warrantyDate) => {
    if (!warrantyDate) return false;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiry = new Date(warrantyDate);
    return expiry <= thirtyDaysFromNow && expiry >= today;
  };

  return (
    <div className="view-assets-container">
      <h2>Asset Inventory</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="search">Search (Name / Serial Number)</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search assets..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="labLocation">Lab Location</label>
            <select
              id="labLocation"
              name="labLocation"
              value={filters.labLocation}
              onChange={handleFilterChange}
            >
              <option value="">All Locations</option>
              {labLocations.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>
        </div>

        <button onClick={handleResetFilters} className="btn btn-secondary">
          Reset Filters
        </button>
      </div>

      {/* Assets Table */}
      {loading ? (
        <div className="loading">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="no-assets">No assets found</div>
      ) : (
        <div className="assets-table-responsive">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Serial Number</th>
                <th>Lab Location</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <React.Fragment key={asset._id}>
                  <tr className={asset.isLowStock ? 'low-stock' : ''}>
                    <td>
                      <strong>{asset.assetName}</strong>
                      {asset.isWarrantyExpiring && (
                        <span className="warning-badge">Warranty Expiring</span>
                      )}
                    </td>
                    <td>{asset.category}</td>
                    <td>{asset.assetType}</td>
                    <td>{asset.serialNumber || '-'}</td>
                    <td>{asset.labLocation}</td>
                    <td>
                      <select
                        value={asset.status}
                        onChange={(e) => handleStatusChange(asset._id, e.target.value)}
                        className={`status-select status-${asset.status}`}
                      >
                        <option value="available">Available</option>
                        <option value="in_use">In Use</option>
                        <option value="under_maintenance">Maintenance</option>
                        <option value="disposed">Disposed</option>
                      </select>
                    </td>
                    <td>{asset.condition}</td>
                    <td>{asset.quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => toggleAssetDetails(asset)}
                      >
                        View/Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAsset(asset._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  
                  {selectingAsset?._id === asset._id && (
                    <tr className="details-row">
                      <td colSpan="9">
                        <AssetDetails asset={asset} onClose={() => setSelectingAsset(null)} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AssetDetails = ({ asset, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(asset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceUpdated, setMaintenanceUpdated] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await assetService.updateAsset(asset._id, formData);
      setSuccess('Asset updated successfully!');
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asset-details">
      <div className="details-header">
        <h3>Asset Details</h3>
        <button onClick={onClose} className="btn btn-sm btn-secondary">Close</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="details-grid">
        <div className="detail-group">
          <label>Brand</label>
          {isEditing ? (
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
            />
          ) : (
            <span>{formData.brand || '-'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Model</label>
          {isEditing ? (
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
            />
          ) : (
            <span>{formData.model || '-'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Purchase Date</label>
          {isEditing ? (
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate?.split('T')[0] || ''}
              onChange={handleInputChange}
            />
          ) : (
            <span>{formData.purchaseDate ? new Date(formData.purchaseDate).toLocaleDateString() : '-'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Purchase Cost</label>
          {isEditing ? (
            <input
              type="number"
              name="purchaseCost"
              value={formData.purchaseCost}
              onChange={handleInputChange}
              step="0.01"
            />
          ) : (
            <span>{formData.purchaseCost ? `$${formData.purchaseCost.toFixed(2)}` : '-'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Warranty Expiry</label>
          {isEditing ? (
            <input
              type="date"
              name="warrantyExpiryDate"
              value={formData.warrantyExpiryDate?.split('T')[0] || ''}
              onChange={handleInputChange}
            />
          ) : (
            <span>{formData.warrantyExpiryDate ? new Date(formData.warrantyExpiryDate).toLocaleDateString() : '-'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Supplier</label>
          {isEditing ? (
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
            />
          ) : (
            <span>{formData.supplier || '-'}</span>
          )}
        </div>

        <div className="detail-group">
          <label>Invoice Number</label>
          {isEditing ? (
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
            />
          ) : (
            <span>{formData.invoiceNumber || '-'}</span>
          )}
        </div>

        {formData.invoiceImage && !isEditing && (
          <div className="detail-group">
            <label>Invoice Image</label>
            <div className="invoice-image-display">
              <img 
                src={formData.invoiceImage} 
                alt="Invoice" 
                onClick={() => window.open(formData.invoiceImage)}
                title="Click to view full size"
              />
            </div>
          </div>
        )}

        <div className="detail-group">
          <label>Min Quantity (Stock Alert)</label>
          {isEditing ? (
            <input
              type="number"
              name="minQuantity"
              value={formData.minQuantity}
              onChange={handleInputChange}
            />
          ) : (
            <span>{formData.minQuantity}</span>
          )}
        </div>

        {formData.assetType === 'non-consumable' && (
          <>
            <div className="detail-group">
              <label>🔄 Maintenance Cycle (Days)</label>
              {isEditing ? (
                <input
                  type="number"
                  name="maintenanceCycleDays"
                  value={formData.maintenanceCycleDays || ''}
                  onChange={handleInputChange}
                  min="30"
                  placeholder="Set maintenance frequency (min 30 days)"
                />
              ) : (
                <span>{formData.maintenanceCycleDays ? `Every ${formData.maintenanceCycleDays} days` : '-'}</span>
              )}
            </div>

            <div className="detail-group">
              <label>Last Maintenance Date</label>
              <span>{formData.lastMaintenanceDate ? new Date(formData.lastMaintenanceDate).toLocaleDateString() : 'Not yet serviced'}</span>
            </div>

            <div className="detail-group">
              <label>Next Maintenance Due</label>
              <span className={formData.nextMaintenanceDue ? (new Date(formData.nextMaintenanceDue) < new Date() ? 'overdue' : '') : ''}>
                {formData.nextMaintenanceDue ? new Date(formData.nextMaintenanceDue).toLocaleDateString() : 'Not scheduled'}
              </span>
            </div>
          </>
        )}

        <div className="detail-group full-width">
          <label>Notes</label>
          {isEditing ? (
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            />
          ) : (
            <span>{formData.notes || '-'}</span>
          )}
        </div>
      </div>

      <div className="detail-actions">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              Edit Asset
            </button>
            {asset.status !== 'disposed' && (
              <button
                onClick={() => setShowMaintenanceForm(true)}
                className="btn btn-warning"
              >
                Report Issue / Maintenance
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Maintenance History */}
      <MaintenanceHistory assetId={asset._id} key={maintenanceUpdated} />

      {/* Maintenance Form Modal */}
      {showMaintenanceForm && (
        <MaintenanceForm
          assetId={asset._id}
          onSuccess={() => {
            setShowMaintenanceForm(false);
            setMaintenanceUpdated(!maintenanceUpdated);
            setSuccess('Maintenance request created successfully!');
          }}
          onCancel={() => setShowMaintenanceForm(false)}
        />
      )}
    </div>
  );
};

export default ViewAssets;
