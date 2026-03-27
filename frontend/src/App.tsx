import { Navigate, Route, Routes } from 'react-router-dom';
import { AppFrame } from './components/AppFrame';
import { AuthGuard } from './components/AuthGuard';
import { CockpitPage } from './pages/CockpitPage';
import { ConfirmEmailPage } from './pages/auth/ConfirmEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { PlaygroundPage } from './pages/playground/PlaygroundPage';
import { QuizPlayerPage } from './pages/playground/QuizPlayerPage';
import { AiLabPage } from './pages/studio/AiLabPage';
import { ConsolePage } from './pages/studio/ConsolePage';
import { ExamWorkbenchPage } from './pages/studio/ExamWorkbenchPage';
import { ExamsPage } from './pages/studio/ExamsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/confirm-email" element={<ConfirmEmailPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<AppFrame />}>
          <Route path="/" element={<CockpitPage />} />
          <Route path="/studio/exams" element={<ExamsPage />} />
          <Route path="/studio/exams/:examId" element={<ExamWorkbenchPage />} />
          <Route path="/studio/ai" element={<AiLabPage />} />
          <Route path="/studio/console" element={<ConsolePage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/playground/exams/:examId/quizzes/:quizIndex" element={<QuizPlayerPage />} />
          <Route path="/me" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
