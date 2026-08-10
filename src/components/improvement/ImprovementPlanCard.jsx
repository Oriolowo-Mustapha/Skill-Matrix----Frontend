export default function ImprovementPlanCard({ plan, onCompleteTask }) {
  const tasks = plan.tasks || []
  const completedCount = tasks.filter(t => t.isCompleted).length
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="solid-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-pill" style={{ backgroundColor: 'rgba(0,180,216,0.15)', color: 'var(--matrix-primary)', fontSize: '0.75rem' }}>
              {plan.isAiGenerated ? '🤖 AI Tailored' : 'Manager Assigned'}
            </span>
            {plan.dateGenerated && (
              <span style={{ fontSize: '0.8rem', color: 'var(--matrix-text-muted)' }}>
                Generated on {new Date(plan.dateGenerated).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--matrix-text-primary)' }}>
            {plan.generatedSummary || plan.skillName ? `${plan.skillName || 'Skill'} Focus Roadmap` : 'Custom Growth Roadmap'}
          </h3>
        </div>

        <div style={{ textAlign: 'right', minWidth: '140px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--matrix-primary)' }}>{progressPct}% Completed</span>
          <div className="dash-progress-bar-container" style={{ marginTop: '0.35rem' }}>
            <div className="dash-progress-bar" style={{ height: '6px' }}>
              <div className="dash-progress-fill" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      {plan.focusArea && (
        <div>
          <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Target Focus Areas
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {plan.focusArea.split(',').map((area, idx) => (
              <span key={idx} className="badge-pill" style={{ backgroundColor: 'var(--matrix-bg-alt)', fontSize: '0.8rem', border: '1px solid var(--matrix-border)', color: 'var(--matrix-text-primary)' }}>
                🎯 {area.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Resources */}
      {Array.isArray(plan.recommendedResources) && plan.recommendedResources.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recommended Resources
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {plan.recommendedResources.map((res) => (
              <a 
                key={res.id || res.url} 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  padding: '0.5rem 0.85rem', 
                  backgroundColor: 'var(--matrix-bg-alt)', 
                  borderRadius: '6px', 
                  border: '1px solid var(--matrix-border)', 
                  color: 'var(--matrix-primary)', 
                  textDecoration: 'none', 
                  fontSize: '0.85rem' 
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                <span>{res.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Task Checklist */}
      {Array.isArray(tasks) && tasks.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.85rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Action Tasks Checklist ({completedCount}/{tasks.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tasks.map(task => (
              <div 
                key={task.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.85rem', 
                  padding: '0.85rem 1rem', 
                  backgroundColor: task.isCompleted ? 'rgba(16,185,129,0.05)' : 'var(--matrix-bg-alt)', 
                  borderRadius: '8px', 
                  border: `1px solid ${task.isCompleted ? '#10b981' : 'var(--matrix-border)'}` 
                }}
              >
                <input 
                  type="checkbox" 
                  checked={task.isCompleted} 
                  onChange={() => !task.isCompleted && onCompleteTask && onCompleteTask(task.id)}
                  disabled={task.isCompleted}
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--matrix-primary)', cursor: task.isCompleted ? 'default' : 'pointer' }}
                />
                <span style={{ 
                  textDecoration: task.isCompleted ? 'line-through' : 'none', 
                  color: task.isCompleted ? 'var(--matrix-text-muted)' : 'var(--matrix-text-primary)',
                  fontSize: '0.9rem',
                  flex: 1
                }}>
                  {task.description || task.title}
                </span>
                {task.isCompleted && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
