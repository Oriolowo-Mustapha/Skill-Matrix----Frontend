import { useOutletContext, useNavigate } from 'react-router-dom'

export default function Overview() {
  const { 
    allSkills, 
    assignedCareerPaths, 
    improvementPlans, 
    badges, 
    proficiencyColor 
  } = useOutletContext()
  
  const navigate = useNavigate()

  // Derived stats
  const totalSkills = Array.isArray(allSkills) ? allSkills.length : 0;
  const masteredSkills = Array.isArray(allSkills) ? allSkills.filter(s => s.isFullyMastered).length : 0;
  
  const levelCounts = Array.isArray(allSkills) ? allSkills.reduce((acc, skill) => {
    const lvl = skill.proficiencyLevel || 'Novice';
    acc[lvl] = (acc[lvl] || 0) + 1;
    return acc;
  }, {}) : {};

  return (
    <div className="dash-overview-container">
      {/* Top Stats Row */}
      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{totalSkills}</span>
          <span className="dash-stat-label">Total Skills ({masteredSkills} Mastered)</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{Array.isArray(assignedCareerPaths) ? assignedCareerPaths.length : 0}</span>
          <span className="dash-stat-label">Active Career Paths</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{Array.isArray(improvementPlans) ? improvementPlans.length : 0}</span>
          <span className="dash-stat-label">Improvement Plans</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value dash-stat-accent">{Array.isArray(badges) ? badges.length : 0}</span>
          <span className="dash-stat-label">Badges Earned</span>
        </div>
      </div>

      {/* Split Layout Grid */}
      <div className="dash-overview-grid">
        {/* Left Column */}
        <div className="dash-col">
          
          {/* Active Career Paths widget */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Career Path Progress</h3>
              <button onClick={() => navigate('/dashboard/careers')}>View All</button>
            </div>
            <div className="dash-widget-body">
              {Array.isArray(assignedCareerPaths) && assignedCareerPaths.length > 0 ? (
                <div className="dash-compact-list">
                  {assignedCareerPaths.slice(0, 3).map((cp) => (
                    <div key={cp.id} className="dash-compact-item">
                      <div className="dash-compact-info">
                        <span className="dash-item-title">{cp.title}</span>
                        <span className="dash-item-subtitle">{cp.trackName || 'General Track'}</span>
                      </div>
                      <div className="dash-compact-progress">
                        <div className="dash-progress-text">
                          <span>Progress</span>
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
                <div className="dash-empty-state">No active career paths.</div>
              )}
            </div>
          </div>

          {/* Recent Badges widget */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Recent Badges</h3>
            </div>
            <div className="dash-widget-body">
              {Array.isArray(badges) && badges.length > 0 ? (
                <div className="dash-badges-row">
                  {badges.slice(0, 4).map(b => (
                    <div key={b.id} className="dash-badge-item" title={`${b.name} - ${b.proficiencyLevel}`}>
                      <div className="dash-badge-icon">
                        {b.iconUrl ? <img src={b.iconUrl} alt={b.name} /> : '🏆'}
                      </div>
                      <span className="dash-badge-name">{b.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">No badges earned yet.</div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="dash-col">
          
          {/* Skill Breakdown widget */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Skill Distribution</h3>
              <button onClick={() => navigate('/dashboard/skills')}>View Skills</button>
            </div>
            <div className="dash-widget-body">
              {totalSkills > 0 ? (
                <div className="dash-skill-bars">
                  {Object.entries(levelCounts).sort((a,b) => b[1] - a[1]).map(([lvl, count]) => (
                    <div key={lvl} className="dash-skill-bar-row">
                      <div className="dash-sb-labels">
                        <span>{lvl}</span>
                        <span>{Math.round((count / totalSkills) * 100)}%</span>
                      </div>
                      <div className="dash-progress-bar-container">
                        <div className="dash-progress-bar">
                          <div 
                            className="dash-progress-fill" 
                            style={{ 
                              width: `${(count / totalSkills) * 100}%`, 
                              backgroundColor: proficiencyColor(lvl) 
                            }}>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">Assign skills to see your breakdown.</div>
              )}
            </div>
          </div>

          {/* Up Next / Improvement Plans widget */}
          <div className="dash-widget solid-card">
            <div className="dash-widget-header">
              <h3>Up Next</h3>
              <button onClick={() => navigate('/dashboard/plans')}>View Plans</button>
            </div>
            <div className="dash-widget-body">
              {Array.isArray(improvementPlans) && improvementPlans.length > 0 ? (
                <div className="dash-compact-list">
                  {improvementPlans.slice(0, 3).map(plan => (
                    <div key={plan.id} className="dash-compact-item plan-item">
                      <span className="dash-item-title">{plan.skillName} Focus</span>
                      <span className="dash-item-subtitle">{plan.tasks?.filter(t => !t.isCompleted).length || 0} tasks remaining</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-empty-state">No pending improvement tasks.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
