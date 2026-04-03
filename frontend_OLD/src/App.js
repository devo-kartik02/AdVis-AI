import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout'; // Optional wrapper if you want it globally

// Import Pages
import Login from './pages/Login';
import Upload from './pages/Upload';
import Report from './pages/Report';
import Compare from './pages/Compare';

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) return <div className="text-white">Loading...</div>;
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Navigate to="/upload" />} />
        
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        } />
        
        <Route path="/report/:id" element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        } />

        <Route path="/compare" element={
          <ProtectedRoute>
            <Compare />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;