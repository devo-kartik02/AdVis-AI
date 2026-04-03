import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 1. Import the AuthProvider from the new 'context' folder
import { AuthProvider } from './context/AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* 2. Wrap the entire App in AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);