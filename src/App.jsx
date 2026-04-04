import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Redirect empty path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Redirect everything else to login or dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
