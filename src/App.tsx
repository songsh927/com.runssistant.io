import { Route, Routes } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import RequireAuth from '@/components/auth/RequireAuth'
import CoachPage from '@/pages/CoachPage'
import GoalPage from '@/pages/GoalPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RunDetailPage from '@/pages/RunDetailPage'
import RunListPage from '@/pages/RunListPage'
import RunLogPage from '@/pages/RunLogPage'
import SettingsPage from '@/pages/SettingsPage'
import SignupPage from '@/pages/SignupPage'

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="runs" element={<RunListPage />} />
          <Route path="runs/new" element={<RunLogPage />} />
          <Route path="runs/:id" element={<RunDetailPage />} />
          <Route path="goals" element={<GoalPage />} />
          <Route path="coach" element={<CoachPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
