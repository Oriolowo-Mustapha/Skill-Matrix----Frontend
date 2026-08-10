import Modal from '../common/Modal'

export default function SelfAssessmentModal({
  isOpen,
  onClose,
  onSubmit,
  selectedSkillName,
  loadingCheck
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Skill Check: ${selectedSkillName || ''}`} maxWidth="480px">
      <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
        Test your current understanding of <strong>{selectedSkillName}</strong> to update your proficiency matrix level.
      </p>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loadingCheck}>
          {loadingCheck ? 'Starting Session...' : 'Begin Assessment'}
        </button>
      </form>
    </Modal>
  )
}
