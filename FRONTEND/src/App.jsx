import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import ProtectedRoute from './Components/Common/ProtectedRoute.jsx';
import LandingPage from './Pages/LandingPage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import RegisterPage from './Pages/RegisterPage.jsx';
import OTPPage from './Pages/OTPPage.jsx';
import ForgotPasswordPage from './Pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './Pages/ResetPasswordPage.jsx';
import DashboardPage from './Pages/DashboardPage.jsx';
import UploadPage from './Pages/UploadPage.jsx';
import PaperDetailPage from './Pages/PaperDetailPage.jsx';
import AboutPage from './Pages/AboutPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/papers/:id"
            element={
              <ProtectedRoute>
                <PaperDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
