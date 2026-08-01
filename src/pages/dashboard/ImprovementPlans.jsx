import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import apiClient from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

export default function ImprovementPlans() {
  const { improvementPlans, assignedCareerPaths, handleCompleteTask } = useOutletContext()
  const { user } = useAuthStore()

  // Generate AI Plan Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [selectedPathId, setSelectedPathId] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleGenerateAiPlan = async (e) => {
    e.preventDefault()
    if (!selectedPathId || !user?.id) return
    setGenerating(true)
    try {
      await apiClient.post('/api/ImprovementPlans/generate-ai', {
        teamMemberId: user.id,
        targetCareerPathId: selectedPathId
      }, { showSuccessToast: true })
      
      setIsAiModalOpen(false)
      toast.success('AI Improvement Plan generated successfully!')
      window.location.reload()
    } catch {
      toast.error('Failed to generate AI Improvement Plan.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="dash-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="dash-section-title">AI Improvement Plans</h2>
          <p className="dashboard-section-subtitle">Custom AI-generated learning roadmaps & task checklists based on your assessment results.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAiModalOpen(true)}>
          ✨ Generate AI Plan
        </button>
      </div>

      {/* Plans List */}
      {Array.isArray(improvementPlans) && improvementPlans.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {improvementPlans.map((plan) => {
            const tasks = plan.tasks || []
            const completedCount = tasks.filter(t => t.isCompleted).length
            const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

            return (
              <div key={plan.id} className="solid-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
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
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
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
                        <span key={idx} className="badge-pill" style={{ backgroundColor: 'var(--matrix-bg-alt)', fontSize: '0.8rem', border: '1px solid var(--matrix-border)', color: '#fff' }}>
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
                            onChange={() => !task.isCompleted && handleCompleteTask && handleCompleteTask(task.id)}
                            disabled={task.isCompleted}
                            style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--matrix-primary)', cursor: task.isCompleted ? 'default' : 'pointer' }}
                          />
                          <span style={{ 
                            textDecoration: task.isCompleted ? 'line-through' : 'none', 
                            color: task.isCompleted ? 'var(--matrix-text-muted)' : '#fff',
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
          })}
        </div>
      ) : (
        <div className="dash-section fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
          <div className="solid-card" style={{ textAlign: 'center', maxWidth: '440px', padding: '3rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0, 180, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--matrix-primary)' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>No Active Improvement Plans</h2>
            <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              Take a skill baseline test or trigger AI plan generation to create a customized improvement roadmap.
            </p>
            <button className="btn btn-primary" onClick={() => setIsAiModalOpen(true)} style={{ width: '100%' }}>
              ✨ Generate AI Improvement Plan
            </button>
          </div>
        </div>
      )}

      {/* Generate AI Improvement Plan Modal */}
      {isAiModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAiModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <button className="modal-close" onClick={() => setIsAiModalOpen(false)}>&times;</button>
            
            <h3 className="modal-title" style={{ marginBottom: '0.75rem' }}>✨ Generate AI Improvement Plan</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
              Select your target career path. Our AI engine will analyze your skill gap assessments and generate a tailored growth plan.
            </p>
            
            <form onSubmit={handleGenerateAiPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Target Career Path</label>
                <select 
                  className="form-input" 
                  value={selectedPathId} 
                  onChange={e => setSelectedPathId(e.target.value)} 
                  required
                >
                  <option value="">-- Select a Career Path --</option>
                  {(assignedCareerPaths || []).map(path => (
                    <option key={path.id || path.careerPathId} value={path.careerPathId || path.id}>
                      {path.title}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={generating}>
                {generating ? 'Analyzing & Generating Plan...' : 'Generate Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
