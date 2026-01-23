// Frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
//import LoginSystem from './components/LoginSystem';

// Author Pages
import AuthorDashboard from './pages/author/AuthorDashboard';
import SubmitPaperPage from './pages/author/SubmitPaperPage';
import PaperDetailPage from './pages/author/PaperDetailPage';
import CameraReadyPage from './pages/author/CameraReadyPage';

// Reviewer Pages
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';
import ReviewPaperPage from './pages/reviewer/ReviewPaperPage';

// Chair Pages
import ChairDashboard from './pages/chair/ChairDashboard';
import ChairPapersPage from './pages/chair/ChairPapersPage';
import ChairAssignmentsPage from './pages/chair/ChairAssignmentsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminConferencesPage from './pages/admin/AdminConferencesPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

// Settings
import SettingsPage from './pages/settings/SettingsPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/auth/login" element={<LoginPage />} /> 
          <Route path="/" element={<Navigate to="/auth/login" replace />} /> 
          <Route path="*" element={<div>Not Found</div>} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* Author routes */}
            <Route path="/author/dashboard" element={<AuthorDashboard />} />
            <Route path="/author/submit" element={<SubmitPaperPage />} />
            <Route path="/author/paper/:id" element={<PaperDetailPage />} />
            <Route path="/author/camera-ready/:id" element={<CameraReadyPage />} />

            {/* Reviewer routes */}
            <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
            <Route path="/reviewer/review/:assignmentId" element={<ReviewPaperPage />} />

            {/* Chair routes */}
            <Route path="/chair/dashboard" element={<ChairDashboard />} />
            <Route path="/chair/papers" element={<ChairPapersPage />} />
            <Route path="/chair/assignments" element={<ChairAssignmentsPage />} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/conferences" element={<AdminConferencesPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} /> */
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

// import React from 'react';
// import LoginSystem from './components/LoginSystem';
// import AuthorDashboard from './pages/author/AuthorDashboard';
// function App() {
//   return (
//     <div className="App">
//       <LoginSystem />
//     </div>
//   );
// }

// export default App;