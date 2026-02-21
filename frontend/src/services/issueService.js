import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get authorization headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

const issueService = {
  // Create new issue
  createIssue: async (issueData) => {
    try {
      const response = await axios.post(`${API_URL}/issues`, issueData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error.response?.data || error;
    }
  },

  // Get all issues with filters
  getAllIssues: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/issues${queryParams ? '?' + queryParams : ''}`,
        getAuthHeaders()
      );
      return response.data; // Returns { success, count, data: [...] }
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error.response?.data || error;
    }
  },

  // Get single issue
  getIssueById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/issues/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error.response?.data || error;
    }
  },

  // Update issue status
  updateIssueStatus: async (id, statusData) => {
    try {
      const response = await axios.patch(`${API_URL}/issues/${id}/status`, statusData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error.response?.data || error;
    }
  },

  // Get issues by lab
  getIssuesByLab: async (labId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/issues/lab/${labId}${queryParams ? '?' + queryParams : ''}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching lab issues:', error);
      throw error.response?.data || error;
    }
  },

  // Close issue
  closeIssue: async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/issues/${id}/close`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error closing issue:', error);
      throw error.response?.data || error;
    }
  },

  // Get technician stats
  getTechnicianStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/issues/stats/technician-stats`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching technician stats:', error);
      throw error.response?.data || error;
    }
  },

  // Upload file attachment
  uploadAttachment: async (issueId, file) => {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const response = await axios.post(
              `${API_URL}/issues/${issueId}/upload`,
              {
                filename: `${Date.now()}_${file.name}`,
                originalName: file.name,
                data: reader.result,
                mimetype: file.type,
                size: file.size
              },
              getAuthHeaders()
            );
            resolve(response.data);
          } catch (error) {
            reject(error.response?.data || error);
          }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error.response?.data || error;
    }
  },

  // Download file attachment
  downloadAttachment: async (issueId, attachmentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/issues/${issueId}/attachment/${attachmentId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error.response?.data || error;
    }
  },

  // Delete file attachment
  deleteAttachment: async (issueId, attachmentId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/issues/${issueId}/attachment/${attachmentId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error.response?.data || error;
    }
  }
};

export default issueService;