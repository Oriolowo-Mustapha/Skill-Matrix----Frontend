import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import apiClient from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import ImprovementPlanCard from '../../components/improvement/ImprovementPlanCard'
import CreatePlanModal from '../../components/improvement/CreatePlanModal'

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
          {improvementPlans.map((plan) => (
            <ImprovementPlanCard 
              key={plan.id} 
              plan={plan} 
              onCompleteTask={handleCompleteTask} 
            />
          ))}
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

      {/* Generate AI Improvement Plan Modal Component */}
      <CreatePlanModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSubmit={handleGenerateAiPlan}
        selectedPathId={selectedPathId}
        setSelectedPathId={setSelectedPathId}
        assignedCareerPaths={assignedCareerPaths}
        generating={generating}
      />

    </div>
  )
}
