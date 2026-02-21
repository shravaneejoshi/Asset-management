import React, { useState, useEffect } from 'react';
import assetService from '../services/assetService';
import '../styles/StockControl.css';

const StockControl = () => {
  const [consumables, setConsumables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchConsumables();
  }, []);

  const fetchConsumables = async () => {
    try {
      setLoading(true);
      const response = await assetService.getAllAssets({ });
      const consumableAssets = response.data.data.filter(asset => asset.assetType === 'consumable');
      setConsumables(consumableAssets);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch consumables');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (assetId, changeAmount) => {
    setUpdatingId(assetId);
    try {
      const response = await assetService.updateAssetQuantity(assetId, changeAmount);
      
      // Update local state
      setConsumables(consumables.map(asset =>
        asset._id === assetId
          ? {
              ...asset,
              quantity: response.data.data.quantity,
              isLowStock: response.data.isLowStock
            }
          : asset
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredConsumables = consumables.filter(asset =>
    asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockConsumables = filteredConsumables.filter(asset => asset.isLowStock);

  if (loading) {
    return <div className="loading">Loading consumables...</div>;
  }

  return (
    <div className="stock-control-container">
      <h2>Stock Control (Consumables)</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search consumables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockConsumables.length > 0 && (
        <div className="alert alert-warning">
          <strong>⚠️ Warning:</strong> {lowStockConsumables.length} item(s) are running low on stock
        </div>
      )}

      {/* Consumables Table */}
      {filteredConsumables.length === 0 ? (
        <div className="no-assets">No consumables found</div>
      ) : (
        <div className="stock-table-responsive">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Lab Location</th>
                <th>Current Stock</th>
                <th>Min Stock Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsumables.map((consumable) => (
                <tr key={consumable._id} className={consumable.isLowStock ? 'low-stock-row' : ''}>
                  <td>
                    <strong>{consumable.assetName}</strong>
                    {consumable.isLowStock && (
                      <span className="stock-alert">LOW STOCK</span>
                    )}
                  </td>
                  <td>{consumable.category}</td>
                  <td>{consumable.labLocation}</td>
                  <td className="quantity-cell">
                    <span className={`quantity ${consumable.isLowStock ? 'critical' : ''}`}>
                      {consumable.quantity}
                    </span>
                  </td>
                  <td>{consumable.minQuantity}</td>
                  <td>
                    {consumable.isLowStock ? (
                      <span className="badge badge-danger">Critical Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td className="action-cell">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(consumable._id, -1)}
                        className="btn btn-sm btn-minus"
                        disabled={updatingId === consumable._id || consumable.quantity === 0}
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="quantity-display">{consumable.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(consumable._id, 1)}
                        className="btn btn-sm btn-plus"
                        disabled={updatingId === consumable._id}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    {updatingId === consumable._id && (
                      <span className="updating">Updating...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Statistics */}
      <div className="stock-stats">
        <div className="stat-item">
          <h4>Total Consumables</h4>
          <p>{filteredConsumables.length}</p>
        </div>
        <div className="stat-item">
          <h4>Low Stock Items</h4>
          <p className="stat-critical">{lowStockConsumables.length}</p>
        </div>
        <div className="stat-item">
          <h4>Total Units</h4>
          <p>{filteredConsumables.reduce((sum, c) => sum + c.quantity, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default StockControl;
