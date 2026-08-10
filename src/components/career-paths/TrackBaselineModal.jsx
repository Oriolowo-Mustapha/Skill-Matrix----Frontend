import Modal from '../common/Modal'

export default function TrackBaselineModal({
  isOpen,
  onClose,
  onSubmit,
  selectedTrackName,
  baselineLevel,
  setBaselineLevel,
  startingBaseline
}) {
  const levels = [
    { value: 0, label: 'Novice (No prior experience)' },
    { value: 1, label: 'Beginner (Basic foundational knowledge)' },
    { value: 2, label: 'Intermediate (Practical hands-on experience)' },
    { value: 3, label: 'Proficient (Extensive project application)' },
    { value: 4, label: 'Expert (Recognized domain authority)' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Track Baseline: ${selectedTrackName || ''}`} maxWidth="480px">
      <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
        Select your declared experience level to generate your tailored baseline assessment test.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {levels.map(lvl => (
          <label key={lvl.value} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid var(--matrix-border)', borderRadius: '8px', cursor: 'pointer', backgroundColor: baselineLevel === lvl.value ? 'rgba(0,180,216,0.1)' : 'var(--matrix-bg-alt)', borderColor: baselineLevel === lvl.value ? 'var(--matrix-primary)' : 'var(--matrix-border)' }}>
            <input 
              type="radio" 
              name="baselineProficiency" 
              value={lvl.value} 
              checked={baselineLevel === lvl.value} 
              onChange={() => setBaselineLevel(lvl.value)} 
              style={{ accentColor: 'var(--matrix-primary)' }}
            />
            <span style={{ fontSize: '0.875rem' }}>{lvl.label}</span>
          </label>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button 
          className="btn btn-primary" 
          onClick={onSubmit}
          disabled={startingBaseline}
        >
          {startingBaseline ? 'Initializing...' : 'Begin Track Assessment'}
        </button>
      </div>
    </Modal>
  )
}
