import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import apiClient from '../../api/axios'
import { toast } from 'react-hot-toast'

export default function Skills() {
  const { 
    allSkills, 
    proficiencyColor, 
    handleSelfAssign 
  } = useOutletContext()

  const navigate = useNavigate()

  // View States
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const [skillCategory, setSkillCategory] = useState('All')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [skillViewMode, setSkillViewMode] = useState('arsenal') // 'arsenal' or 'catalog'
  
  // Quick Assessment Modal State
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false)
  const [loadingCheck, setLoadingCheck] = useState(false)

  // Categories
  const uniqueCategories = ['All', ...new Set(Array.isArray(allSkills) ? allSkills.map(s => s.category).filter(Boolean) : [])]
  
  // Filtered List
  const filteredSkills = Array.isArray(allSkills) ? allSkills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
    const matchesCat = skillCategory === 'All' || s.category === skillCategory
    const isAssigned = !!s.proficiencyLevel || s.isAssigned
    const matchesMode = skillViewMode === 'arsenal' ? isAssigned : !isAssigned
    return matchesSearch && matchesCat && matchesMode
  }) : []

  const handleStartSkillCheck = async (e) => {
    e.preventDefault()
    if (!selectedSkill) return
    setLoadingCheck(true)
    try {
      const res = await apiClient.post('/api/Assessments/start', { assignedSkillId: selectedSkill.id })
      toast.success(`Skill assessment session initialized for ${selectedSkill.name}!`)
      setIsCheckModalOpen(false)
      navigate('/dashboard/assessments', { state: { assessment: res } })
    } catch {
      toast.error('Failed to start skill assessment.')
    } finally {
      setLoadingCheck(false)
    }
  }

  return (
    <div className="dash-skills-page fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Toolbar */}
      <div className="dash-skills-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Search */}
        <div className="dash-skills-search" style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--matrix-bg-alt)', border: '1px solid var(--matrix-border)', borderRadius: '8px', padding: '0.5rem 1rem' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--matrix-text-muted)', marginRight: '0.5rem' }}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search skills catalog or arsenal..." 
            value={skillSearchQuery}
            onChange={(e) => setSkillSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>

        {/* View Mode Toggle */}
        <div className="dash-skills-toggle" style={{ display: 'flex', backgroundColor: 'var(--matrix-bg-alt)', borderRadius: '8px', padding: '4px', border: '1px solid var(--matrix-border)' }}>
          <button 
            className={`btn ${skillViewMode === 'arsenal' ? 'btn-primary' : ''}`}
            onClick={() => { setSkillViewMode('arsenal'); setSelectedSkill(null); }}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', background: skillViewMode === 'arsenal' ? 'var(--matrix-primary)' : 'transparent', color: skillViewMode === 'arsenal' ? '#fff' : 'var(--matrix-text-muted)' }}
          >
            My Arsenal
          </button>
          <button 
            className={`btn ${skillViewMode === 'catalog' ? 'btn-primary' : ''}`}
            onClick={() => { setSkillViewMode('catalog'); setSelectedSkill(null); }}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', background: skillViewMode === 'catalog' ? 'var(--matrix-primary)' : 'transparent', color: skillViewMode === 'catalog' ? '#fff' : 'var(--matrix-text-muted)' }}
          >
            Skill Catalog (Self-Assign)
          </button>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="dash-skills-categories" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {uniqueCategories.map(cat => (
          <button 
            key={cat} 
            className={`btn ${skillCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSkillCategory(cat)}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              borderRadius: '20px',
              backgroundColor: skillCategory === cat ? 'rgba(0, 180, 216, 0.2)' : 'var(--matrix-bg-alt)',
              borderColor: skillCategory === cat ? 'var(--matrix-primary)' : 'var(--matrix-border)',
              color: skillCategory === cat ? 'var(--matrix-primary)' : 'var(--matrix-text-muted)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Split Grid */}
      <div className="dash-skills-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: '1.25rem' }}>
        
        {/* Left Pane: Skill List */}
        <div className="solid-card" style={{ padding: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {skillViewMode === 'arsenal' ? 'Tracked Skills' : 'Available for Self-Assignment'} ({filteredSkills.length})
          </h4>

          {filteredSkills.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredSkills.map(skill => (
                <div 
                  key={skill.id} 
                  onClick={() => setSelectedSkill(skill)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: selectedSkill?.id === skill.id ? 'rgba(0, 180, 216, 0.15)' : 'var(--matrix-bg-alt)',
                    border: `1px solid ${selectedSkill?.id === skill.id ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', color: 'var(--matrix-primary)' }}>{skill.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>{skill.category || 'General'}</span>
                  </div>
                  {skill.proficiencyLevel ? (
                    <span className="badge-pill" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'rgba(0,0,0,0.3)', color: proficiencyColor ? proficiencyColor(skill.proficiencyLevel) : 'var(--matrix-primary)' }}>
                      {skill.proficiencyLevel}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--matrix-primary)' }}>+ Assign</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty-state" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem' }}>
                {skillViewMode === 'arsenal' 
                  ? 'No skills in your arsenal matching this filter.' 
                  : 'All matching skills are already in your arsenal!'}
              </p>
            </div>
          )}
        </div>

        {/* Right Pane: Skill Details & Action */}
        <div className="solid-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '400px' }}>
          {selectedSkill ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem' }}>{selectedSkill.name}</h2>
                  <span className="badge-pill" style={{ backgroundColor: 'var(--matrix-bg-alt)', fontSize: '0.8rem', color: 'var(--matrix-text-muted)' }}>
                    Category: {selectedSkill.category || 'General'}
                  </span>
                </div>
                {selectedSkill.proficiencyLevel && (
                  <div style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: `1px solid ${proficiencyColor ? proficiencyColor(selectedSkill.proficiencyLevel) : 'var(--matrix-primary)'}`, color: proficiencyColor ? proficiencyColor(selectedSkill.proficiencyLevel) : 'var(--matrix-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                    {selectedSkill.proficiencyLevel}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--matrix-primary)', fontSize: '0.9rem' }}>Overview & Scope</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--matrix-text-muted)', lineHeight: 1.6 }}>
                    This skill covers key competencies in the <strong>{selectedSkill.category || 'General'}</strong> domain. Demonstrating proficiency in {selectedSkill.name} advances your position along organizational career tracks.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--matrix-primary)', fontSize: '0.9rem' }}>Proficiency Levels</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--matrix-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <li><strong>Novice / Beginner:</strong> Foundational syntax and basic usage.</li>
                    <li><strong>Intermediate:</strong> Practical application in project workflows.</li>
                    <li><strong>Proficient / Expert:</strong> Advanced optimization, architecture, and mentoring.</li>
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--matrix-border)', display: 'flex', gap: '1rem' }}>
                {!selectedSkill.proficiencyLevel && !selectedSkill.isAssigned ? (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleSelfAssign(selectedSkill.id)}>
                    + Self-Assign to My Arsenal
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsCheckModalOpen(true)}>
                    ⚡ Take Skill Check Assessment
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="dash-empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem 1rem' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--matrix-border)', marginBottom: '1rem' }}>
                <path d="M15 15l5-5m0 0l-5-5m5 5H4"></path>
              </svg>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Select a Skill</h3>
              <p style={{ margin: 0, color: 'var(--matrix-text-muted)', fontSize: '0.875rem' }}>
                Choose any skill from the list on the left to inspect its details, assign it, or trigger a skill check.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Skill Check Assessment Modal */}
      {isCheckModalOpen && selectedSkill && (
        <div className="modal-overlay" onClick={() => setIsCheckModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '90%' }}>
            <button className="modal-close" onClick={() => setIsCheckModalOpen(false)}>&times;</button>
            <h3 className="modal-title" style={{ marginBottom: '1rem' }}>Skill Check: {selectedSkill.name}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--matrix-text-muted)', marginBottom: '1.25rem' }}>
              Test your current understanding of <strong>{selectedSkill.name}</strong> to update your proficiency matrix level.
            </p>
            <form onSubmit={handleStartSkillCheck} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loadingCheck}>
                {loadingCheck ? 'Starting Session...' : 'Begin Assessment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
