import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './assets/components/Login';
import Signup from './assets/components/Signup';
import Profile from './assets/components/Profile';
import Experience from './assets/components/Experience';
import ForgotPassword from './assets/components/ForgotPassword';
import ResetPassword from './assets/components/ResetPassword';
import AdminDashboard from './assets/components/AdminDashboard';
import { AUTH_API } from './Api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { data } = await AUTH_API.get('/profile');
          console.log('Profile response:', data); // Debug log
          setIsAdmin(data.isAdmin);
          localStorage.setItem('isAdmin', data.isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className='h-screen'>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/login" 
            element={<Login setToken={setToken} />} 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/profile" 
            element={token ? <Experience setToken={setToken} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={
              token && isAdmin ? (
                <AdminDashboard />
              ) : (
                <Navigate to={token ? "/profile" : "/login"} />
              )
            } 
          />
          <Route path="/" element={<Navigate to={isAdmin ? "/admin" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

