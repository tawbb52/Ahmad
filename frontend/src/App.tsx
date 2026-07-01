import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const handleLogin = (token: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Developer Certificates & UDID System</h1>
          {isAuthenticated && (
            <div className="user-info">
              <span>Role: {userRole}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={isAuthenticated ? <div>Dashboard</div> : <Navigate to="/login" />} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/dashboard" element={isAuthenticated ? <div>Dashboard</div> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
