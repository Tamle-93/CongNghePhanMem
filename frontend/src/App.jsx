import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Loading Component - hiển thị khi đang load page
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Đang tải...</p>
    </div>
  </div>
);

// ⚡ Lazy load pages - chỉ load khi người dùng truy cập
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ConferencesPage = lazy(() => import('./pages/ConferencesPage'));
const ConferenceDetail = lazy(() => import('./pages/ConferenceDetail'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Author Pages
const AuthorPapersPage = lazy(() => import('./pages/author/AuthorPapersPage'));
const PaperSubmitPage = lazy(() => import('./pages/author/PaperSubmitPage'));
const AuthorPaperDetail = lazy(() => import('./pages/author/AuthorPaperDetail'));
const AuthorRevision = lazy(() => import('./pages/author/AuthorRevision'));
const AuthorCameraReady = lazy(() => import('./pages/author/AuthorCameraReady'));
const AuthorReviewResults = lazy(() => import('./pages/author/AuthorReviewResults'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUserManagement = lazy(() => import('./pages/admin/AdminUserManagement'));
const AdminAddUser = lazy(() => import('./pages/admin/AdminAddUser'));
const AdminUserEdit = lazy(() => import('./pages/admin/AdminUserEdit'));
const AdminUserImport = lazy(() => import('./pages/admin/AdminUserImport'));
const AdminCreateConference = lazy(() => import('./pages/admin/AdminCreateConference'));
const AdminConferenceManagement = lazy(() => import('./pages/admin/AdminConferenceManagement'));
const AdminConferenceEdit = lazy(() => import('./pages/admin/AdminConferenceEdit'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminSystemConfig = lazy(() => import('./pages/admin/AdminSystemConfig'));

// Chair Pages
const ChairHomePage = lazy(() => import('./pages/chair/ChairHomePage'));
const ChairPapersPage = lazy(() => import('./pages/chair/ChairPapersPage'));
const ChairTracksPage = lazy(() => import('./pages/chair/ChairTracksPage'));
const ChairReviewersPage = lazy(() => import('./pages/chair/ChairReviewersPage'));
const ChairAssignments = lazy(() => import('./pages/chair/ChairAssignments'));
const ChairDecision = lazy(() => import('./pages/chair/ChairDecision'));
const ChairDecisions = lazy(() => import('./pages/chair/ChairDecisions'));
const ChairTimeline = lazy(() => import('./pages/chair/ChairTimeline'));
const ChairAddMilestone = lazy(() => import('./pages/chair/ChairAddMilestone'));
const ChairTimelineEdit = lazy(() => import('./pages/chair/ChairTimelineEdit'));
const ChairPaperDetail = lazy(() => import('./pages/chair/ChairPaperDetail'));

// Reviewer Pages
const ReviewerDashboard = lazy(() => import('./pages/reviewer/ReviewerDashboard'));
const ReviewerAssignments = lazy(() => import('./pages/reviewer/ReviewerAssignments'));
const ReviewerPapers = lazy(() => import('./pages/reviewer/ReviewerPapers'));
const ReviewerReviews = lazy(() => import('./pages/reviewer/ReviewerReviews'));
const ReviewerPaperDetail = lazy(() => import('./pages/reviewer/ReviewerPaperDetail'));
const ReviewerReviewForm = lazy(() => import('./pages/reviewer/ReviewerReviewForm'));
const ReviewerBidding = lazy(() => import('./pages/reviewer/ReviewerBidding'));
const ReviewerHistory = lazy(() => import('./pages/reviewer/ReviewerHistory'));

// Static Pages
const AboutPage = lazy(() => import('./pages/static/AboutPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/static/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/static/TermsOfServicePage'));
const CopyrightPage = lazy(() => import('./pages/static/CopyrightPage'));
const ResearchEthicsPage = lazy(() => import('./pages/static/ResearchEthicsPage'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Static Pages (Public) */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/copyright" element={<CopyrightPage />} />
            <Route path="/ethics" element={<ResearchEthicsPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Home */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/conferences" element={<ConferencesPage />} />
                <Route path="/conferences/:id" element={<ConferenceDetail />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                {/* Author Routes */}
                <Route path="/author/papers" element={<AuthorPapersPage />} />
                <Route path="/author/papers/:id" element={<AuthorPaperDetail />} />
                <Route path="/author/papers/:id/revision" element={<AuthorRevision />} />
                <Route path="/author/papers/:id/camera-ready" element={<AuthorCameraReady />} />
                <Route path="/author/papers/:id/reviews" element={<AuthorReviewResults />} />
                <Route path="/author/submit" element={<PaperSubmitPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUserManagement />} />
                <Route path="/admin/users/add" element={<AdminAddUser />} />
                <Route path="/admin/users/import" element={<AdminUserImport />} />
                <Route path="/admin/users/:id/edit" element={<AdminUserEdit />} />
                <Route path="/admin/conferences" element={<AdminConferenceManagement />} />
                <Route path="/admin/conferences/create" element={<AdminCreateConference />} />
                <Route path="/admin/conferences/:id/edit" element={<AdminConferenceEdit />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                <Route path="/admin/system-config" element={<AdminSystemConfig />} />
                
                {/* Chair Routes */}
                <Route path="/chair" element={<ChairHomePage />} />
                <Route path="/chair/papers" element={<ChairPapersPage />} />
                <Route path="/chair/papers/:id" element={<ChairPaperDetail />} />
                <Route path="/chair/papers/:id/assign" element={<ChairAssignments />} />
                <Route path="/chair/papers/:id/decision" element={<ChairDecision />} />
                <Route path="/chair/decisions" element={<ChairDecisions />} />
                <Route path="/chair/tracks" element={<ChairTracksPage />} />
                <Route path="/chair/reviewers" element={<ChairReviewersPage />} />
                <Route path="/chair/timeline" element={<ChairTimeline />} />
                <Route path="/chair/timeline/add" element={<ChairAddMilestone />} />
                <Route path="/chair/timeline/:id/edit" element={<ChairTimelineEdit />} />
                
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
