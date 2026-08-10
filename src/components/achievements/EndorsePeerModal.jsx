import Modal from '../common/Modal'

export default function EndorsePeerModal({
  isOpen,
  onClose,
  onSubmit,
  receiverId,
  setReceiverId,
  skillId,
  setSkillId,
  teamMembers = [],
  allSkills = [],
  currentUserId,
  endorsing
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👏 Endorse a Teammate" maxWidth="480px">
      <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
        Recognize a peer's skill proficiency to boost their gamification rank and profile score.
      </p>
      
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Select Teammate</label>
          <select className="form-input" value={receiverId} onChange={e => setReceiverId(e.target.value)} required>
            <option value="">-- Choose a Teammate --</option>
            {teamMembers.filter(m => m.id !== currentUserId).map(m => (
              <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Endorsed Skill</label>
          <select className="form-input" value={skillId} onChange={e => setSkillId(e.target.value)} required>
            <option value="">-- Choose a Skill --</option>
            {allSkills.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={endorsing}>
          {endorsing ? 'Submitting Endorsement...' : 'Send Endorsement'}
        </button>
      </form>
    </Modal>
  )
}
