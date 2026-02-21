import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get authorization headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

const maintenanceService = {
  // Create new maintenance request
  createMaintenance: async (maintenanceData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/maintenance`, maintenanceData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get all maintenance records
  getAllMaintenance: async (status = null, assetId = null) => {
    try {
      let url = `${API_BASE_URL}/maintenance`;
      const params = new URLSearchParams();

      if (status) params.append('status', status);
      if (assetId) params.append('assetId', assetId);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get maintenance logs for a specific asset
  getMaintenanceByAsset: async (assetId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/asset/${assetId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching asset maintenance:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get single maintenance record
  getMaintenanceById: async (maintenanceId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/${maintenanceId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance record:', error);
      throw error.response?.data || error.message;
    }
  },

  // Mark maintenance as completed
  completeMaintenance: async (maintenanceId, completionData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/maintenance/${maintenanceId}/complete`,
        completionData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error completing maintenance:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update maintenance status
  updateMaintenanceStatus: async (maintenanceId, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/maintenance/${maintenanceId}/status`,
        { status },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get calibration due alerts
  getCalibrationDueAlerts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/alerts/calibration-due`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching calibration alerts:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get overdue maintenance alerts
  getOverdueAlerts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/alerts/overdue`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue alerts:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get maintenance statistics
  getMaintenanceStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenance/stats`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
      throw error.response?.data || error.message;
    }
  },

  // Delete maintenance record
  deleteMaintenance: async (maintenanceId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/maintenance/${maintenanceId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default maintenanceService;
