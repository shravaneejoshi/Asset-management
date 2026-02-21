import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LabAdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/labAdmin/pending-users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPendingUsers(response.data);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApproval = async (userId, approve) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/labAdmin/approve-reject/${userId}`,
        { approve },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPendingUsers(pendingUsers.filter((user) => user._id !== userId));
      alert(approve ? 'User approved successfully!' : 'User rejected successfully!');
    } catch (error) {
      alert('Error processing request');
    }
  };

  return (
    <div>
      <h2>Lab Admin Dashboard</h2>

      <div>
        <h3>Pending User Approvals</h3>
        {pendingUsers.length > 0 ? (
          <ul>
            {pendingUsers.map((user) => (
              <li key={user._id}>
                {user.name} ({user.role})
                <button onClick={() => handleApproval(user._id, true)}>Approve</button>
                <button onClick={() => handleApproval(user._id, false)}>Reject</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending approval requests.</p>
        )}
      </div>
    </div>
  );
};

export default LabAdminDashboard;