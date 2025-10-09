import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RoleSelection } from '@/components/auth/RoleSelection';
import { SignIn } from '@/components/auth/SignIn';
import { ProfileForm } from '@/components/applicant/ProfileForm';
import { AssessmentDashboard } from '@/components/applicant/AssessmentDashboard';
import { GameWrapper } from '@/components/applicant/GameWrapper';
import { Results } from '@/components/applicant/Results';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Messaging } from '@/components/admin/Messaging';
import { Chatbot } from '@/components/chatbot/Chatbot';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/auth/:role" element={<SignIn />} />

        {/* Applicant Routes */}
        <Route
          path="/applicant/profile"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <ProfileForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/assessment"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <AssessmentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/game/:gameType"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <GameWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/results"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <Results />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messaging"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Messaging />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Chatbot - only show for applicants */}
      {user && user.role === 'applicant' && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
