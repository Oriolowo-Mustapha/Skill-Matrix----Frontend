import Modal from '../common/Modal'

export default function SkillModal({
  isOpen,
  onClose,
  onSubmit,
  allSkills = [],
  formState,
  setFormState,
  saving
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Map Skill to Track">
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Select Skill</label>
          <select 
            className="form-input" 
            value={formState.skillId} 
            onChange={e => setFormState({...formState, skillId: e.target.value})} 
            required
          >
            <option value="">-- Choose a skill --</option>
            {allSkills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Target Proficiency Level</label>
          <select 
            className="form-input" 
            value={formState.requiredLevel} 
            onChange={e => setFormState({...formState, requiredLevel: e.target.value})} 
            required
          >
            <option value={0}>Novice (0)</option>
            <option value={1}>Beginner (1)</option>
            <option value={2}>Intermediate (2)</option>
            <option value={3}>Proficient (3)</option>
            <option value={4}>Expert (4)</option>
          </select>
          <small style={{ color: 'var(--matrix-text-muted)', marginTop: '0.5rem', display: 'block' }}>
            This is the required level a learner must achieve to be considered proficient in this track.
          </small>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Mapping...' : 'Map Skill'}
        </button>
      </form>
    </Modal>
  )
}
