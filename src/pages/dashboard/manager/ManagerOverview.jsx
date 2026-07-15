import { useState, useEffect } from 'react'
import apiClient from '../../../api/axios'
import useAuthStore from '../../../store/authStore'

export default function ManagerOverview() {
  const { user } = useAuthStore()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await apiClient.get('/api/Analytics/my-organization')
        setAnalytics(res)
      } catch (err) {
        setError('Failed to load organization analytics.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-alert dashboard-alert-error">
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="dashboard-header-row" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="dashboard-section-title">Organization Overview</h2>
          <p className="dashboard-section-subtitle">High-level metrics for your team</p>
        </div>
      </div>

      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="dash-widget solid-card">
          <h3 className="widget-title">Total Members</h3>
          <div className="widget-value">{analytics?.totalMembers || 0}</div>
        </div>
        <div className="dash-widget solid-card">
          <h3 className="widget-title">Assessments Taken</h3>
          <div className="widget-value">{analytics?.activeAssessments || 0}</div>
        </div>
        <div className="dash-widget solid-card">
          <h3 className="widget-title">Avg Proficiency</h3>
          <div className="widget-value">{analytics?.averageProficiency || 0} <span style={{fontSize: '1rem', color: 'var(--matrix-text-muted)'}}>/ 4</span></div>
        </div>
        <div className="dash-widget solid-card">
          <h3 className="widget-title">Active Plans</h3>
          <div className="widget-value">{analytics?.activeImprovementPlans || 0}</div>
        </div>
      </div>
      
      <div className="solid-card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No activity yet</h4>
            <p>Once your team starts taking assessments, their activity will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
