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
import { Chatbot } from '@/components/chatbot/Chatbot';
import { ToastDemo } from '@/components/demo/ToastDemo';
import { Toaster } from 'sonner';

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
        <Route path="/demo/toast" element={<ToastDemo />} />

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
        <Toaster 
          position="top-center" 
          expand={false}
          richColors={false}
          closeButton
          toastOptions={{
            style: {
              background: 'linear-gradient(135deg, #8558ed 0%, #b18aff 100%)',
              border: '2px solid #8558ed',
              color: 'white',
              minHeight: '48px',
              maxHeight: '60px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
            },
            className: 'sonner-toast',
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
