import { useState } from 'react'
import Modal from '../common/Modal'
import ExperienceGateModal from '../skills/ExperienceGateModal'

export default function QuickCheckModal({
  isOpen,
  onClose,
  selectedSkillId,
  setSelectedSkillId,
  allSkills = []
}) {
  const [showGate, setShowGate] = useState(false)

  const selectedSkill = allSkills.find(s => (s.id || s.Id) === selectedSkillId)

  const handleProceed = (e) => {
    e.preventDefault()
    if (!selectedSkillId) return
    setShowGate(true)
  }

  const handleCloseAll = () => {
    setShowGate(false)
    onClose()
  }

  if (showGate && selectedSkill) {
    return (
      <ExperienceGateModal
        isOpen={isOpen}
        onClose={handleCloseAll}
        assignedSkill={selectedSkill}
      />
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAll} title="Initialize Skill Check" maxWidth="480px">
      <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
        Select one of your assigned skills to choose your learning path or placement assessment.
      </p>
      <form onSubmit={handleProceed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Target Skill</label>
          <select 
            className="form-input" 
            value={selectedSkillId} 
            onChange={e => setSelectedSkillId(e.target.value)} 
            required
          >
            <option value="">-- Select a Skill --</option>
            {allSkills.map(s => (
              <option key={s.id || s.Id} value={s.id || s.Id}>{s.name || s.Name} ({s.category || s.Category || 'General'})</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={!selectedSkillId}>
          Proceed to Experience Gate →
        </button>
      </form>
    </Modal>
  )
}
