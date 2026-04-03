import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ProtectedRoute, AdminRoute, UserRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Report } from './pages/Report';
import { Comparison } from './pages/Comparison';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminInquiries } from './pages/AdminInquiries';
import { Analysis } from './pages/Analysis';
import { Subscription } from './pages/Subscription';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <UserRoute>
                <Dashboard />
              </UserRoute>
            }
          />
          <Route
            path="/report/:id"
            element={
              <UserRoute>
                <Report />
              </UserRoute>
            }
          />
          <Route
            path="/comparison"
            element={
              <UserRoute>
                <Comparison />
              </UserRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        <Route
          path="/admin/inquiries"
          element={
            <AdminRoute>
              <AdminInquiries />
            </AdminRoute>
          }
        />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <UserRoute>
                <Analysis />
              </UserRoute>
            }
          />

          <Route path="/subscription" element={<Subscription />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
