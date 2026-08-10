import Modal from '../common/Modal'

export default function AssignPathModal({
  isOpen,
  onClose,
  onSubmit,
  assignForm,
  setAssignForm,
  availableCareerPaths = [],
  selectedPathDetails,
  saving
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Career Path">
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Select Career Path</label>
          {availableCareerPaths.length === 0 ? (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,193,7,0.1)', color: '#d97706', borderRadius: '4px', border: '1px solid #fcd34d' }}>
              This team member has already been assigned all available career paths.
            </div>
          ) : (
            <select 
              className="form-input" 
              value={assignForm.careerPathId} 
              onChange={e => setAssignForm({...assignForm, careerPathId: e.target.value, trackId: ''})} 
              required
            >
              <option value="">-- Choose a Path --</option>
              {availableCareerPaths.map(path => (
                <option key={path.id} value={path.id}>{path.title}</option>
              ))}
            </select>
          )}
        </div>

        {assignForm.careerPathId && selectedPathDetails?.tracks?.length > 0 && (
          <div className="form-group">
            <label>Select Track (Optional)</label>
            <select 
              className="form-input" 
              value={assignForm.trackId} 
              onChange={e => setAssignForm({...assignForm, trackId: e.target.value})}
            >
              <option value="">-- General Path (No Track) --</option>
              {selectedPathDetails.tracks.map(track => (
                <option key={track.id} value={track.id}>{track.name || track.title}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={saving || availableCareerPaths.length === 0}>
          {saving ? 'Assigning...' : 'Assign Path'}
        </button>
      </form>
    </Modal>
  )
}
