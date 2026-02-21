import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

const authService = {
  signup: async (userData) => {
    const response = await axios.post(`${API_URL}/signup`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password, role) => {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
      role
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  getTechniciansBySkill: async (skill) => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/technicians/by-skill`, {
      params: { skill },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  }
};

export default authService;
