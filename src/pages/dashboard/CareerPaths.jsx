import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import apiClient from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function CareerPaths() {
  const { assignedCareerPaths, allSkills, proficiencyColor } = useOutletContext()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [selectedAssignedId, setSelectedAssignedId] = useState(null)
  const [pathDetails, setPathDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState(null)

  // Browsing State
  const [isBrowsing, setIsBrowsing] = useState(false)
  const [globalPaths, setGlobalPaths] = useState([])
  const [loadingGlobal, setLoadingGlobal] = useState(false)
  
  // Preview Modal State
  const [previewPath, setPreviewPath] = useState(null)
  const [previewDetails, setPreviewDetails] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Baseline Modal State
  const [isBaselineModalOpen, setIsBaselineModalOpen] = useState(false)
  const [baselineLevel, setBaselineLevel] = useState(0)
  const [startingBaseline, setStartingBaseline] = useState(false)

  // Default to first assigned path if none selected (and not browsing)
  useEffect(() => {
    if (assignedCareerPaths?.length > 0 && !selectedAssignedId && !isBrowsing) {
      setSelectedAssignedId(assignedCareerPaths[0].careerPathId)
    }
  }, [assignedCareerPaths, selectedAssignedId, isBrowsing])

  // Fetch deep details for the selected path (Stepping Stones View)
  useEffect(() => {
    if (!selectedAssignedId || isBrowsing) return
    
    async function fetchDetails() {
      setLoading(true)
      try {
        const res = await apiClient.get(`/api/CareerPaths/${selectedAssignedId}`)
        setPathDetails(res) 
      } catch (err) {
        console.error('Failed to load career path details', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [selectedAssignedId, isBrowsing])

  // Fetch Global Catalog when Browsing
  useEffect(() => {
    if (!isBrowsing) return
    async function fetchGlobal() {
      setLoadingGlobal(true)
      try {
        const res = await apiClient.get('/api/CareerPaths')
        setGlobalPaths(res || [])
      } catch (err) {
        console.error('Failed to load global career paths', err)
      } finally {
        setLoadingGlobal(false)
      }
    }
    fetchGlobal()
  }, [isBrowsing])

  // Process tracks state based on user's skills
  const tracksWithState = (pathDetails?.tracks || []).map((track) => {
    let isCompleted = false
    if (track.skills && track.skills.length > 0) {
      isCompleted = track.skills.every(reqSkill => {
        const userSkill = allSkills.find(s => s.skillId === reqSkill.id || s.id === reqSkill.id)
        return userSkill?.isFullyMastered
      })
    } else {
      isCompleted = true
    }
    return { ...track, isCompleted }
  })

  // Assign Active, Completed, or Locked states
  let activeFound = false
  const finalTracks = tracksWithState.map(track => {
    if (track.isCompleted) {
      return { ...track, state: 'completed' }
    } else if (!activeFound) {
      activeFound = true
      return { ...track, state: 'active' }
    } else {
      return { ...track, state: 'locked' }
    }
  })

  // Auto-select the active track to show details
  useEffect(() => {
    if (!isBrowsing && finalTracks.length > 0 && (!selectedTrack || selectedTrack.careerPathId !== selectedAssignedId)) {
      const active = finalTracks.find(t => t.state === 'active') || finalTracks[finalTracks.length - 1]
      setSelectedTrack(active)
    }
  }, [finalTracks, selectedTrack, selectedAssignedId, isBrowsing])

  // Handle opening preview
  const handlePreview = async (path) => {
    setPreviewPath(path)
    setLoadingPreview(true)
    try {
      const res = await apiClient.get(`/api/CareerPaths/${path.id}`)
      setPreviewDetails(res)
    } catch (err) {
      console.error('Failed to load path preview', err)
    } finally {
      setLoadingPreview(false)
    }
  }

  // Handle assigning path
  const handleAssignPath = async () => {
    if (!user?.id || !previewPath?.id) return
    setIsAssigning(true)
    try {
      await apiClient.post('/api/CareerPaths/assign-learner', {
        learnerId: user.id,
        careerPathId: previewPath.id
      })
      // Reload the page to sync all global dashboard states
      window.location.reload()
    } catch (err) {
      console.error('Failed to assign career path', err)
      alert('Failed to assign the career path. It may already be assigned to you.')
      setIsAssigning(false)
    }
  }

  // Handle starting baseline
  const handleStartBaseline = async () => {
    setStartingBaseline(true)
    try {
      const res = await apiClient.post('/api/Assessments/track-baseline/start', {
        careerPathTrackId: selectedTrack.id,
        declaredProficiencyLevel: parseInt(baselineLevel)
      })
      setIsBaselineModalOpen(false)
      navigate('/dashboard/assessments', { state: { baselineBatches: res } })
    } catch (err) {
      console.error('Failed to start baseline', err)
      alert('Failed to start baseline assessment. Please try again.')
    } finally {
      setStartingBaseline(false)
    }
  }

  // --- VIEW RENDERERS ---

  if (isBrowsing) {
    return (
      <div className="dash-section" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
        <div className="dash-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="dash-section-title">Career Path Catalog</h2>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Discover and assign yourself to new learning roadmaps.</p>
          </div>
          {assignedCareerPaths?.length > 0 && (
            <button className="btn btn-secondary" onClick={() => setIsBrowsing(false)}>
              Back to My Paths
            </button>
          )}
        </div>

        {loadingGlobal ? (
          <div className="spinner" style={{ margin: '3rem auto' }}></div>
        ) : (
          <div className="dash-careers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {globalPaths.map(p => {
              const isAlreadyAssigned = assignedCareerPaths?.some(ap => ap.careerPathId === p.id)
              return (
                <div key={p.id} className="solid-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{p.title}</h3>
                  <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', flex: 1 }}>{p.description}</p>
                  {isAlreadyAssigned ? (
                    <span style={{ color: 'var(--matrix-accent)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Already Assigned</span>
                  ) : (
                    <button className="btn btn-primary" onClick={() => handlePreview(p)}>Explore & Assign</button>
                  )}
                </div>
              )
            })}
            {globalPaths.length === 0 && <p style={{ color: 'var(--matrix-text-muted)' }}>No career paths available in the catalog yet.</p>}
          </div>
        )}

        {/* Preview Modal */}
        {previewPath && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }}>
            <div className="solid-card" style={{ background: 'var(--matrix-surface)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '16px', position: 'relative' }}>
              <button 
                onClick={() => { setPreviewPath(null); setPreviewDetails(null) }} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--matrix-text-primary)' }}
              >
                &times;
              </button>
              
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', paddingRight: '2rem' }}>{previewPath.title}</h2>
              <p style={{ color: 'var(--matrix-text-muted)', marginBottom: '2rem' }}>{previewPath.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Roadmap Stages</h3>
                <button 
                  className="btn btn-primary" 
                  onClick={handleAssignPath}
                  disabled={isAssigning || loadingPreview}
                >
                  {isAssigning ? 'Assigning...' : 'Assign to Me'}
                </button>
              </div>

              {loadingPreview ? (
                <div className="spinner" style={{ margin: '2rem auto' }}></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {previewDetails?.tracks?.map((track, idx) => (
                    <div key={track.id} style={{ background: 'var(--matrix-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--matrix-border)' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--matrix-primary)', marginBottom: '0.5rem' }}>Stage {idx + 1}: {track.name}</h4>
                      <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{track.description}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {track.skills?.map(skill => (
                          <span key={skill.id} style={{ background: 'var(--matrix-surface)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid var(--matrix-border)' }}>
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(!previewDetails?.tracks || previewDetails.tracks.length === 0) && (
                    <p style={{ color: 'var(--matrix-text-muted)' }}>No stages defined for this path.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Empty State (Not browsing, no assigned paths)
  if (!assignedCareerPaths || assignedCareerPaths.length === 0) {
    return (
      <div className="dash-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="dash-empty-state" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <svg width="64" height="64" fill="none" stroke="var(--matrix-primary)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 1.5rem auto' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Unlock Your Potential</h2>
          <p style={{ color: 'var(--matrix-text-muted)', marginBottom: '2rem' }}>You haven't embarked on a career journey yet. Browse available paths and start mastering new skills today.</p>
          <button className="btn btn-primary" onClick={() => setIsBrowsing(true)} style={{ width: '100%' }}>
            Browse Career Paths
          </button>
        </div>
      </div>
    )
  }

  // Standard Stepping Stone View
  const assignedInfo = assignedCareerPaths.find(p => p.careerPathId === selectedAssignedId)

  return (
    <div className="dash-section" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
      
      {/* Hero Header */}
      <div className="dash-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="dash-section-title">{assignedInfo?.title || 'Career Path'}</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem', maxWidth: '800px' }}>
            {assignedInfo?.description || 'Follow this roadmap to achieve your career goals.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setIsBrowsing(true)}>
            Browse Catalog
          </button>
          {assignedCareerPaths.length > 1 && (
            <select 
              className="input-field" 
              value={selectedAssignedId || ''} 
              onChange={e => {
                setSelectedAssignedId(e.target.value)
                setSelectedTrack(null)
              }}
              style={{ width: 'auto', minWidth: '200px', cursor: 'pointer', margin: 0 }}
            >
              {assignedCareerPaths.map(p => (
                <option key={p.id} value={p.careerPathId}>{p.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="dash-progress-bar-container" style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <span>Overall Progress</span>
          <span style={{ color: 'var(--matrix-primary)' }}>{assignedInfo?.progressPercentage || 0}%</span>
        </div>
        <div className="dash-progress-bar" style={{ height: '8px', background: 'var(--matrix-surface)', overflow: 'hidden' }}>
          <div 
            className="dash-progress-fill" 
            style={{ width: `${assignedInfo?.progressPercentage || 0}%`, background: 'var(--matrix-primary)', height: '100%', borderRadius: '4px' }}
          ></div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading" style={{ margin: '3rem auto' }}>
          <div className="spinner"></div>
          <p>Mapping your journey...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: '500px', alignItems: 'flex-start' }}>
          
          {/* Left: Stepping Stones Timeline */}
          <div className="solid-card" style={{ flex: '1', position: 'relative', padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 600 }}>Path Milestones</h3>
            
            <div className="timeline-container" style={{ position: 'relative', paddingLeft: '20px' }}>
              {/* Timeline vertical line */}
              <div style={{ position: 'absolute', left: '29px', top: '10px', bottom: '20px', width: '3px', background: 'var(--matrix-border)', zIndex: 0, borderRadius: '4px' }}></div>
              
              {finalTracks.map((track, idx) => (
                <div 
                  key={track.id} 
                  style={{ 
                    position: 'relative', 
                    paddingLeft: '3.5rem', 
                    marginBottom: '2rem', 
                    cursor: track.state === 'locked' ? 'not-allowed' : 'pointer',
                    opacity: track.state === 'locked' ? 0.6 : 1,
                    transform: selectedTrack?.id === track.id ? 'translateX(5px)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    if (track.state !== 'locked') setSelectedTrack(track)
                  }}
                >
                  {/* Node icon */}
                  <div style={{
                    position: 'absolute',
                    left: '-2px',
                    top: '0',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: track.state === 'completed' ? 'var(--matrix-accent)' : track.state === 'active' ? 'var(--matrix-primary)' : 'var(--matrix-surface)',
                    border: track.state === 'locked' ? '3px solid var(--matrix-border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    zIndex: 1,
                    boxShadow: track.state === 'active' ? '0 0 0 6px rgba(79, 70, 229, 0.15)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {track.state === 'completed' && <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>}
                    {track.state === 'active' && <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
                    {track.state === 'locked' && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color="var(--matrix-text-muted)"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
                  </div>
                  
                  {/* Track Info */}
                  <div style={{ 
                    background: selectedTrack?.id === track.id ? 'var(--matrix-surface)' : 'transparent', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    border: selectedTrack?.id === track.id ? '1px solid var(--matrix-primary)' : '1px solid transparent',
                    transition: 'all 0.3s ease'
                  }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: track.state === 'active' ? 'var(--matrix-primary)' : 'inherit', marginBottom: '0.25rem' }}>
                      Stage {idx + 1}: {track.name}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--matrix-text-muted)' }}>{track.description}</p>
                  </div>
                </div>
              ))}
              
              {finalTracks.length === 0 && (
                <p style={{ color: 'var(--matrix-text-muted)' }}>No milestones defined for this path yet.</p>
              )}
            </div>
          </div>

          {/* Right: Track Detail Pane */}
          {selectedTrack && (
            <div className="solid-card" style={{ flex: '1', padding: '2rem', display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1.5rem' }}>
                <span className={`badge badge-${selectedTrack.state === 'completed' ? 'success' : 'primary'}`} style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                  {selectedTrack.state.toUpperCase()}
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{selectedTrack.name}</h3>
                <p style={{ color: 'var(--matrix-text-muted)' }}>{selectedTrack.description}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Required Skills 
                  <span style={{ fontSize: '0.8rem', background: 'var(--matrix-surface)', padding: '2px 8px', borderRadius: '12px' }}>
                    {selectedTrack.skills?.length || 0}
                  </span>
                </h4>
                {selectedTrack.state === 'active' && selectedTrack.skills?.length > 0 && (
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'var(--matrix-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => setIsBaselineModalOpen(true)}
                  >
                    Start Track Baseline Assessment
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {selectedTrack.skills?.map(reqSkill => {
                  const userSkill = allSkills.find(s => s.skillId === reqSkill.id || s.id === reqSkill.id)
                  const isMastered = userSkill?.isFullyMastered
                  const currentLevel = userSkill?.proficiencyLevel || 'Unassigned'
                  
                  return (
                    <div key={reqSkill.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1.25rem', 
                      background: 'var(--matrix-surface)', 
                      borderRadius: '12px', 
                      border: isMastered ? '1px solid var(--matrix-accent)' : '1px solid var(--matrix-border)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <div>
                        <h5 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>{reqSkill.name}</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--matrix-text-muted)' }}>Status:</span>
                          <span style={{ 
                            color: proficiencyColor ? proficiencyColor(currentLevel) : 'var(--matrix-text-primary)', 
                            fontWeight: 600,
                            background: 'var(--matrix-surface)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {currentLevel}
                          </span>
                        </div>
                      </div>
                      
                      {isMastered ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--matrix-accent)', fontWeight: 600 }}>
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Mastered
                        </div>
                      ) : (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                          onClick={() => {
                            if (currentLevel === 'Unassigned') {
                                navigate('/dashboard/skills')
                            } else {
                                navigate('/dashboard/assessments')
                            }
                          }}
                        >
                          {currentLevel === 'Unassigned' ? 'Assign Skill' : 'Take Single Test'}
                        </button>
                      )}
                    </div>
                  )
                })}
                {(!selectedTrack.skills || selectedTrack.skills.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--matrix-text-muted)', background: 'var(--matrix-surface)', borderRadius: '12px' }}>
                    <p>No specific skills listed for this track.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Baseline Modal */}
      {isBaselineModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }}>
          <div className="solid-card" style={{ background: 'var(--matrix-surface)', width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '16px', position: 'relative' }}>
            <button 
              onClick={() => setIsBaselineModalOpen(false)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--matrix-text-primary)' }}
            >
              &times;
            </button>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', paddingRight: '2rem' }}>Establish Baseline</h3>
            <p style={{ color: 'var(--matrix-text-muted)', marginBottom: '1.5rem' }}>
              Before you start, how would you rate your current overall experience with the skills in this track? We'll tailor your assessment accordingly.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { value: 0, label: 'Novice (No prior experience)' },
                { value: 1, label: 'Begineer (Basic knowledge)' },
                { value: 2, label: 'Intermediate (Practical application)' },
                { value: 3, label: 'Proficient (Extensive experience)' },
                { value: 4, label: 'Expert (Recognized authority)' }
              ].map(level => (
                <label key={level.value} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--matrix-border)', borderRadius: '8px', cursor: 'pointer', background: baselineLevel === level.value ? 'rgba(79, 70, 229, 0.05)' : 'transparent', borderColor: baselineLevel === level.value ? 'var(--matrix-primary)' : 'var(--matrix-border)' }}>
                  <input 
                    type="radio" 
                    name="proficiency" 
                    value={level.value} 
                    checked={baselineLevel === level.value} 
                    onChange={() => setBaselineLevel(level.value)} 
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--matrix-primary)' }}
                  />
                  <span style={{ fontWeight: 500 }}>{level.label}</span>
                </label>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsBaselineModalOpen(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleStartBaseline}
                disabled={startingBaseline}
              >
                {startingBaseline ? 'Preparing...' : 'Start Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
