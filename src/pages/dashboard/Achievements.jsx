import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import apiClient from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'
import EndorsePeerModal from '../../components/achievements/EndorsePeerModal'

export default function Achievements() {
  const { badges, allSkills } = useOutletContext()
  const { user } = useAuthStore()

  // State
  const [globalBadges, setGlobalBadges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  // Endorse Peer Modal State
  const [isEndorseModalOpen, setIsEndorseModalOpen] = useState(false)
  const [receiverId, setReceiverId] = useState('')
  const [skillId, setSkillId] = useState('')
  const [teamMembers, setTeamMembers] = useState([])
  const [endorsing, setEndorsing] = useState(false)

  // Fetch Catalog, Leaderboard & Roster
  useEffect(() => {
    async function loadAchievementsData() {
      setLoading(true)
      try {
        const [allBadgesRes, leaderboardRes, teamRes] = await Promise.allSettled([
          apiClient.get('/api/Badges'),
          user?.organizationId ? apiClient.get(`/api/Gamification/leaderboard/${user.organizationId}`) : Promise.resolve([]),
          apiClient.get('/api/Teams/members')
        ])

        if (allBadgesRes.status === 'fulfilled') setGlobalBadges(allBadgesRes.value || [])
        if (leaderboardRes.status === 'fulfilled') setLeaderboard(leaderboardRes.value || [])
        if (teamRes.status === 'fulfilled') setTeamMembers(teamRes.value || [])
      } catch {
        toast.error('Failed to load leaderboard data.')
      } finally {
        setLoading(false)
      }
    }

    loadAchievementsData()
  }, [user?.organizationId])

  // Handle Endorsement submission
  const handleEndorseSubmit = async (e) => {
    e.preventDefault()
    if (!receiverId || !skillId) return
    setEndorsing(true)
    try {
      await apiClient.post('/api/Gamification/endorse', {
        receiverId,
        skillId
      }, { showSuccessToast: true })

      toast.success('Peer endorsement sent!')
      setIsEndorseModalOpen(false)
    } catch {
      toast.error('Failed to submit peer endorsement.')
    } finally {
      setEndorsing(false)
    }
  }

  const unlockedBadgeIds = new Set((badges || []).map(b => b.id || b.badgeId))

  return (
    <div className="dash-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="dash-section-title">Achievements & Leaderboard</h2>
          <p className="dashboard-section-subtitle">Track unlocked badges, recognize peer achievements, and view organization rankings.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsEndorseModalOpen(true)}>
          👏 Endorse a Peer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(300px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Badges & Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Unlocked Badges Showcase */}
          <div className="solid-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: 'var(--matrix-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏆 Unlocked Badges ({badges?.length || 0})
            </h3>
            
            {Array.isArray(badges) && badges.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                {badges.map(b => (
                  <div key={b.id || b.badgeId} style={{ backgroundColor: 'var(--matrix-bg-alt)', borderRadius: '10px', padding: '1rem', textAlign: 'center', border: '1px solid var(--matrix-border)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(0,180,216,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', fontSize: '1.5rem' }}>
                      {b.iconUrl ? <img src={b.iconUrl} alt={b.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🎖️'}
                    </div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: 'var(--matrix-text-primary)' }}>{b.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>{b.category || 'Achievement'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty-state" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem' }}>No badges unlocked yet. Complete skill assessments to earn recognition.</p>
              </div>
            )}
          </div>

          {/* Badge Catalog (Locked vs Unlocked) */}
          <div className="solid-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--matrix-text-primary)' }}>Badge Catalog</h3>
            {loading ? (
              <div className="dashboard-loading"><div className="spinner"></div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
                {globalBadges.map(gb => {
                  const isUnlocked = unlockedBadgeIds.has(gb.id)
                  return (
                    <div key={gb.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', backgroundColor: 'var(--matrix-bg-alt)', borderRadius: '8px', border: `1px solid ${isUnlocked ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`, opacity: isUnlocked ? 1 : 0.6 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isUnlocked ? 'rgba(99,16,188,0.15)' : 'var(--matrix-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        {isUnlocked ? '🔓' : '🔒'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.9rem', color: 'var(--matrix-text-primary)' }}>{gb.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>{gb.description || 'Complete requirements to unlock.'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Leaderboard Table */}
        <div className="solid-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '520px' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: 'var(--matrix-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌟 Organization Leaderboard
          </h3>

          {loading ? (
            <div className="dashboard-loading"><div className="spinner"></div></div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--matrix-border)' }}>
                    <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>RANK</th>
                    <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>MEMBER</th>
                    <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600, textAlign: 'right' }}>POINTS / XP</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, idx) => {
                      const isCurrentUser = entry.userId === user?.id || entry.userName === user?.userName
                      return (
                        <tr key={entry.userId || idx} style={{ borderBottom: '1px solid var(--matrix-border)', backgroundColor: isCurrentUser ? 'rgba(99,16,188,0.08)' : 'transparent' }}>
                          <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: idx === 0 ? '#d97706' : idx === 1 ? '#6b7280' : idx === 2 ? '#b45309' : 'var(--matrix-text-muted)' }}>
                            #{idx + 1}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500, color: 'var(--matrix-text-primary)' }}>
                            {entry.fullName || entry.userName} {isCurrentUser && '(You)'}
                          </td>
                          <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--matrix-primary)' }}>
                            {entry.totalPoints || entry.points || 0} XP
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--matrix-text-muted)' }}>
                        No leaderboard entries calculated for your organization yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Endorse Peer Modal Component */}
      <EndorsePeerModal 
        isOpen={isEndorseModalOpen}
        onClose={() => setIsEndorseModalOpen(false)}
        onSubmit={handleEndorseSubmit}
        receiverId={receiverId}
        setReceiverId={setReceiverId}
        skillId={skillId}
        setSkillId={setSkillId}
        teamMembers={teamMembers}
        allSkills={allSkills}
        currentUserId={user?.id}
        endorsing={endorsing}
      />

    </div>
  )
}
