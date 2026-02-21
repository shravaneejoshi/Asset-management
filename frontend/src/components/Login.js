import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('lab_assistant');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role
      });
      console.log('Login response:', response.data);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        console.log('Login successful, user data:', response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
        
        if (role === 'lab_assistant') {
          navigate('/dashboard');
        } else {
          navigate('/technician-dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login to Asset Management System</h1>
        
        <div className="role-selector">
          <label>Login as:</label>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${role === 'lab_assistant' ? 'active' : ''}`}
              onClick={() => {
                setRole('lab_assistant');
                setError('');
              }}
            >
              Lab Assistant
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'lab_technician' ? 'active' : ''}`}
              onClick={() => {
                setRole('lab_technician');
                setError('');
              }}
            >
              Lab Technician
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'lab_admin' ? 'active' : ''}`}
              onClick={() => {
                setRole('lab_admin');
                setError('');
              }}
            >
              Lab Admin
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
