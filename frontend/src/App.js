import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './components/Dashboard';
import AddAsset from './components/AddAsset';
import ViewAssets from './components/ViewAssets';
import StockControl from './components/StockControl';
import LabAssistantDashboard from './components/LabAssistantDashboard';
import LabTechnicianDashboard from './components/LabTechnicianDashboard';
import TechnicianProfile from './components/TechnicianProfile';
import Signup from './components/Signup';
import Login from './components/Login';
import authService from './services/authService';
import LabAdminSignup from './pages/LabAdminSignup';
import LabAdminDashboard from './pages/LabAdminDashboard';
import LabAdminLogin from './pages/LabAdminLogin';

import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, userRole, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const loggedInUser = authService.getCurrentUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const isLabAdmin = user?.role === 'lab_admin';
  const isLabTechnician = user?.role === 'lab_technician';

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="App">
        {!isLoggedIn ? (
          <Routes>
            <Route path="/signup" element={<Signup onSignupSuccess={handleSignupSuccess} />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/lab-admin/signup" element={<LabAdminSignup />} />
            <Route path="/lab-admin/dashboard" element={<LabAdminDashboard />} />
            <Route path="/lab-admin/login" element={<LabAdminLogin />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <>
            <nav className="navbar">
              <div className="nav-container">
                <div className="logo">
                  <h1>Asset Management System</h1>
                  <p>{isLabAdmin ? 'Lab Admin Portal' : isLabTechnician ? 'Lab Technician Portal' : 'Lab Assistant Portal'}</p>
                </div>

                <ul className="nav-menu">
                  <li>
                    <Link
                      to="/"
                      className={`nav-link ${activeTab === 'issues-dashboard' ? 'active' : ''}`}
                      onClick={() => setActiveTab('issues-dashboard')}
                    >
                      {isLabTechnician ? 'Technician Dashboard' : 'Issue Dashboard'}
                    </Link>
                  </li>

                  {!isLabTechnician && (
                    <>
                      <li>
                        <Link
                          to="/dashboard"
                          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                          onClick={() => setActiveTab('dashboard')}
                        >
                          Asset Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/add-asset"
                          className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
                          onClick={() => setActiveTab('add')}
                        >
                          Add Asset
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/assets"
                          className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                          onClick={() => setActiveTab('view')}
                        >
                          View Assets
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/maintenance"
                          className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`}
                          onClick={() => setActiveTab('maintenance')}
                        >
                          Maintenance
                        </Link>
                      </li>
                    </>
                  )}

                  {isLabTechnician && (
                    <li>
                      <Link
                        to="/profile"
                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                      >
                        Profile
                      </Link>
                    </li>
                  )}
                </ul>

                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </nav>

            <main className="main-content">
              <Routes>
                {/* Default Route - based on role */}
                <Route 
                  path="/" 
                  element={
                    isLoggedIn && user?.role === 'lab_technician' ? (
                      <ProtectedRoute 
                        isLoggedIn={isLoggedIn} 
                        requiredRole="lab_technician"
                        userRole={user?.role}
                      >
                        <LabTechnicianDashboard user={user} />
                      </ProtectedRoute>
                    ) : (
                      <ProtectedRoute 
                        isLoggedIn={isLoggedIn} 
                        requiredRole="lab_assistant"
                        userRole={user?.role}
                      >
                        <LabAssistantDashboard user={user} />
                      </ProtectedRoute>
                    )
                  } 
                />

                {/* Lab Assistant Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute 
                      isLoggedIn={isLoggedIn} 
                      requiredRole="lab_assistant"
                      userRole={user?.role}
                    >
                      <Dashboard user={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/add-asset" 
                  element={
                    <ProtectedRoute 
                      isLoggedIn={isLoggedIn} 
                      requiredRole="lab_assistant"
                      userRole={user?.role}
                    >
                      <AddAsset user={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/assets" 
                  element={
                    <ProtectedRoute 
                      isLoggedIn={isLoggedIn} 
                      requiredRole="lab_assistant"
                      userRole={user?.role}
                    >
                      <ViewAssets user={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/maintenance" 
                  element={
                    <ProtectedRoute 
                      isLoggedIn={isLoggedIn} 
                      requiredRole="lab_assistant"
                      userRole={user?.role}
                    >
                      <StockControl user={user} />
                    </ProtectedRoute>
                  } 
                />

                {/* Lab Technician Routes */}
                <Route 
                  path="/technician-dashboard" 
                  element={
                    <ProtectedRoute 
                      isLoggedIn={isLoggedIn} 
                      requiredRole="lab_technician"
                      userRole={user?.role}
                    >
                      <LabTechnicianDashboard user={user} />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute 
                      isLoggedIn={isLoggedIn} 
                      requiredRole="lab_technician"
                      userRole={user?.role}
                    >
                      <TechnicianProfile user={user} onSkillsUpdate={setUser} />
                    </ProtectedRoute>
                  } 
                />

                <Route path="/lab-admin/signup" element={<LabAdminSignup />} />
                <Route path="/lab-admin/dashboard" element={<LabAdminDashboard />} />
                <Route path="/lab-admin/login" element={<LabAdminLogin />} />

                <Route path="/lab-admin/dashboard" element={<LabAdminDashboard />} />

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>

            <footer className="footer">
              <p>&copy; 2026 Asset Management System. All rights reserved.</p>
            </footer>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
