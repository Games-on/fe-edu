import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Đảm bảo đường dẫn này đúng
import { QueryClient, QueryClientProvider } from 'react-query'; // Import React Query
import { Toaster } from 'react-hot-toast'; // Import Toaster từ react-hot-toast

// Layout Components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import SimpleErrorBoundary from './components/SimpleErrorBoundary';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel'; // Component AdminPanel
// import TeamManagement from './components/admin/TeamManagement'; // Import TeamManagement

import HelpCenter from './pages/HelpCenter';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';


// Khởi tạo QueryClient
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đảm bảo user và user.role tồn tại trước khi so sánh
  if (user && user.role !== 'ADMIN' && user.role !== 'ORGANIZER') {
    // Nếu không phải admin hoặc organizer, chuyển hướng về dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isLoading: authLoading } = useAuth(); // Đổi tên biến để tránh trùng lặp nếu có isLoading khác

  // Hiển thị loading spinner nếu AuthContext đang tải
  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    // Bọc toàn bộ ứng dụng bằng QueryClientProvider và Toaster
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" reverseOrder={false} /> {/* Cấu hình Toaster */}
      <SimpleErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="tournaments/:id" element={<TournamentDetailPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<NewsDetailPage />} />

            {/* Các route cho trang tĩnh */}
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/about" element={<AboutUs />} />
          </Route>

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes (Authenticated Users) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout /> {/* Layout cho các trang được bảo vệ */}
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Routes (Admin/Organizer Roles) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout /> {/* Layout cho Admin Panel */}
              </AdminRoute>
            }
          >
            <Route index element={<AdminPanel />} /> {/* Trang chính Admin Panel */}
            {/* <Route path="teams" element={<TeamManagement />} /> Thêm route cho Team Management */}
            {/* Thêm các route admin khác ở đây */}
          </Route>

          {/* Catch all route (redirect to home or a 404 page) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SimpleErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;