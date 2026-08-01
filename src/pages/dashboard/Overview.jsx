import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import apiClient from '../../api/axios'
import { toast } from 'react-hot-toast'

export default function Overview() {
  const { 
    allSkills, 
    assignedCareerPaths, 
    improvementPlans, 
    badges, 
    proficiencyColor,
    handleCompleteTask 
  } = useOutletContext()
  
  const navigate = useNavigate()
  const [quickCheckModalOpen, setQuickCheckModalOpen] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [startingCheck, setStartingCheck] = useState(false)

  // Derived Statistics
  const totalSkills = Array.isArray(allSkills) ? allSkills.length : 0
  const userAssignedSkills = Array.isArray(allSkills) ? allSkills.filter(s => s.isAssigned || s.proficiencyLevel) : []
  const masteredSkills = userAssignedSkills.filter(s => s.isFullyMastered || s.proficiencyLevel === 'Expert').length
  
  const levelCounts = userAssignedSkills.reduce((acc, skill) => {
    const lvl = skill.proficiencyLevel || 'Novice'
    acc[lvl] = (acc[lvl] || 0) + 1
    return acc
  }, {})

  const totalPoints = userAssignedSkills.length * 100 + (badges?.length || 0) * 250

  const handleStartQuickCheck = async (e) => {
    e.preventDefault()
    if (!selectedSkillId) return
    setStartingCheck(true)
    try {
      const res = await apiClient.post('/api/Assessments/start', { assignedSkillId: selectedSkillId })
      toast.success('Assessment session initialized!')
      setQuickCheckModalOpen(false)
      navigate('/dashboard/assessments', { state: { assessment: res } })
    } catch (err) {
      toast.error('Failed to start assessment.')
    } finally {
      setStartingCheck(false)
    }
  }

  return (
    <div className="dash-overview-container fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Hero Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(18, 78, 120, 0.12) 0%, rgba(215, 78, 9, 0.08) 100%)',
        border: '1px solid var(--matrix-border)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 20px rgba(18, 78, 120, 0.08)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--matrix-text-primary)' }}>
            Elevate Your Skill Matrix 🚀
          </h2>
          <p style={{ margin: 0, color: 'var(--matrix-text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
            Track your skill masteries, complete target career path milestones, and earn points as you level up.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setQuickCheckModalOpen(true)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
              <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Quick Skill Check
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard/skills')}>
            Explore Skills
          </button>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{userAssignedSkills.length}</span>
          <span className="dash-stat-label">Assigned Skills ({masteredSkills} Mastered)</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{Array.isArray(assignedCareerPaths) ? assignedCareerPaths.length : 0}</span>
          <span className="dash-stat-label">Active Career Paths</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{Array.isArray(improvementPlans) ? improvementPlans.length : 0}</span>
          <span className="dash-stat-label">Active Growth Plans</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value dash-stat-accent">{totalPoints} XP</span>
          <span className="dash-stat-label">{Array.isArray(badges) ? badges.length : 0} Badges Earned</span>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="dash-overview-grid">
        {/* Left Column */}
        <div className="dash-col">
          
          {/* Active Career Paths Widget */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Career Path Milestones</h3>
              <button onClick={() => navigate('/dashboard/careers')}>View All</button>
            </div>
            <div className="dash-widget-body">
              {Array.isArray(assignedCareerPaths) && assignedCareerPaths.length > 0 ? (
                <div className="dash-compact-list">
                  {assignedCareerPaths.map((cp) => (
                    <div key={cp.id || cp.careerPathId} className="dash-compact-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="dash-item-title" style={{ fontSize: '1rem' }}>{cp.title}</span>
                          <span className="dash-item-subtitle">{cp.description || 'Assigned Target Path'}</span>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => navigate('/dashboard/careers')}>
                          Continue
                        </button>
                      </div>
                      <div className="dash-compact-progress">
                        <div className="dash-progress-text">
                          <span>Track Completion</span>
                          <span>{cp.progressPercentage || 0}%</span>
                        </div>
                        <div className="dash-progress-bar-container">
                          <div className="dash-progress-bar">
                            <div className="dash-progress-fill" style={{ width: `${cp.progressPercentage || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">
                  <p>No active career paths assigned yet.</p>
                  <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/dashboard/careers')}>Browse Paths</button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Badges & Recognition */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Badges & Achievements</h3>
            </div>
            <div className="dash-widget-body">
              {Array.isArray(badges) && badges.length > 0 ? (
                <div className="dash-badges-row">
                  {badges.map(b => (
                    <div key={b.id || b.badgeId} className="dash-badge-item" title={`${b.name} - ${b.description || ''}`}>
                      <div className="dash-badge-icon">
                        {b.iconUrl ? <img src={b.iconUrl} alt={b.name} /> : '🏅'}
                      </div>
                      <span className="dash-badge-name">{b.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">Complete skill baselines to unlock your first badge!</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="dash-col">
          
          {/* Skill Distribution */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Skill Proficiency Breakdown</h3>
              <button onClick={() => navigate('/dashboard/skills')}>Manage Skills</button>
            </div>
            <div className="dash-widget-body">
              {userAssignedSkills.length > 0 ? (
                <div className="dash-skill-bars">
                  {Object.entries(levelCounts).map(([lvl, count]) => (
                    <div key={lvl} className="dash-skill-bar-row">
                      <div className="dash-sb-labels">
                        <span style={{ fontWeight: 600 }}>{lvl}</span>
                        <span style={{ color: 'var(--matrix-text-muted)' }}>{count} {count === 1 ? 'Skill' : 'Skills'} ({Math.round((count / userAssignedSkills.length) * 100)}%)</span>
                      </div>
                      <div className="dash-progress-bar-container">
                        <div className="dash-progress-bar">
                          <div 
                            className="dash-progress-fill" 
                            style={{ 
                              width: `${(count / userAssignedSkills.length) * 100}%`, 
                              backgroundColor: proficiencyColor ? proficiencyColor(lvl) : 'var(--matrix-primary)' 
                            }}>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">Self-assign or ask your manager to assign skills to build your matrix.</div>
              )}
            </div>
          </div>

          {/* Pending Improvement Tasks */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Pending Growth Tasks</h3>
              <button onClick={() => navigate('/dashboard/plans')}>View All</button>
            </div>
            <div className="dash-widget-body">
              {Array.isArray(improvementPlans) && improvementPlans.length > 0 ? (
                <div className="dash-compact-list">
                  {improvementPlans.flatMap(p => (p.tasks || []).map(t => ({ ...t, planTitle: p.skillName }))).filter(t => !t.isCompleted).slice(0, 4).map(task => (
                    <div key={task.id} className="dash-compact-item plan-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="dash-item-title" style={{ display: 'block' }}>{task.title || task.description}</span>
                        <span className="dash-item-subtitle">{task.planTitle || 'Target Skill'} Focus</span>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleCompleteTask && handleCompleteTask(task.id)}>
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">No pending improvement tasks. All caught up!</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Quick Skill Check Modal */}
      {quickCheckModalOpen && (
        <div className="modal-overlay" onClick={() => setQuickCheckModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <button className="modal-close" onClick={() => setQuickCheckModalOpen(false)}>&times;</button>
            <h3 className="modal-title" style={{ marginBottom: '1rem' }}>Initialize Quick Skill Check</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
              Select one of your assigned skills to take a quick 3-question evaluation test.
            </p>
            <form onSubmit={handleStartQuickCheck} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Target Skill</label>
                <select className="form-input" value={selectedSkillId} onChange={e => setSelectedSkillId(e.target.value)} required>
                  <option value="">-- Select a Skill --</option>
                  {allSkills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category || 'General'})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={startingCheck}>
                {startingCheck ? 'Initializing...' : 'Start Assessment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
