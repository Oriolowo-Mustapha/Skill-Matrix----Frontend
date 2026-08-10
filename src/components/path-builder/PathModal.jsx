import Modal from '../common/Modal'

export default function PathModal({
  isOpen,
  onClose,
  onSubmit,
  formState,
  setFormState,
  saving
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Career Path">
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Path Title</label>
          <input 
            type="text" 
            className="form-input" 
            value={formState.title} 
            onChange={e => setFormState({...formState, title: e.target.value})} 
            required 
            placeholder="e.g. Software Engineering" 
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea 
            className="form-input" 
            value={formState.description} 
            onChange={e => setFormState({...formState, description: e.target.value})} 
            required 
            rows={3} 
            placeholder="Describe the overall journey..." 
          />
        </div>
        <div className="form-group">
          <label>Cover Image (Optional)</label>
          <input 
            type="file" 
            className="form-input" 
            accept="image/*" 
            onChange={e => setFormState({...formState, image: e.target.files[0]})} 
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Creating...' : 'Create Path'}
        </button>
      </form>
    </Modal>
  )
}
