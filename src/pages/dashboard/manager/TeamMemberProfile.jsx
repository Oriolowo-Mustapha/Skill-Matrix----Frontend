import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../../../api/axios'
import MemberOverviewDetail from '../../../components/team/MemberOverviewDetail'

export default function TeamMemberProfile() {
  const { id } = useParams()
  const [overviewData, setOverviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOverview = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get(`/api/Teams/members/${id}/overview`)
      // API wrapper pattern: res could be the data object or { data: { ... } }
      const payload = res?.data || res
      setOverviewData(payload)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load team member overview.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchOverview()
    }
  }, [id])

  if (loading) {
    return (
      <div className="dashboard-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.95rem' }}>Loading team member overview...</p>
      </div>
    )
  }

  if (error || !overviewData) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard/team" className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
            ← Back to Team Directory
          </Link>
        </div>
        <div className="solid-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--matrix-crimson)', fontSize: '1.25rem' }}>Overview Unavailable</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--matrix-text-muted)', fontSize: '0.95rem' }}>
            {error || 'Team member not found in your organization.'}
          </p>
          <button className="btn btn-primary" onClick={fetchOverview}>Retry Fetching Data</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Breadcrumb Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard/team" className="btn btn-secondary" style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
            <span>Back to Team Directory</span>
          </Link>
        </div>
      </div>

      {/* Main Team Member Overview Presentation */}
      <MemberOverviewDetail data={overviewData} />
    </div>
  )
}
