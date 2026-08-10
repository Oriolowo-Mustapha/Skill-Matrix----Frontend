export default function PathDetailPane({
  selectedPath,
  onOpenTrackModal,
  onDeleteTrack,
  onOpenSkillModalForTrack,
  onDeleteSkill
}) {
  return (
    <div className="solid-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: 'var(--matrix-bg-alt)' }}>
      {!selectedPath ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--matrix-text-muted)' }}>
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.5 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Select a Career Path</h3>
          <p>Choose a path from the left to view and edit its tracks.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header section of selected path */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--matrix-text-primary)' }}>{selectedPath.title}</h2>
              <p style={{ margin: 0, color: 'var(--matrix-text-muted)', fontSize: '0.95rem' }}>{selectedPath.description}</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={onOpenTrackModal}>
              + Add Track
            </button>
          </div>

          {/* Tracks list */}
          {!selectedPath.tracks || selectedPath.tracks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--matrix-text-muted)' }}>
              <p>No tracks defined for this career path yet.</p>
              <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={onOpenTrackModal}>
                Create First Track
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedPath.tracks.map((track, idx) => (
                <div key={track.id} className="solid-card" style={{ backgroundColor: 'var(--matrix-bg)', border: '1px solid var(--matrix-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--matrix-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Track {idx + 1}
                      </span>
                      <h3 style={{ margin: '0.2rem 0 0.4rem 0', color: 'var(--matrix-text-primary)' }}>{track.title || track.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--matrix-text-muted)' }}>{track.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => onOpenSkillModalForTrack(track.id)}>
                        + Add Skill
                      </button>
                      <button onClick={() => onDeleteTrack(track.id)} style={{ background: 'none', border: 'none', color: '#ff3355', cursor: 'pointer', padding: '0.2rem' }} title="Delete track">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>

                  {/* Skills Table */}
                  {track.skills && track.skills.length > 0 ? (
                    <div className="table-responsive">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--matrix-border)' }}>
                            <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>SKILL NAME</th>
                            <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>REQUIRED LEVEL</th>
                            <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {track.skills.map(ts => (
                            <tr key={ts.id} style={{ borderBottom: '1px solid var(--matrix-border)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--matrix-text-primary)' }}>{ts.name}</td>
                              <td style={{ padding: '0.75rem' }}>
                                <span className="badge-pill" style={{ backgroundColor: 'rgba(0,180,216,0.1)', color: 'var(--matrix-primary)' }}>
                                  {ts.proficiencyLevel || 'Unknown'} (Level {ts.proficiencyLevel === 'Expert' ? 4 : ts.proficiencyLevel === 'Proficient' ? 3 : ts.proficiencyLevel === 'Intermediate' ? 2 : ts.proficiencyLevel === 'Beginner' ? 1 : 0})
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                <button onClick={() => onDeleteSkill(track.id, ts.skillId)} style={{ background: 'none', border: 'none', color: '#ff3355', cursor: 'pointer', padding: '0.2rem' }} title="Remove skill">
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', backgroundColor: 'var(--matrix-bg-alt)', borderRadius: '4px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--matrix-text-muted)' }}>
                      No skills mapped to this track.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
