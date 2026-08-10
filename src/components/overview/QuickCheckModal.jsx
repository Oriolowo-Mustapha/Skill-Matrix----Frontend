import Modal from '../common/Modal'

export default function QuickCheckModal({
  isOpen,
  onClose,
  onSubmit,
  selectedSkillId,
  setSelectedSkillId,
  allSkills = [],
  startingCheck
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initialize Quick Skill Check" maxWidth="480px">
      <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
        Select one of your assigned skills to take a quick 3-question evaluation test.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <option key={s.id} value={s.id}>{s.name} ({s.category || 'General'})</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={startingCheck}>
          {startingCheck ? 'Initializing...' : 'Start Assessment'}
        </button>
      </form>
    </Modal>
  )
}
