import Modal from '../common/Modal'

export default function AssignSkillModal({
  isOpen,
  onClose,
  onSubmit,
  assignSkillForm,
  setAssignSkillForm,
  allSkills = [],
  saving
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Individual Skill">
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Select Skill</label>
          <select 
            className="form-input" 
            value={assignSkillForm.skillId} 
            onChange={e => setAssignSkillForm({...assignSkillForm, skillId: e.target.value})} 
            required
          >
            <option value="">-- Choose a Skill --</option>
            {allSkills.length === 0 ? (
              <option value="" disabled>No skills available — skills will be auto-generated via AI on first access</option>
            ) : (
              allSkills.map(skill => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))
            )}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={saving}>
          {saving ? 'Assigning...' : 'Assign Skill'}
        </button>
      </form>
    </Modal>
  )
}
