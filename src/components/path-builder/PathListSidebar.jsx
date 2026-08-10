export default function PathListSidebar({
  careerPaths = [],
  selectedPath,
  onSelectPath,
  onDeletePath,
  onOpenCreateModal
}) {
  return (
    <div className="solid-card" style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Available Paths</h3>
        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={onOpenCreateModal}>
          + New Path
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {careerPaths.map(path => (
          <div 
            key={path.id} 
            onClick={() => onSelectPath(path.id)}
            style={{ 
              padding: '1rem', 
              borderRadius: '8px', 
              border: `2px solid ${selectedPath?.id === path.id ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`,
              backgroundColor: selectedPath?.id === path.id ? 'rgba(0, 180, 216, 0.05)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--matrix-text-primary)', display: 'flex', justifyContent: 'space-between' }}>
              {path.title}
              <button 
                onClick={(e) => { e.stopPropagation(); onDeletePath(path.id); }} 
                style={{ background: 'none', border: 'none', color: '#ff3355', cursor: 'pointer', padding: '0.2rem' }}
                title="Delete path"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--matrix-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {path.description}
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--matrix-primary)', fontWeight: 600 }}>
              {path.tracks?.length || 0} Tracks Defined
            </div>
          </div>
        ))}
        {careerPaths.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--matrix-text-muted)' }}>
            No career paths created yet.
          </div>
        )}
      </div>
    </div>
  )
}
