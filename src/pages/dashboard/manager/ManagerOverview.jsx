import { useState, useEffect } from 'react'
import apiClient from '../../../api/axios'
import useAuthStore from '../../../store/authStore'
import PageHeader from '../../../components/common/PageHeader'
import ManagerStatGrid from '../../../components/manager-overview/ManagerStatGrid'

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
      } catch {
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
      <PageHeader 
        title="Organization Overview" 
        subtitle="High-level metrics for your team"
      />

      <ManagerStatGrid analytics={analytics} />
      
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
