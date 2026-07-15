import { useOutletContext } from 'react-router-dom'

export default function ImprovementPlans() {
  const { improvementPlans, handleCompleteTask } = useOutletContext()

  return (
    <div className="dash-section">
      <div className="dash-section-header">
        <h2 className="dash-section-title">Active Improvement Plans</h2>
      </div>
      {Array.isArray(improvementPlans) && improvementPlans.length > 0 ? (
        <div className="dash-plans-list">
          {improvementPlans.map((plan) => (
            <div key={plan.id} className="dash-plan-card solid-card">
              <div className="dash-plan-header">
                <h3 className="dash-plan-summary">{plan.generatedSummary || 'Improvement Plan'}</h3>
                <span className="dash-plan-date">{plan.dateGenerated ? new Date(plan.dateGenerated).toLocaleDateString() : ''}</span>
              </div>
              {plan.focusAreas && <p className="dash-plan-focus">Focus: {plan.focusAreas}</p>}
              {Array.isArray(plan.recommendedResources) && plan.recommendedResources.length > 0 && (
                <div className="dash-plan-resources">
                  <span className="dash-plan-resources-label">Resources:</span>
                  {plan.recommendedResources.map((res) => (
                    <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="dash-resource-link">
                      {res.title}
                      <span className="dash-resource-type">({res.type})</span>
                    </a>
                  ))}
                </div>
              )}
              {Array.isArray(plan.tasks) && plan.tasks.length > 0 && (
                <div className="dash-plan-tasks" style={{ marginTop: '1rem' }}>
                  <span className="dash-plan-resources-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Tasks:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {plan.tasks.map(task => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--matrix-bg)', borderRadius: '6px' }}>
                        <input 
                          type="checkbox" 
                          checked={task.isCompleted} 
                          onChange={() => !task.isCompleted && handleCompleteTask(task.id)}
                          disabled={task.isCompleted}
                          style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--matrix-primary)' }}
                        />
                        <span style={{ textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? 'var(--matrix-text-muted)' : 'var(--matrix-text-primary)' }}>
                          {task.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="dash-empty-state">
          <p>No active improvement plans.</p>
        </div>
      )}
    </div>
  )
}
