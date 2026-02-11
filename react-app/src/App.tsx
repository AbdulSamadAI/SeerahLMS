import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { VideoLibrary } from './pages/videos/VideoLibrary';
import { UserProfile } from './pages/profile/UserProfile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAttendanceMarker } from './pages/admin/AdminAttendanceMarker';
import { AdminVideoManager } from './pages/admin/AdminVideoManager';
import { AdminManualQuiz } from './pages/admin/AdminManualQuiz';
import { AdminChallengeManager } from './pages/admin/AdminChallengeManager';
import { QuizList } from './pages/dashboard/QuizList';
import { QuizTaker } from './pages/dashboard/QuizTaker';
import { QuizResult } from './pages/dashboard/QuizResult';
import { StudentChallengeView } from './pages/dashboard/StudentChallengeView';
import { StudentAttendanceView } from './pages/dashboard/StudentAttendanceView';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import React from 'react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || (profile.role !== 'Admin' && profile.role !== 'Instructor')) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

import { NotificationProvider } from './components/auth/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Student Routes */}
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/videos" element={<ProtectedRoute><Layout><VideoLibrary /></Layout></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><Layout><QuizList /></Layout></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute><Layout><QuizTaker /></Layout></ProtectedRoute>} />
            <Route path="/quiz/:id/result" element={<ProtectedRoute><Layout><QuizResult /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Layout><StudentChallengeView /></Layout></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Layout><StudentAttendanceView /></Layout></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/attendance" element={<AdminAttendanceMarker />} />
              <Route path="/admin/manual-quiz" element={<AdminManualQuiz />} />
              <Route path="/admin/videos" element={<AdminVideoManager />} />
              <Route path="/admin/challenges" element={<AdminChallengeManager />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
