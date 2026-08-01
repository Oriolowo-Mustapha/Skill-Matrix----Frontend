import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import apiClient from '../api/axios'

const getNavItems = (role) => {
  if (role === 'Manager' || role === 'Admin' || role === 'SuperAdmin') {
    return [
      { key: 'manager-overview', path: '/dashboard', label: 'Organization Analytics', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
      { key: 'team', path: '/dashboard/team', label: 'Team Directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { key: 'path-builder', path: '/dashboard/paths', label: 'Career Path Architect', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' }
    ]
  }
  return [
    { key: 'overview', path: '/dashboard', label: 'Overview', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
    { key: 'skills', path: '/dashboard/skills', label: 'My Skills', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { key: 'careers', path: '/dashboard/careers', label: 'Career Paths', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { key: 'assessments', path: '/dashboard/assessments', label: 'Assessment Arena & History', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { key: 'plans', path: '/dashboard/plans', label: 'Improvement Plans', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
    { key: 'achievements', path: '/dashboard/achievements', label: 'Achievements & Leaderboard', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  ]
}

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const navItems = getNavItems(user?.role)

  // Data stores
  const [allSkills, setAllSkills] = useState([])
  const [assignedCareerPaths, setAssignedCareerPaths] = useState([])
  const [improvementPlans, setImprovementPlans] = useState([])
  const [badges, setBadges] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')


  // Fetch dashboard data on mount
  useEffect(() => {
    async function loadDashboard() {
      setLoadingData(true)
      setError('')
      try {
        const isManager = ['Manager', 'Admin', 'SuperAdmin'].includes(user?.role)
        const isTeamMember = user?.role === 'Team_Members' || user?.role === 'TeamMember'
        const isNonManager = !isManager

        const careerPathEndpoint = isTeamMember 
          ? `/api/CareerPaths/assigned/team-member/${user.id}` 
          : `/api/CareerPaths/assigned/learner/${user.id}`

        const badgeEndpoint = isTeamMember 
          ? `/api/Badges/assigned/team-member/${user.id}` 
          : `/api/Badges/assigned/learner/${user.id}`

        const [skillsRes, assignedSkillsRes, plansRes, careersRes, badgesRes] = await Promise.allSettled([
          apiClient.get('/api/Skills'),
          isNonManager ? apiClient.get('/api/Skills/assigned') : Promise.resolve([]),
          isNonManager ? apiClient.get('/api/ImprovementPlans') : Promise.resolve([]),
          user?.id && isNonManager ? apiClient.get(careerPathEndpoint) : Promise.resolve([]),
          user?.id && isNonManager ? apiClient.get(badgeEndpoint) : Promise.resolve([]),
        ])

        if (skillsRes.status === 'fulfilled') {
          const globalSkills = skillsRes.value || []
          const userAssignedSkills = assignedSkillsRes.status === 'fulfilled' ? (assignedSkillsRes.value || []) : []
          
          const mergedSkills = globalSkills.map(skill => {
            const assignedData = userAssignedSkills.find(a => a.skillId === skill.id)
            if (assignedData) {
              return { ...skill, ...assignedData, id: skill.id } 
            }
            return skill
          })
          setAllSkills(mergedSkills)
        }

        if (plansRes.status === 'fulfilled') {
          setImprovementPlans(plansRes.value || [])
        }

        if (careersRes.status === 'fulfilled') {
          setAssignedCareerPaths(careersRes.value || [])
        }

        if (badgesRes.status === 'fulfilled') {
          setBadges(badgesRes.value || [])
        }
      } catch {
        setError('Failed to load dashboard data. Please check your connection.')
      } finally {
        setLoadingData(false)
      }
    }

    loadDashboard()
  }, [user?.id, user?.role])

  // Self-assign a skill
  const handleSelfAssign = async (skillId) => {
    try {
      await apiClient.post('/api/Skills/self-assign', { skillId }, { showSuccessToast: true })
      
      const [skillsRes, assignedSkillsRes] = await Promise.all([
        apiClient.get('/api/Skills'),
        apiClient.get('/api/Skills/assigned')
      ])
      
      const globalSkills = skillsRes || []
      const userAssignedSkills = assignedSkillsRes || []
      
      const mergedSkills = globalSkills.map(skill => {
        const assignedData = userAssignedSkills.find(a => a.skillId === skill.id)
        if (assignedData) {
          return { ...skill, ...assignedData, id: skill.id } // Keep global ID
        }
        return skill
      })
      setAllSkills(mergedSkills)
    } catch {
      setError('Failed to assign skill.')
    }
  }

  // Complete an improvement task
  const handleCompleteTask = async (taskId) => {
    try {
      await apiClient.post(`/api/ImprovementPlans/tasks/${taskId}/complete`, {}, { showSuccessToast: true })
      // Refresh plans
      const updated = await apiClient.get('/api/ImprovementPlans')
      setImprovementPlans(updated || [])
    } catch {
      setError('Failed to complete task.')
    }
  }

  // Get current date string
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  // Proficiency level badge color
  const proficiencyColor = (level) => {
    const map = {
      'Novice': '#F79824',
      'Beginner': '#FDCA40',
      'Intermediate': '#33A1FD',
      'Proficient': '#2176FF',
      'Expert': '#10b981',
    }
    return map[level] || 'var(--matrix-primary)'
  }



  return (
    <div className="dashboard-layout">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--matrix-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="6" height="6" rx="1" fill="var(--matrix-primary)"></rect>
            <rect x="15" y="3" width="6" height="6" rx="1"></rect>
            <rect x="9" y="15" width="6" height="6" rx="1"></rect>
            <path d="M9 6h6M6 9v6M18 9v6" stroke="var(--matrix-border-hover)" strokeWidth="1.5"></path>
          </svg>
          <span className="sidebar-brand-text">SkillMatrix</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/');
            return (
              <button
                key={item.key}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}></path>
                </svg>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.profilePicUrl 
                ? <img src={user.profilePicUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : <span>{user?.firstName?.charAt(0)?.toUpperCase() || user?.userName?.charAt(0)?.toUpperCase() || 'U'}</span>
              }
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.userName || 'User')}</span>
              <span className="sidebar-user-role">{user?.role || 'Learner'}</span>
            </div>
          </div>
          <button className="btn btn-secondary sidebar-logout" onClick={logout}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
          </button>
          <div className="topbar-greeting">
            <h1 className="topbar-title">
              {location.pathname === '/dashboard' || location.pathname === '/dashboard/' 
                ? `Welcome back, ${user?.firstName || user?.userName || 'User'}` 
                : navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </h1>
            <span className="topbar-date">{dateString}</span>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="dashboard-alert dashboard-alert-error">
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }}>&times;</button>
          </div>
        )}

        {/* Content Panels */}
        <div className="dashboard-content">
          {loadingData ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          ) : (
            <Outlet context={{ 
              allSkills, 
              assignedCareerPaths, 
              improvementPlans, 
              badges, 
              proficiencyColor,
              handleSelfAssign,
              handleCompleteTask
            }} />
          )}
        </div>
      </div>
    </div>
  )
}
