import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import apiClient from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import CatalogBrowser from '../../components/career-paths/CatalogBrowser'
import TrackBaselineModal from '../../components/career-paths/TrackBaselineModal'

export default function CareerPaths() {
  const { assignedCareerPaths, allSkills, proficiencyColor } = useOutletContext()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  // Selected Assigned Path ID (Derived default)
  const [selectedAssignedIdState, setSelectedAssignedId] = useState(null)
  const selectedAssignedId = selectedAssignedIdState || (assignedCareerPaths?.[0]?.careerPathId || assignedCareerPaths?.[0]?.id || null)

  const [pathDetails, setPathDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedTrackState, setSelectedTrack] = useState(null)

  // Catalog Browsing State
  const [isBrowsing, setIsBrowsing] = useState(false)
  const [globalPaths, setGlobalPaths] = useState([])
  const [loadingGlobal, setLoadingGlobal] = useState(false)
  
  // Preview Modal State
  const [previewPath, setPreviewPath] = useState(null)
  const [previewDetails, setPreviewDetails] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Track Baseline Assessment Modal
  const [isBaselineModalOpen, setIsBaselineModalOpen] = useState(false)
  const [baselineLevel, setBaselineLevel] = useState(0)
  const [startingBaseline, setStartingBaseline] = useState(false)

  // Fetch detailed tracks & skills for the selected path
  useEffect(() => {
    if (!selectedAssignedId || isBrowsing) return
    
    async function fetchDetails() {
      setLoading(true)
      try {
        const assignedInfo = (assignedCareerPaths || []).find(p => p.careerPathId === selectedAssignedId || p.id === selectedAssignedId)
        const trackQuery = assignedInfo?.careerPathTrackId ? `?trackId=${assignedInfo.careerPathTrackId}` : ''
        const res = await apiClient.get(`/api/CareerPaths/${selectedAssignedId}${trackQuery}`)
        setPathDetails(res) 
      } catch {
        toast.error('Failed to load career path details.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [selectedAssignedId, isBrowsing, assignedCareerPaths])

  // Fetch Global Catalog when Browsing mode is activated
  useEffect(() => {
    if (!isBrowsing) return
    async function fetchGlobal() {
      setLoadingGlobal(true)
      try {
        const res = await apiClient.get('/api/CareerPaths')
        setGlobalPaths(res || [])
      } catch {
        toast.error('Failed to load career path catalog.')
      } finally {
        setLoadingGlobal(false)
      }
    }
    fetchGlobal()
  }, [isBrowsing])

  // Map track completion status based on user mastered skills
  const tracksWithState = (pathDetails?.tracks || []).map((track) => {
    const isCompleted = track.skills && track.skills.length > 0
      ? track.skills.every(reqSkill => {
          const userSkill = (allSkills || []).find(s => s.skillId === reqSkill.id || s.id === reqSkill.id)
          return userSkill?.isFullyMastered || userSkill?.proficiencyLevel === 'Expert'
        })
      : false
    return { ...track, isCompleted }
  })

  // Assign Active, Completed, or Locked milestone states
  const firstIncompleteIdx = tracksWithState.findIndex(t => !t.isCompleted)
  const finalTracks = tracksWithState.map((track, idx) => {
    if (track.isCompleted) {
      return { ...track, state: 'completed' }
    } else if (idx === (firstIncompleteIdx !== -1 ? firstIncompleteIdx : 0)) {
      return { ...track, state: 'active' }
    } else {
      return { ...track, state: 'locked' }
    }
  })

  // Derived selected track
  const selectedTrack = selectedTrackState || finalTracks.find(t => t.state === 'active') || finalTracks[0] || null

  // Open Preview Modal
  const handlePreview = async (path) => {
    setPreviewPath(path)
    setLoadingPreview(true)
    try {
      const res = await apiClient.get(`/api/CareerPaths/${path.id}`)
      setPreviewDetails(res)
    } catch {
      toast.error('Failed to load path preview details.')
    } finally {
      setLoadingPreview(false)
    }
  }

  // Assign Path to Self
  const handleAssignPath = async () => {
    if (!user?.id || !previewPath?.id) return
    setIsAssigning(true)
    try {
      const isTeamMember = user?.role === 'Team_Members' || user?.role === 'TeamMember'
      const endpoint = isTeamMember ? '/api/CareerPaths/assign-team-member' : '/api/CareerPaths/assign-learner'
      const payload = isTeamMember 
        ? { teamMemberId: user.id, careerPathId: previewPath.id }
        : { learnerId: user.id, careerPathId: previewPath.id }

      await apiClient.post(endpoint, payload, { showSuccessToast: true })
      setPreviewPath(null)
      setIsBrowsing(false)
      window.location.reload()
    } catch {
      toast.error('Failed to assign career path.')
      setIsAssigning(false)
    }
  }

  // Start Track Baseline Assessment
  const handleStartBaseline = async () => {
    if (!selectedTrack) return
    setStartingBaseline(true)
    try {
      const res = await apiClient.post('/api/Assessments/track-baseline/start', {
        careerPathTrackId: selectedTrack.id,
        declaredProficiencyLevel: parseInt(baselineLevel)
      })
      toast.success('Track baseline assessment initialized!')
      setIsBaselineModalOpen(false)
      navigate('/dashboard/assessments', { state: { baselineBatches: res } })
    } catch {
      toast.error('Failed to start track baseline assessment.')
    } finally {
      setStartingBaseline(false)
    }
  }

  // --- CATALOG BROWSING VIEW ---
  if (isBrowsing) {
    return (
      <CatalogBrowser 
        globalPaths={globalPaths}
        assignedCareerPaths={assignedCareerPaths}
        loadingGlobal={loadingGlobal}
        onBackToMyPaths={() => setIsBrowsing(false)}
        onPreview={handlePreview}
        previewPath={previewPath}
        previewDetails={previewDetails}
        loadingPreview={loadingPreview}
        onAssignPath={handleAssignPath}
        isAssigning={isAssigning}
        onClosePreview={() => { setPreviewPath(null); setPreviewDetails(null) }}
      />
    )
  }

  // --- EMPTY STATE (No Active Paths) ---
  if (!assignedCareerPaths || assignedCareerPaths.length === 0) {
    return (
      <div className="dash-section fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="solid-card" style={{ textAlign: 'center', maxWidth: '440px', padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0, 180, 216, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--matrix-primary)' }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Embark on a Career Path</h2>
          <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
            No active career paths assigned to your profile yet. Browse the catalog to pick your engineering or product roadmap.
          </p>
          <button className="btn btn-primary" onClick={() => setIsBrowsing(true)} style={{ width: '100%' }}>
            Browse Career Path Catalog
          </button>
        </div>
      </div>
    )
  }

  // --- ACTIVE CAREER PATH PROGRESS VIEW ---
  const assignedInfo = assignedCareerPaths.find(p => p.careerPathId === selectedAssignedId || p.id === selectedAssignedId) || assignedCareerPaths[0]

  return (
    <div className="dash-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="dash-section-title">{assignedInfo?.title || 'Active Career Path'}</h2>
          <p className="dashboard-section-subtitle" style={{ maxWidth: '700px' }}>
            {assignedInfo?.description || 'Track your progress along milestones and master key target skills.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setIsBrowsing(true)}>
            Browse Catalog
          </button>
          {assignedCareerPaths.length > 1 && (
            <select 
              className="form-input" 
              value={selectedAssignedId || ''} 
              onChange={e => {
                setSelectedAssignedId(e.target.value)
                setSelectedTrack(null)
              }}
              style={{ width: 'auto', minWidth: '200px', margin: 0 }}
            >
              {assignedCareerPaths.map(p => (
                <option key={p.id || p.careerPathId} value={p.careerPathId || p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="solid-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <span>Overall Path Progress</span>
          <span style={{ color: 'var(--matrix-primary)' }}>{assignedInfo?.progressPercentage || 0}% Completed</span>
        </div>
        <div className="dash-progress-bar-container">
          <div className="dash-progress-bar" style={{ height: '10px' }}>
            <div 
              className="dash-progress-fill" 
              style={{ width: `${assignedInfo?.progressPercentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Mapping milestone stages...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.2fr)', gap: '1.5rem' }}>
          
          {/* Left Column: Milestones Stepping Stones Timeline */}
          <div className="solid-card" style={{ padding: '1.5rem', maxHeight: '650px', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Path Milestones & Tracks</h3>
            
            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
              {/* Timeline Line */}
              <div style={{ position: 'absolute', left: '23px', top: '10px', bottom: '20px', width: '2px', backgroundColor: 'var(--matrix-border)' }}></div>
              
              {finalTracks.map((track, idx) => (
                <div 
                  key={track.id} 
                  style={{ 
                    position: 'relative', 
                    paddingLeft: '2.5rem', 
                    marginBottom: '1.5rem', 
                    cursor: track.state === 'locked' ? 'not-allowed' : 'pointer',
                    opacity: track.state === 'locked' ? 0.5 : 1
                  }}
                  onClick={() => {
                    if (track.state !== 'locked') setSelectedTrack(track)
                  }}
                >
                  {/* Circle Node Icon */}
                  <div style={{
                    position: 'absolute',
                    left: '-2px',
                    top: '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: track.state === 'completed' ? '#10b981' : track.state === 'active' ? 'var(--matrix-primary)' : 'var(--matrix-bg-alt)',
                    border: track.state === 'locked' ? '2px solid var(--matrix-border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: track.state === 'active' ? '0 0 0 4px rgba(0, 180, 216, 0.2)' : 'none'
                  }}>
                    {track.state === 'completed' && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>}
                    {track.state === 'active' && <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                  </div>
                  
                  {/* Track Info Card */}
                  <div style={{ 
                    backgroundColor: selectedTrack?.id === track.id ? 'rgba(0, 180, 216, 0.1)' : 'var(--matrix-bg-alt)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: `1px solid ${selectedTrack?.id === track.id ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`
                  }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: track.state === 'active' ? 'var(--matrix-primary)' : '#fff' }}>
                      Stage {idx + 1}: {track.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--matrix-text-muted)', lineHeight: 1.4 }}>{track.description}</p>
                  </div>
                </div>
              ))}
              
              {finalTracks.length === 0 && (
                <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem' }}>No milestone tracks configured for this path.</p>
              )}
            </div>
          </div>

          {/* Right Column: Track Detail Pane & Required Skills */}
          {selectedTrack && (
            <div className="solid-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
                  <span className="badge-pill" style={{ backgroundColor: selectedTrack.state === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(0,180,216,0.1)', color: selectedTrack.state === 'completed' ? '#10b981' : 'var(--matrix-primary)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                    {selectedTrack.state.toUpperCase()} STAGE
                  </span>
                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.3rem' }}>{selectedTrack.name}</h3>
                  <p style={{ margin: 0, color: 'var(--matrix-text-muted)', fontSize: '0.9rem' }}>{selectedTrack.description}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--matrix-primary)' }}>
                    Required Skills ({selectedTrack.skills?.length || 0})
                  </h4>
                  {selectedTrack.state === 'active' && selectedTrack.skills?.length > 0 && (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => setIsBaselineModalOpen(true)}
                    >
                      ⚡ Start Track Baseline
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {selectedTrack.skills?.map(reqSkill => {
                    const userSkill = (allSkills || []).find(s => s.skillId === reqSkill.id || s.id === reqSkill.id)
                    const targetLevelStr = reqSkill.proficiencyLevel || 'Proficient'
                    const currentLevelStr = userSkill?.proficiencyLevel || 'Unassigned'
                    
                    const levelRanks = { 'Novice': 0, 'Beginner': 1, 'Intermediate': 2, 'Proficient': 3, 'Expert': 4 }
                    const targetRank = levelRanks[targetLevelStr] ?? 3
                    const currentRank = levelRanks[currentLevelStr] ?? -1
                    const isMastered = userSkill?.isFullyMastered || (currentRank >= targetRank)
                    
                    return (
                      <div key={reqSkill.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.85rem 1rem', 
                        backgroundColor: 'var(--matrix-bg-alt)', 
                        borderRadius: '8px', 
                        border: `1px solid ${isMastered ? '#10b981' : 'var(--matrix-border)'}`
                      }}>
                        <div>
                          <h5 style={{ margin: '0 0 0.3rem 0', fontSize: '0.95rem', color: 'var(--matrix-text-primary)' }}>{reqSkill.name}</h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--matrix-primary)', backgroundColor: 'rgba(0,180,216,0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 500 }}>
                              Target: {targetLevelStr}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>
                              My Level: <strong style={{ color: currentLevelStr === 'Unassigned' ? 'var(--matrix-text-muted)' : (proficiencyColor ? proficiencyColor(currentLevelStr) : 'var(--matrix-primary)') }}>{currentLevelStr}</strong>
                            </span>
                          </div>
                        </div>
                        
                        {isMastered ? (
                          <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                            Mastered
                          </span>
                        ) : (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => navigate('/dashboard/skills')}
                          >
                            {currentLevelStr === 'Unassigned' ? 'Assign Skill' : 'Check Skill'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {(!selectedTrack.skills || selectedTrack.skills.length === 0) && (
                    <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.875rem' }}>No specific skills mapped to this track yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Track Baseline Modal Component */}
      <TrackBaselineModal 
        isOpen={isBaselineModalOpen && !!selectedTrack}
        onClose={() => setIsBaselineModalOpen(false)}
        onSubmit={handleStartBaseline}
        selectedTrackName={selectedTrack?.name}
        baselineLevel={baselineLevel}
        setBaselineLevel={setBaselineLevel}
        startingBaseline={startingBaseline}
      />
    </div>
  )
}
