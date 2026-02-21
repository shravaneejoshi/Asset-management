import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/assets';

// Helper function to get authorization headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

const assetService = {
  // Add new asset
  addAsset: (assetData) => {
    return axios.post(API_BASE_URL, assetData, getAuthHeaders());
  },

  // Get all assets with filters
  getAllAssets: (filters = {}) => {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.labLocation) params.append('labLocation', filters.labLocation);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    return axios.get(url, getAuthHeaders());
  },

  // Get single asset
  getAssetById: (id) => {
    return axios.get(`${API_BASE_URL}/${id}`, getAuthHeaders());
  },

  // Update asset
  updateAsset: (id, assetData) => {
    return axios.put(`${API_BASE_URL}/${id}`, assetData, getAuthHeaders());
  },

  // Update asset status
  updateAssetStatus: (id, status) => {
    return axios.patch(`${API_BASE_URL}/${id}/status`, { status }, getAuthHeaders());
  },

  // Update asset quantity
  updateAssetQuantity: (id, quantityChange) => {
    return axios.patch(`${API_BASE_URL}/${id}/quantity`, { quantityChange }, getAuthHeaders());
  },

  // Get low stock assets
  getLowStockAssets: () => {
    return axios.get(`${API_BASE_URL}/alerts/low-stock`, getAuthHeaders());
  },

  // Get warranty expiring assets
  getWarrantyExpiringAssets: () => {
    return axios.get(`${API_BASE_URL}/alerts/warranty-expiring`, getAuthHeaders());
  },

  // Get maintenance due soon
  getMaintenanceDueSoon: () => {
    return axios.get(`${API_BASE_URL}/alerts/maintenance-due-soon`, getAuthHeaders());
  },

  // Get overdue maintenance assets
  getOverdueMaintenanceAssets: () => {
    return axios.get(`${API_BASE_URL}/alerts/maintenance-overdue`, getAuthHeaders());
  },

  // Set maintenance cycle for an asset
  setMaintenanceCycle: (id, maintenanceCycleDays) => {
    return axios.patch(`${API_BASE_URL}/${id}/maintenance-cycle`, { maintenanceCycleDays }, getAuthHeaders());
  },

  // Get assets by location
  getAssetsByLocation: (labLocation) => {
    return axios.get(`${API_BASE_URL}/location/${labLocation}`, getAuthHeaders());
  },

  // Get dashboard stats
  getDashboardStats: () => {
    return axios.get(`${API_BASE_URL}/stats/dashboard`, getAuthHeaders());
  },

  // Delete asset
  deleteAsset: (id) => {
    return axios.delete(`${API_BASE_URL}/${id}`);
  }
};

export default assetService;
