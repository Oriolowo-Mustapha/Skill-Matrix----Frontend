export default function MemberProfileCard({ profile }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {/* Career Paths */}
      <div className="solid-card">
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--matrix-primary)' }}>Assigned Career Paths</h3>
        {profile.assignedPaths?.length === 0 ? (
          <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem' }}>No career paths assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {profile.assignedPaths.map(path => (
              <div key={path.id} style={{ padding: '1rem', border: '1px solid var(--matrix-border)', borderRadius: '8px', backgroundColor: 'var(--matrix-bg-alt)' }}>
                <h4 style={{ margin: '0 0 0.25rem 0' }}>{path.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--matrix-text-muted)' }}>{path.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Skills */}
      <div className="solid-card">
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--matrix-primary)' }}>Skill Progress</h3>
        {profile.assignedSkills?.length === 0 ? (
          <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem' }}>No skills tracked yet.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--matrix-border)' }}>
                  <th style={{ padding: '0.5rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>SKILL</th>
                  <th style={{ padding: '0.5rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>PROFICIENCY</th>
                </tr>
              </thead>
              <tbody>
                {profile.assignedSkills.map(skill => (
                  <tr key={skill.skillId} style={{ borderBottom: '1px solid var(--matrix-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{skill.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge-pill" style={{ backgroundColor: skill.isFullyMastered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,180,216,0.1)', color: skill.isFullyMastered ? '#10b981' : 'var(--matrix-primary)' }}>
                        {skill.proficiencyLevel || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
