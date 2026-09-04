import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import AppShell from '@/components/layout/AppShell'
import RequireAuth from '@/components/auth/RequireAuth'
import { useAuthStore } from '@/stores/authStore'
import CoachPage from '@/pages/CoachPage'
import GoalPage from '@/pages/GoalPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import OnboardingPage from '@/pages/OnboardingPage'
import ProfileEditPage from '@/pages/ProfileEditPage'
import RunDetailPage from '@/pages/RunDetailPage'
import RunListPage from '@/pages/RunListPage'
import RunLogPage from '@/pages/RunLogPage'
import SettingsPage from '@/pages/SettingsPage'
import SignupPage from '@/pages/SignupPage'

function RequireOnboarding() {
  const user = useAuthStore((s) => s.user)
  if (user && !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route element={<RequireAuth />}>
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route element={<RequireOnboarding />}>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="runs" element={<RunListPage />} />
              <Route path="runs/new" element={<RunLogPage />} />
              <Route path="runs/:id" element={<RunDetailPage />} />
              <Route path="goals" element={<GoalPage />} />
              <Route path="coach" element={<CoachPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/profile" element={<ProfileEditPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
