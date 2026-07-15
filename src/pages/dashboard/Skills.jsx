import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'

export default function Skills() {
  const { 
    allSkills, 
    proficiencyColor, 
    handleSelfAssign 
  } = useOutletContext()

  const navigate = useNavigate()

  // Skills Tab States
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const [skillCategory, setSkillCategory] = useState('All')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [skillViewMode, setSkillViewMode] = useState('arsenal') // 'arsenal' or 'catalog'

  // Derived State
  const uniqueCategories = ['All', ...new Set(Array.isArray(allSkills) ? allSkills.map(s => s.category).filter(Boolean) : [])];
  
  const filteredSkills = Array.isArray(allSkills) ? allSkills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(skillSearchQuery.toLowerCase());
    const matchesCat = skillCategory === 'All' || s.category === skillCategory;
    const isAssigned = !!s.proficiencyLevel;
    const matchesMode = skillViewMode === 'arsenal' ? isAssigned : !isAssigned;
    return matchesSearch && matchesCat && matchesMode;
  }) : [];

  return (
    <div className="dash-skills-page">
      {/* Top Bar: Search & View Toggle */}
      <div className="dash-skills-toolbar">
        <div className="dash-skills-search">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search skills..." 
            value={skillSearchQuery}
            onChange={(e) => setSkillSearchQuery(e.target.value)}
          />
        </div>
        <div className="dash-skills-toggle">
          <button 
            className={skillViewMode === 'arsenal' ? 'active' : ''} 
            onClick={() => { setSkillViewMode('arsenal'); setSelectedSkill(null); }}
          >
            My Arsenal
          </button>
          <button 
            className={skillViewMode === 'catalog' ? 'active' : ''} 
            onClick={() => { setSkillViewMode('catalog'); setSelectedSkill(null); }}
          >
            Skill Catalog
          </button>
        </div>
      </div>

      {/* Categories Pills */}
      <div className="dash-skills-categories">
        {uniqueCategories.map(cat => (
          <button 
            key={cat} 
            className={`dash-cat-pill ${skillCategory === cat ? 'active' : ''}`}
            onClick={() => setSkillCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Split Layout Content */}
      <div className="dash-skills-split">
        {/* Left Pane: List */}
        <div className="dash-skills-list-pane solid-card">
          {filteredSkills.length > 0 ? (
            <div className="dash-slist">
              {filteredSkills.map(skill => (
                <div 
                  key={skill.id} 
                  className={`dash-slist-item ${selectedSkill?.id === skill.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <div className="dash-slist-info">
                    <h4>{skill.name}</h4>
                    <span>{skill.category || 'General'}</span>
                  </div>
                  {skill.proficiencyLevel && (
                    <span className="dash-slist-badge" style={{ color: proficiencyColor(skill.proficiencyLevel) }}>
                      {skill.proficiencyLevel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="dash-empty-state" style={{ border: 'none', padding: '2rem 1rem' }}>
              <p>No skills found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Right Pane: Details */}
        <div className="dash-skills-detail-pane solid-card">
          {selectedSkill ? (
            <div className="dash-sdetail-content">
              <div className="dash-sdetail-header">
                <div>
                  <h2>{selectedSkill.name}</h2>
                  <span className="dash-sdetail-category">{selectedSkill.category || 'General'}</span>
                </div>
                {selectedSkill.proficiencyLevel && (
                  <div className="dash-sdetail-level" style={{ borderColor: proficiencyColor(selectedSkill.proficiencyLevel), color: proficiencyColor(selectedSkill.proficiencyLevel) }}>
                    {selectedSkill.proficiencyLevel}
                  </div>
                )}
              </div>
              
              <div className="dash-sdetail-body">
                <div className="dash-sdetail-section">
                  <h3>Description</h3>
                  <p>This is a core skill in the {selectedSkill.category || 'General'} domain. Mastering {selectedSkill.name} is essential for advancing in your technical career path and contributing effectively to high-impact projects.</p>
                </div>
                
                <div className="dash-sdetail-section">
                  <h3>What it takes to master</h3>
                  <ul>
                    <li>Understand the core principles and underlying architecture.</li>
                    <li>Complete 3 hands-on projects utilizing {selectedSkill.name}.</li>
                    <li>Pass the official internal assessment or external certification.</li>
                  </ul>
                </div>
              </div>
              
              <div className="dash-sdetail-actions">
                {!selectedSkill.proficiencyLevel ? (
                  <button className="btn btn-primary" onClick={() => handleSelfAssign(selectedSkill.id)}>
                    + Assign to Me
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={() => navigate('/dashboard/plans')}>
                    Assess / Improve
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="dash-empty-state" style={{ height: '100%', border: 'none' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--matrix-border)', marginBottom: '1rem' }}><path d="M15 15l5-5m0 0l-5-5m5 5H4"></path></svg>
              <p>Select a skill from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
