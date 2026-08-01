import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

// Dashboard sub-pages
import Overview from './pages/dashboard/Overview'
import Skills from './pages/dashboard/Skills'
import CareerPaths from './pages/dashboard/CareerPaths'
import ImprovementPlans from './pages/dashboard/ImprovementPlans'
import Assessments from './pages/dashboard/Assessments'
import Achievements from './pages/dashboard/Achievements'

// Manager sub-pages
import ManagerOverview from './pages/dashboard/manager/ManagerOverview'
import TeamManagement from './pages/dashboard/manager/TeamManagement'
import PathBuilder from './pages/dashboard/manager/PathBuilder'
import TeamMemberProfile from './pages/dashboard/manager/TeamMemberProfile'
import useAuthStore from './store/authStore'

function App() {
  const user = useAuthStore(state => state.user)
  const isManager = ['Manager', 'Admin', 'SuperAdmin'].includes(user?.role)
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={isManager ? <ManagerOverview /> : <Overview />} />
        <Route path="skills" element={<Skills />} />
        <Route path="careers" element={<CareerPaths />} />
        <Route path="plans" element={<ImprovementPlans />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="team" element={<TeamManagement />} />
        <Route path="team/:id" element={<TeamMemberProfile />} />
        <Route path="paths" element={<PathBuilder />} />
      </Route>
    </Routes>
  )
}

export default App
