import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TechnicianProfile.css';

const TechnicianProfile = ({ user, onSkillsUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    skills: user?.skills || []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const skillOptions = [
    { value: 'printer_repair', label: 'Printer Repair' },
    { value: 'computer', label: 'Computer' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'mechanical', label: 'Mechanical' },
    { value: 'calibration', label: 'Calibration' },
    { value: 'civil', label: 'Civil' }
  ];

  const handleSkillChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.skills.length === 0) {
      setError('Please select at least one skill');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Updating skills:', formData.skills);
      const response = await axios.patch(
        'http://localhost:8000/api/auth/update-skills',
        { skills: formData.skills },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Skills update response:', response.data);

      if (response.data.success) {
        setMessage('Skills updated successfully!');
        const updatedUser = {
          ...user,
          skills: formData.skills
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (onSkillsUpdate) {
          onSkillsUpdate(updatedUser);
        }
      }
    } catch (err) {
      console.error('Error updating skills:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Error updating skills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="technician-profile">
      <div className="profile-card">
        <h2>Technician Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Your Skills * (Select at least one)</label>
            <div className="skills-grid">
              {skillOptions.map(skill => (
                <div key={skill.value} className="skill-card">
                  <input
                    type="checkbox"
                    id={skill.value}
                    checked={formData.skills.includes(skill.value)}
                    onChange={() => handleSkillChange(skill.value)}
                  />
                  <label htmlFor={skill.value}>{skill.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="skill-summary">
            <p><strong>Selected Skills ({formData.skills.length}):</strong></p>
            {formData.skills.length > 0 ? (
              <div className="selected-skills">
                {formData.skills.map(skill => {
                  const skillLabel = skillOptions.find(s => s.value === skill)?.label;
                  return (
                    <span key={skill} className="skill-badge">
                      {skillLabel}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="no-skills">No skills selected</p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Skills'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TechnicianProfile;
