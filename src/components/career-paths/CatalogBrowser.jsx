import Modal from '../common/Modal'

export default function CatalogBrowser({
  globalPaths = [],
  assignedCareerPaths = [],
  loadingGlobal,
  onBackToMyPaths,
  onPreview,
  previewPath,
  previewDetails,
  loadingPreview,
  onAssignPath,
  isAssigning,
  onClosePreview
}) {
  return (
    <div className="dash-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dash-section-title">Career Path Catalog</h2>
          <p className="dashboard-section-subtitle">Discover and enroll in structured organizational roadmaps.</p>
        </div>
        {assignedCareerPaths?.length > 0 && (
          <button className="btn btn-secondary" onClick={onBackToMyPaths}>
            ← Back to My Career Paths
          </button>
        )}
      </div>

      {loadingGlobal ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading catalog...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {globalPaths.map(p => {
            const isAlreadyAssigned = assignedCareerPaths?.some(ap => ap.careerPathId === p.id || ap.id === p.id)
            return (
              <div key={p.id} className="solid-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--matrix-primary)' }}>{p.title}</h3>
                  <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{p.description}</p>
                </div>
                {isAlreadyAssigned ? (
                  <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                    Enrolled in Path
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={() => onPreview(p)}>
                    Explore & Enroll
                  </button>
                )}
              </div>
            )
          })}
          {globalPaths.length === 0 && <p style={{ color: 'var(--matrix-text-muted)' }}>No career paths currently available in catalog.</p>}
        </div>
      )}

      {/* Path Preview Modal */}
      {previewPath && (
        <Modal isOpen={!!previewPath} onClose={onClosePreview} maxWidth="750px">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{previewPath.title}</h2>
          <p style={{ color: 'var(--matrix-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{previewPath.description}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Roadmap Stages & Tracks</h3>
            <button 
              className="btn btn-primary" 
              onClick={onAssignPath}
              disabled={isAssigning || loadingPreview}
            >
              {isAssigning ? 'Enrolling...' : 'Enroll in Path'}
            </button>
          </div>

          {loadingPreview ? (
            <div className="dashboard-loading"><div className="spinner"></div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {previewDetails?.tracks?.map((track, idx) => (
                <div key={track.id} style={{ backgroundColor: 'var(--matrix-bg-alt)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--matrix-border)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--matrix-primary)', margin: '0 0 0.35rem 0' }}>
                    Stage {idx + 1}: {track.name}
                  </h4>
                  <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>{track.description}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {track.skills?.map(skill => (
                      <span key={skill.id} className="badge-pill" style={{ backgroundColor: 'rgba(99,16,188,0.1)', fontSize: '0.75rem', color: 'var(--matrix-primary)' }}>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
