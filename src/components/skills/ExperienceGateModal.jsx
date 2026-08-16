import { useState } from 'react'
import Modal from '../common/Modal'
import apiClient from '../../api/axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ExperienceGateModal({
  isOpen,
  onClose,
  assignedSkill,
  onAssessmentStarted
}) {
  const navigate = useNavigate()
  const [selectedBranch, setSelectedBranch] = useState('experienced') // 'new' or 'experienced'
  const [claimedLevel, setClaimedLevel] = useState('Intermediate')
  const [loading, setLoading] = useState(false)

  if (!assignedSkill) return null

  const skillName = assignedSkill.name || assignedSkill.Name || 'Skill'
  const assignedSkillId = assignedSkill.id || assignedSkill.Id

  // Handle Branch 1: Beginner Starter Roadmap
  const handleGenerateStarterPlan = async () => {
    setLoading(true)
    try {
      const res = await apiClient.post('/api/Assessments/generate-starter-plan', {
        assignedSkillId: assignedSkillId
      })
      toast.success(`Starter Learning Roadmap created for ${skillName}! 🚀`)
      onClose()
      navigate('/dashboard/plans', { state: { starterPlan: res?.data || res } })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate starter learning plan.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Branch 2: Placement Assessment
  const handleStartPlacementAssessment = async () => {
    setLoading(true)
    try {
      const res = await apiClient.post('/api/Assessments/start', {
        assignedSkillId: assignedSkillId,
        claimedLevel: claimedLevel
      })
      toast.success(`Placement assessment started at ${claimedLevel} level! 🎯`)
      onClose()
      if (onAssessmentStarted) {
        onAssessmentStarted(res)
      } else {
        navigate('/dashboard/assessments', { state: { assessment: res?.data || res } })
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to start placement assessment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Experience Gate: ${skillName}`} maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--matrix-text-muted)', margin: 0, lineHeight: 1.5 }}>
          How would you rate your current background with <strong>{skillName}</strong>? Select your path to begin:
        </p>

        {/* Branch Toggle Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* Card A: Experienced User */}
          <div 
            onClick={() => setSelectedBranch('experienced')}
            style={{ 
              backgroundColor: selectedBranch === 'experienced' ? 'rgba(18, 78, 120, 0.15)' : 'var(--matrix-bg-alt)', 
              border: `2px solid ${selectedBranch === 'experienced' ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`, 
              borderRadius: '12px', 
              padding: '1rem', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--matrix-text-primary)' }}>I Have Experience</strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--matrix-text-muted)', lineHeight: 1.4 }}>
              Take a placement test matched to your self-reported skill tier.
            </span>
          </div>

          {/* Card B: Complete Beginner */}
          <div 
            onClick={() => setSelectedBranch('new')}
            style={{ 
              backgroundColor: selectedBranch === 'new' ? 'rgba(16, 185, 129, 0.12)' : 'var(--matrix-bg-alt)', 
              border: `2px solid ${selectedBranch === 'new' ? '#10b981' : 'var(--matrix-border)'}`, 
              borderRadius: '12px', 
              padding: '1rem', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🌱</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--matrix-text-primary)' }}>I'm New to This</strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--matrix-text-muted)', lineHeight: 1.4 }}>
              Skip testing for now. Get an AI starter learning roadmap first.
            </span>
          </div>

        </div>

        {/* Branch Content View */}
        {selectedBranch === 'experienced' ? (
          <div style={{ backgroundColor: 'var(--matrix-surface)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--matrix-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--matrix-text-primary)' }}>
              Select your self-rated proficiency tier for the assessment:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { level: 'Beginner', label: 'Beginner', desc: 'I know basic concepts and syntax' },
                { level: 'Intermediate', label: 'Intermediate', desc: 'I build real-world applications independently' },
                { level: 'Proficient', label: 'Advanced', desc: 'I design architectures and mentor others' }
              ].map(item => (
                <label key={item.level} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  backgroundColor: claimedLevel === item.level ? 'rgba(18, 78, 120, 0.1)' : 'var(--matrix-bg-alt)',
                  border: `1px solid ${claimedLevel === item.level ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`,
                  cursor: 'pointer' 
                }}>
                  <input 
                    type="radio" 
                    name="claimedLevel" 
                    value={item.level} 
                    checked={claimedLevel === item.level} 
                    onChange={e => setClaimedLevel(e.target.value)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--matrix-text-primary)' }}>{item.label}</span>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--matrix-text-muted)' }}>{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleStartPlacementAssessment} 
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              {loading ? 'Generating Assessment...' : `Begin ${claimedLevel} Placement Assessment →`}
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--matrix-surface)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--matrix-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h5 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', color: 'var(--matrix-text-primary)' }}>🌱 Starter Learning Roadmap</h5>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--matrix-text-muted)', lineHeight: 1.5 }}>
                Instead of being tested immediately, our AI will generate a personalized preparation roadmap with documentation, tutorials, and foundation tasks for <strong>{skillName}</strong>.
              </p>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleGenerateStarterPlan} 
              disabled={loading}
              style={{ backgroundColor: '#10b981', borderColor: '#10b981', width: '100%' }}
            >
              {loading ? 'Creating Roadmap...' : '🚀 Generate Starter Learning Plan'}
            </button>
          </div>
        )}

      </div>
    </Modal>
  )
}
