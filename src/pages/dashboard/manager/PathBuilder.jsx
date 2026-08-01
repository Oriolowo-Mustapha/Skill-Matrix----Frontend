import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../../api/axios'
import { toast } from 'react-hot-toast'

export default function PathBuilder() {
  const [careerPaths, setCareerPaths] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals
  const [isPathModalOpen, setIsPathModalOpen] = useState(false)
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatingAiCatalog, setGeneratingAiCatalog] = useState(false)

  // Forms
  const [pathForm, setPathForm] = useState({ title: '', description: '', image: null })
  const [trackForm, setTrackForm] = useState({ title: '', description: '', image: null })
  const [skillForm, setSkillForm] = useState({ trackId: '', skillId: '', requiredLevel: 0 })

  const fetchInitialData = useCallback(async () => {
    try {
      const [pathsRes, skillsRes] = await Promise.all([
        apiClient.get('/api/CareerPaths'),
        apiClient.get('/api/Skills')
      ])
      setCareerPaths(pathsRes || [])
      setAllSkills(skillsRes || [])
    } catch {
      setError('Failed to load career paths.')
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const [pathsRes, skillsRes] = await Promise.all([
          apiClient.get('/api/CareerPaths'),
          apiClient.get('/api/Skills')
        ])
        if (isMounted) {
          setCareerPaths(pathsRes || [])
          setAllSkills(skillsRes || [])
        }
      } catch {
        if (isMounted) setError('Failed to load career paths.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [])

  const handleSelectPath = async (id) => {
    try {
      const res = await apiClient.get(`/api/CareerPaths/${id}`)
      setSelectedPath(res)
    } catch {
      toast.error('Failed to load path details')
    }
  }

  // --- Handlers for Career Path ---
  const handleCreatePath = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('Title', pathForm.title)
      formData.append('Description', pathForm.description)
      if (pathForm.image) formData.append('Image', pathForm.image)

      await apiClient.post('/api/CareerPaths', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        showSuccessToast: true
      })
      
      setIsPathModalOpen(false)
      setPathForm({ title: '', description: '', image: null })
      fetchInitialData()
    } catch {
      toast.error('Failed to create career path')
    } finally {
      setSaving(false)
    }
  }

  // --- Handlers for Tracks ---
  const handleCreateTrack = async (e) => {
    e.preventDefault()
    if (!selectedPath) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('CareerPathId', selectedPath.id)
      formData.append('Name', trackForm.title)
      formData.append('Description', trackForm.description)
      if (trackForm.image) formData.append('Image', trackForm.image)

      await apiClient.post(`/api/CareerPaths/${selectedPath.id}/tracks`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        showSuccessToast: true
      })
      
      setIsTrackModalOpen(false)
      setTrackForm({ title: '', description: '', image: null })
      handleSelectPath(selectedPath.id) // refresh path details
    } catch {
      toast.error('Failed to create track')
    } finally {
      setSaving(false)
    }
  }

  // --- Handlers for Skills ---
  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!selectedPath) return
    setSaving(true)
    try {
      await apiClient.post(`/api/CareerPaths/${selectedPath.id}/tracks/${skillForm.trackId}/skills`, {
        careerPathId: selectedPath.id,
        trackId: skillForm.trackId,
        skillId: skillForm.skillId,
        targetLevel: parseInt(skillForm.requiredLevel)
      }, { showSuccessToast: true })
      
      setIsSkillModalOpen(false)
      setSkillForm({ trackId: '', skillId: '', requiredLevel: 0 })
      handleSelectPath(selectedPath.id) // refresh path details
    } catch {
      toast.error('Failed to add skill')
    } finally {
      setSaving(false)
    }
  }

  const openSkillModalForTrack = (trackId) => {
    setSkillForm({ ...skillForm, trackId, skillId: '', requiredLevel: 0 })
    setIsSkillModalOpen(true)
  }

  // --- Handlers for Deletions ---
  const handleDeletePath = async (id) => {
    if (!window.confirm("Are you sure you want to delete this career path?")) return
    try {
      await apiClient.delete(`/api/CareerPaths/${id}`, { showSuccessToast: true })
      if (selectedPath?.id === id) setSelectedPath(null)
      fetchInitialData()
    } catch {
      toast.error('Failed to delete path')
    }
  }

  const handleDeleteTrack = async (trackId) => {
    if (!window.confirm("Are you sure you want to delete this track?")) return
    try {
      await apiClient.delete(`/api/CareerPaths/${selectedPath.id}/tracks/${trackId}`, { showSuccessToast: true })
      handleSelectPath(selectedPath.id)
    } catch {
      toast.error('Failed to delete track')
    }
  }

  const handleDeleteSkill = async (trackId, skillId) => {
    if (!window.confirm("Are you sure you want to remove this skill from the track?")) return
    try {
      await apiClient.delete(`/api/CareerPaths/${selectedPath.id}/tracks/${trackId}/skills/${skillId}`, { showSuccessToast: true })
      handleSelectPath(selectedPath.id)
    } catch {
      toast.error('Failed to remove skill')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading architect...</p>
      </div>
    )
  }

  const handleGenerateAiCatalog = async () => {
    setGeneratingAiCatalog(true)
    try {
      const res = await apiClient.post('/api/CareerPaths/ai-generate-catalog', {}, { showSuccessToast: true })
      toast.success(res?.message || 'AI Global Catalog generated successfully!')
      fetchInitialData()
    } catch {
      toast.error('Failed to generate AI catalog.')
    } finally {
      setGeneratingAiCatalog(false)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <div className="dashboard-header-row" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dashboard-section-title">Career Path Architect</h2>
          <p className="dashboard-section-subtitle">Design organizational paths, tracks, and map required skills.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleGenerateAiCatalog} 
          disabled={generatingAiCatalog}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--matrix-primary)', color: 'var(--matrix-primary)' }}
        >
          {generatingAiCatalog ? '⚡ Generating AI Catalog...' : '✨ AI Auto-Generate Catalog'}
        </button>
      </div>

      {error && (
        <div className="dashboard-alert dashboard-alert-error">
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: '600px' }}>
        {/* Left Pane: Paths List */}
        <div className="solid-card" style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Available Paths</h3>
            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setIsPathModalOpen(true)}>
              + New Path
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {careerPaths.map(path => (
              <div 
                key={path.id} 
                onClick={() => handleSelectPath(path.id)}
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
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePath(path.id); }} style={{ background: 'none', border: 'none', color: '#ff3355', cursor: 'pointer', padding: '0.2rem' }}>
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

        {/* Right Pane: Selected Path Details */}
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
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--matrix-text-primary)' }}>{selectedPath.title}</h2>
                  <p style={{ margin: 0, color: 'var(--matrix-text-secondary)', maxWidth: '600px' }}>{selectedPath.description}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setIsTrackModalOpen(true)}>
                  + Add Track
                </button>
              </div>

              {selectedPath.tracks?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed var(--matrix-border)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--matrix-text-muted)' }}>No tracks have been added to this path yet.</p>
                  <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setIsTrackModalOpen(true)}>Create First Track</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {selectedPath.tracks?.map(track => (
                    <div key={track.id} style={{ backgroundColor: 'var(--matrix-bg)', border: '1px solid var(--matrix-border)', borderRadius: '8px', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'var(--matrix-primary)' }}>{track.title}</h3>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--matrix-text-secondary)' }}>{track.description}</p>
                          <span style={{ fontSize: '0.8rem', color: 'var(--matrix-text-muted)', backgroundColor: 'var(--matrix-bg-alt)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            Timeline: {track.expectedTimeLine || 'N/A'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => openSkillModalForTrack(track.id)}>
                            + Add Skill
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#ff3355' }} onClick={() => handleDeleteTrack(track.id)}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>

                      {track.skills?.length > 0 ? (
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
                                    <button onClick={() => handleDeleteSkill(track.id, ts.skillId)} style={{ background: 'none', border: 'none', color: '#ff3355', cursor: 'pointer', padding: '0.2rem' }}>
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
      </div>

      {/* MODALS */}
      {/* Create Career Path Modal */}
      {isPathModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPathModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <button className="modal-close" onClick={() => setIsPathModalOpen(false)}>&times;</button>
            <h3 className="modal-title" style={{ marginBottom: '1.5rem' }}>Create New Career Path</h3>
            <form onSubmit={handleCreatePath} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Path Title</label>
                <input type="text" className="form-input" value={pathForm.title} onChange={e => setPathForm({...pathForm, title: e.target.value})} required placeholder="e.g. Software Engineering" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={pathForm.description} onChange={e => setPathForm({...pathForm, description: e.target.value})} required rows={3} placeholder="Describe the overall journey..." />
              </div>
              <div className="form-group">
                <label>Cover Image (Optional)</label>
                <input type="file" className="form-input" accept="image/*" onChange={e => setPathForm({...pathForm, image: e.target.files[0]})} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Path'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Create Track Modal */}
      {isTrackModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTrackModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <button className="modal-close" onClick={() => setIsTrackModalOpen(false)}>&times;</button>
            <h3 className="modal-title" style={{ marginBottom: '1.5rem' }}>Add Track to '{selectedPath?.title}'</h3>
            <form onSubmit={handleCreateTrack} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Track Title</label>
                <input type="text" className="form-input" value={trackForm.title} onChange={e => setTrackForm({...trackForm, title: e.target.value})} required placeholder="e.g. Frontend Developer" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" value={trackForm.description} onChange={e => setTrackForm({...trackForm, description: e.target.value})} required rows={3} placeholder="Describe this specific track..." />
              </div>
              <div className="form-group">
                <label>Cover Image (Optional)</label>
                <input type="file" className="form-input" accept="image/*" onChange={e => setTrackForm({...trackForm, image: e.target.files[0]})} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Track'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill to Track Modal */}
      {isSkillModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSkillModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <button className="modal-close" onClick={() => setIsSkillModalOpen(false)}>&times;</button>
            <h3 className="modal-title" style={{ marginBottom: '1.5rem' }}>Map Skill to Track</h3>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Select Skill</label>
                <select className="form-input" value={skillForm.skillId} onChange={e => setSkillForm({...skillForm, skillId: e.target.value})} required>
                  <option value="">-- Choose a skill --</option>
                  {allSkills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Target Proficiency Level</label>
                <select className="form-input" value={skillForm.requiredLevel} onChange={e => setSkillForm({...skillForm, requiredLevel: e.target.value})} required>
                  <option value={0}>Novice (0)</option>
                  <option value={1}>Beginner (1)</option>
                  <option value={2}>Intermediate (2)</option>
                  <option value={3}>Proficient (3)</option>
                  <option value={4}>Expert (4)</option>
                </select>
                <small style={{ color: 'var(--matrix-text-muted)', marginTop: '0.5rem', display: 'block' }}>
                  This is the required level a learner must achieve to be considered proficient in this track.
                </small>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Mapping...' : 'Map Skill'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
