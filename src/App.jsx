import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './assets/components/Login';
import Signup from './assets/components/Signup';
import Profile from './assets/components/Profile';
import Experience from './assets/components/Experience';
import ForgotPassword from './assets/components/ForgotPassword';
import ResetPassword from './assets/components/ResetPassword';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <Router>
      <div className='h-screen'>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route 
            path="/profile" 
            element={token ? <Experience setToken={setToken} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

