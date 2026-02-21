import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import assetService from '../services/assetService';
import '../styles/AddAsset.css';


const AddAsset = ({ onAssetAdded }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    assetName: '',
    category: '',
    assetType: 'non-consumable',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    minQuantity: 0,
    labLocation: '',
    purchaseDate: '',
    purchaseCost: '',
    warrantyExpiryDate: '',
    status: 'available',
    condition: 'good',
    supplier: '',
    invoiceNumber: '',
    invoiceImage: '',
    maintenanceCycleMonths: null,
    maintenanceCycleYears: null,
    notes: ''
  });

  const [invoiceImagePreview, setInvoiceImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          invoiceImage: reader.result
        });
        setInvoiceImagePreview(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      invoiceImage: ''
    });
    setInvoiceImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await assetService.addAsset(formData);
      
      // Show toast notification
      toast.success('Asset added successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      // Call parent callback
      if (onAssetAdded) {
        onAssetAdded(response.data.data);
      }

      // Redirect to view assets page after 1 second
      setTimeout(() => {
        navigate('/assets');
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add asset';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-asset-container">
      <h2>Add New Asset</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="asset-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="assetName">Asset Name *</label>
            <input
              type="text"
              id="assetName"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              required
              placeholder="e.g., Oscilloscope"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="e.g., Electronics"
              />
            </div>

            <div className="form-group">
              <label htmlFor="assetType">Asset Type *</label>
              <select
                id="assetType"
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                required
              >
                <option value="non-consumable">Non-Consumable</option>
                <option value="consumable">Consumable</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Agilent"
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., DSO-X 2002A"
              />
            </div>
          </div>

          {formData.assetType === 'non-consumable' && (
            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g., SN123456"
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Inventory Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="minQuantity">Min Quantity (Low Stock Alert)</label>
              <input
                type="number"
                id="minQuantity"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="labLocation">Lab Location *</label>
            <input
              type="text"
              id="labLocation"
              name="labLocation"
              value={formData.labLocation}
              onChange={handleChange}
              required
              placeholder="e.g., ECE Lab 1"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Purchase & Warranty Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseCost">Purchase Cost</label>
              <input
                type="number"
                id="purchaseCost"
                name="purchaseCost"
                value={formData.purchaseCost}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="warrantyExpiryDate">Warranty Expiry Date</label>
            <input
              type="date"
              id="warrantyExpiryDate"
              name="warrantyExpiryDate"
              value={formData.warrantyExpiryDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="supplier">Supplier</label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g., Supplier Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="invoiceNumber">Invoice Number</label>
              <input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleChange}
                placeholder="e.g., INV-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="invoiceImage">Invoice Image</label>
              <input
                type="file"
                id="invoiceImage"
                accept="image/*"
                onChange={handleImageChange}
                placeholder="Select invoice image"
              />
              <small className="help-text">Max size: 5MB (JPG, PNG, etc.)</small>
            </div>
          </div>

          {/* Invoice Image Preview */}
          {invoiceImagePreview && (
            <div className="image-preview-container">
              <h4>Invoice Image Preview</h4>
              <div className="image-preview">
                <img src={invoiceImagePreview} alt="Invoice" />
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Status & Condition</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the asset"
              rows="4"
            />
          </div>
        </div>

        {formData.assetType === 'non-consumable' && (
          <div className="form-section">
            <h3>🔄 Maintenance Cycle (Optional)</h3>
            <p className="section-hint">Set how often this equipment needs servicing or calibration</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maintenanceCycleMonths">
                  Months
                </label>
                <input
                  type="number"
                  id="maintenanceCycleMonths"
                  name="maintenanceCycleMonths"
                  value={formData.maintenanceCycleMonths || ''}
                  onChange={handleChange}
                  placeholder="e.g., 3"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="maintenanceCycleYears">
                  Years
                </label>
                <input
                  type="number"
                  id="maintenanceCycleYears"
                  name="maintenanceCycleYears"
                  value={formData.maintenanceCycleYears || ''}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  min="0"
                />
              </div>
            </div>
            <small className="help-text">Enter maintenance cycle as months and/or years. E.g., 6 months OR 1 year OR 1 year and 6 months</small>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding Asset...' : 'Add Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAsset;
