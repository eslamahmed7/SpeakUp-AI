import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import DashboardPage from './components/dashboard/DashboardPage';
import LevelsPage from './components/levels/LevelsPage';
import LevelDetailPage from './components/levels/LevelDetailPage';
import LessonPage from './components/lesson/LessonPage';
import ConversationPage from './components/conversation/ConversationPage';
import PronunciationPage from './components/pronunciation/PronunciationPage';
import ShadowingPage from './components/pronunciation/ShadowingPage';
import VocabularyPage from './components/vocabulary/VocabularyPage';
import SentencesPage from './components/sentences/SentencesPage';
import RoleplayPage from './components/roleplay/RoleplayPage';
import ChallengePage from './components/challenge/ChallengePage';
import AchievementsPage from './components/achievements/AchievementsPage';
import ProfilePage from './components/profile/ProfilePage';
import AdminPage from './components/admin/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/levels" element={<LevelsPage />} />
        <Route path="/levels/:id" element={<LevelDetailPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/conversation" element={<ConversationPage />} />
        <Route path="/pronunciation" element={<PronunciationPage />} />
        <Route path="/shadowing" element={<ShadowingPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/sentences" element={<SentencesPage />} />
        <Route path="/roleplay" element={<RoleplayPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
