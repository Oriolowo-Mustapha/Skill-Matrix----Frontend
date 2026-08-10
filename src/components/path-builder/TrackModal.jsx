import Modal from '../common/Modal'

export default function TrackModal({
  isOpen,
  onClose,
  onSubmit,
  selectedPathTitle,
  formState,
  setFormState,
  saving
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Track to '${selectedPathTitle || ''}'`}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Track Title</label>
          <input 
            type="text" 
            className="form-input" 
            value={formState.title} 
            onChange={e => setFormState({...formState, title: e.target.value})} 
            required 
            placeholder="e.g. Frontend Developer" 
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
            placeholder="Describe this specific track..." 
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
          {saving ? 'Creating...' : 'Create Track'}
        </button>
      </form>
    </Modal>
  )
}
