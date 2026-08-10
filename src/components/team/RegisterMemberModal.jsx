import Modal from '../common/Modal'

export default function RegisterMemberModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  onInputChange,
  validationErrors = {},
  saving
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Team Member">
      <form onSubmit={onSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" className="form-input" value={form.firstName} onChange={onInputChange} required />
            {validationErrors.FirstName && <span className="error-text">{validationErrors.FirstName[0]}</span>}
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" className="form-input" value={form.lastName} onChange={onInputChange} required />
            {validationErrors.LastName && <span className="error-text">{validationErrors.LastName[0]}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" className="form-input" value={form.email} onChange={onInputChange} required />
          {validationErrors.Email && <span className="error-text">{validationErrors.Email[0]}</span>}
        </div>
        
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="userName" className="form-input" value={form.userName} onChange={onInputChange} required />
          {validationErrors.UserName && <span className="error-text">{validationErrors.UserName[0]}</span>}
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
          {saving ? 'Registering...' : 'Register Member'}
        </button>
      </form>
    </Modal>
  )
}
