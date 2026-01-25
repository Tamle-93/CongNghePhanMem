import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ConferencesPage from './pages/ConferencesPage';
import GuidePage from './pages/GuidePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Author Pages
import AuthorPapersPage from './pages/author/AuthorPapersPage';
import PaperSubmitPage from './pages/author/PaperSubmitPage';
import AuthorPaperDetail from './pages/author/AuthorPaperDetail';
import AuthorRevision from './pages/author/AuthorRevision';
import AuthorReviewResults from './pages/author/AuthorReviewResults';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminAddUser from './pages/admin/AdminAddUser';
import AdminCreateConference from './pages/admin/AdminCreateConference';
import AdminConferenceManagement from './pages/admin/AdminConferenceManagement';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSystemConfig from './pages/admin/AdminSystemConfig';

// Chair Pages
import ChairHomePage from './pages/chair/ChairHomePage';
import ChairPapersPage from './pages/chair/ChairPapersPage';
import ChairTracksPage from './pages/chair/ChairTracksPage';
import ChairReviewersPage from './pages/chair/ChairReviewersPage';
import ChairAssignments from './pages/chair/ChairAssignments';
import ChairDecision from './pages/chair/ChairDecision';
import ChairTimeline from './pages/chair/ChairTimeline';
import ChairAddMilestone from './pages/chair/ChairAddMilestone';

// Reviewer Pages
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';
import ReviewerAssignments from './pages/reviewer/ReviewerAssignments';
import ReviewerPapers from './pages/reviewer/ReviewerPapers';
import ReviewerReviews from './pages/reviewer/ReviewerReviews';
import ReviewerPaperDetail from './pages/reviewer/ReviewerPaperDetail';
import ReviewerReviewForm from './pages/reviewer/ReviewerReviewForm';
import ReviewerBidding from './pages/reviewer/ReviewerBidding';
import ReviewerHistory from './pages/reviewer/ReviewerHistory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Home */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/conferences" element={<ConferencesPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Author Routes */}
              <Route path="/author/papers" element={<AuthorPapersPage />} />
              <Route path="/author/papers/:id" element={<AuthorPaperDetail />} />
              <Route path="/author/papers/:id/revision" element={<AuthorRevision />} />
              <Route path="/author/papers/:id/reviews" element={<AuthorReviewResults />} />
              <Route path="/author/submit" element={<PaperSubmitPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/users/add" element={<AdminAddUser />} />
              <Route path="/admin/conferences" element={<AdminConferenceManagement />} />
              <Route path="/admin/conferences/create" element={<AdminCreateConference />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/system-config" element={<AdminSystemConfig />} />
              
              {/* Chair Routes */}
              <Route path="/chair" element={<ChairHomePage />} />
              <Route path="/chair/papers" element={<ChairPapersPage />} />
              <Route path="/chair/papers/:id/assign" element={<ChairAssignments />} />
              <Route path="/chair/papers/:id/decision" element={<ChairDecision />} />
              <Route path="/chair/tracks" element={<ChairTracksPage />} />
              <Route path="/chair/reviewers" element={<ChairReviewersPage />} />
              <Route path="/chair/timeline" element={<ChairTimeline />} />
              <Route path="/chair/timeline/add" element={<ChairAddMilestone />} />
              
              {/* Reviewer Routes */}
              <Route path="/reviewer" element={<ReviewerDashboard />} />
              <Route path="/reviewer/assignments" element={<ReviewerAssignments />} />
              <Route path="/reviewer/papers" element={<ReviewerPapers />} />
              <Route path="/reviewer/papers/:id" element={<ReviewerPaperDetail />} />
              <Route path="/reviewer/papers/:id/review" element={<ReviewerReviewForm />} />
              <Route path="/reviewer/reviews" element={<ReviewerReviews />} />
              <Route path="/reviewer/bidding" element={<ReviewerBidding />} />
              <Route path="/reviewer/history" element={<ReviewerHistory />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
