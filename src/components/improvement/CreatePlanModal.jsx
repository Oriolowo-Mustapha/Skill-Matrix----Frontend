import Modal from '../common/Modal'

export default function CreatePlanModal({
  isOpen,
  onClose,
  onSubmit,
  selectedPathId,
  setSelectedPathId,
  assignedCareerPaths = [],
  generating
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ Generate AI Improvement Plan" maxWidth="480px">
      <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
        Select your target career path. Our AI engine will analyze your skill gap assessments and generate a tailored growth plan.
      </p>
      
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Target Career Path</label>
          <select 
            className="form-input" 
            value={selectedPathId} 
            onChange={e => setSelectedPathId(e.target.value)} 
            required
          >
            <option value="">-- Select a Career Path --</option>
            {assignedCareerPaths.map(path => (
              <option key={path.id || path.careerPathId} value={path.careerPathId || path.id}>
                {path.title}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={generating}>
          {generating ? 'Analyzing & Generating Plan...' : 'Generate Plan'}
        </button>
      </form>
    </Modal>
  )
}
