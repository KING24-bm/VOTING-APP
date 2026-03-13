import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';


// Lazy load pages
const HomePage = lazy(() => import('./components/HomePage'));
const TeacherLanding = lazy(() => import('./components/TeacherLanding'));
const TeacherLogin = lazy(() => import('./components/TeacherLogin'));
const TeacherSignup = lazy(() => import('./components/TeacherSignup'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const StudentVerification = lazy(() => import('./components/StudentVerification'));
const StudentVoting = lazy(() => import('./components/StudentVoting'));

// Protected Route for Teacher Dashboard
function ProtectedTeacherRoute() {
  const { teacher, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!teacher || !teacher.is_approved) {
    return <Navigate to="/TeacherLanding" replace />;
  }

  if (teacher.is_super_admin) {
    return <Navigate to="/SuperAdminDashboard" replace />;
  }

  return <TeacherDashboard />;
}

// Protected Route for Super Admin Dashboard
function ProtectedSuperAdminRoute() {
  const { teacher, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!teacher || !teacher.is_approved || !isSuperAdmin) {
    return <Navigate to="/TeacherLanding" replace />;
  }

  return <SuperAdminDashboard />;
}

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Main landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Teacher routes */}
        <Route path="/TeacherLanding" element={<TeacherLanding />} />
        <Route path="/TeacherLogin" element={<TeacherLogin />} />
        <Route path="/TeacherSignup" element={<TeacherSignup />} />
        <Route path="/TeacherDashboard" element={<ProtectedTeacherRoute />} />
        <Route path="/SuperAdminDashboard" element={<ProtectedSuperAdminRoute />} />

        {/* Student routes */}
        <Route path="/StudentVerification" element={<StudentVerification />} />
        <Route path="/StudentVoting" element={<StudentVoting />} />

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;

