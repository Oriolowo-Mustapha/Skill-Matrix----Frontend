import React from 'react'

export default function MemberOverviewDetail({ data }) {
  if (!data) return null

  const {
    firstName = '',
    lastName = '',
    email = '',
    role = '',
    profilePictureUrl = '',
    dateJoined = '',
    totalPoints = 0,
    totalAssignedSkills = 0,
    masteredSkillsCount = 0,
    inProgressSkillsCount = 0,
    skills = [],
    careerPaths = [],
    totalAssessmentsTaken = 0,
    averageAssessmentScore = 0,
    recentAssessments = [],
    improvementPlans = []
  } = data

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'TM'
  const formattedJoinedDate = dateJoined ? new Date(dateJoined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header Profile Banner Card */}
      <div className="solid-card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--matrix-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0, boxShadow: 'var(--shadow-flat)' }}>
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt={`${firstName} ${lastName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--matrix-text-primary)' }}>
              {firstName} {lastName}
            </h2>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--matrix-text-muted)' }}>
              {email} • <span style={{ textTransform: 'capitalize' }}>{role.replace('_', ' ')}</span>
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--matrix-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              📅 Member since {formattedJoinedDate}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', backgroundColor: 'var(--matrix-bg-alt)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--matrix-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--matrix-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Experience</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--matrix-xp)', fontFamily: 'var(--font-mono)' }}>
              ⚡ {totalPoints.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="solid-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--matrix-text-muted)', textTransform: 'uppercase' }}>Assigned Skills</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: 'var(--matrix-primary)' }}>{totalAssignedSkills}</h3>
        </div>

        <div className="solid-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--matrix-text-muted)', textTransform: 'uppercase' }}>Mastered Skills</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: 'var(--matrix-mastery)' }}>{masteredSkillsCount}</h3>
        </div>

        <div className="solid-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--matrix-text-muted)', textTransform: 'uppercase' }}>In Progress</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: 'var(--matrix-xp)' }}>{inProgressSkillsCount}</h3>
        </div>

        <div className="solid-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--matrix-text-muted)', textTransform: 'uppercase' }}>Avg. Test Score</span>
          <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: 'var(--matrix-primary)' }}>{averageAssessmentScore}%</h3>
        </div>
      </div>

      {/* 3. Main 2-Column Details Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
        
        {/* Left Column: Career Paths & Skills Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Active Career Paths */}
          <div className="solid-card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--matrix-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Active Career Pathways ({careerPaths.length})
            </h3>
            {careerPaths.length === 0 ? (
              <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', margin: 0 }}>No career pathways assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {careerPaths.map(path => (
                  <div key={path.careerPathId || path.id} style={{ backgroundColor: 'var(--matrix-bg-alt)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--matrix-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--matrix-text-primary)' }}>{path.title}</h4>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--matrix-primary)' }}>{path.progressPercentage}%</span>
                    </div>
                    <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: 'var(--matrix-text-muted)', lineHeight: 1.4 }}>{path.description}</p>
                    <div className="dash-progress-bar-container">
                      <div className="dash-progress-bar" style={{ height: '8px' }}>
                        <div className="dash-progress-fill" style={{ width: `${path.progressPercentage}%`, backgroundColor: 'var(--matrix-primary)' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Matrix Directory Table */}
          <div className="solid-card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--matrix-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📚 Assigned Skill Matrix ({skills.length})
            </h3>
            {skills.length === 0 ? (
              <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', margin: 0 }}>No skills assigned yet.</p>
            ) : (
              <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--matrix-border)' }}>
                      <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>SKILL</th>
                      <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>CATEGORY</th>
                      <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>PROFICIENCY</th>
                      <th style={{ padding: '0.75rem', color: 'var(--matrix-text-muted)', fontWeight: 600, textAlign: 'right' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map(skill => (
                      <tr key={skill.skillId || skill.id} style={{ borderBottom: '1px solid var(--matrix-border)' }}>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--matrix-text-primary)' }}>{skill.name}</td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <span className="badge-pill" style={{ backgroundColor: 'var(--matrix-bg-alt)', fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>
                            {skill.category || 'General'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--matrix-primary)' }}>{skill.proficiencyLevel || 'Beginner'}</td>
                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                          {skill.isFullyMastered ? (
                            <span className="badge-pill" style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: 'var(--matrix-mastery)', border: '1px solid var(--matrix-mastery)', fontSize: '0.75rem' }}>
                              ✓ Mastered
                            </span>
                          ) : (
                            <span className="badge-pill" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: 'var(--matrix-xp)', border: '1px solid var(--matrix-xp)', fontSize: '0.75rem' }}>
                              In Progress
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Assessments & Improvement Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Recent Assessments History */}
          <div className="solid-card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--matrix-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📝 Recent Assessment History ({recentAssessments.length})
            </h3>
            {recentAssessments.length === 0 ? (
              <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', margin: 0 }}>No assessments taken yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {recentAssessments.map(item => {
                  const testDate = item.dateTaken ? new Date(item.dateTaken).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
                  return (
                    <div key={item.assessmentResultId || item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'var(--matrix-bg-alt)', borderRadius: '10px', border: '1px solid var(--matrix-border)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--matrix-text-primary)' }}>{item.skillName}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--matrix-text-muted)' }}>
                          Score: {item.noOfCorrectAnswers}/{item.totalQuestions} correct • Level: {item.achievedLevel} {testDate && `• ${testDate}`}
                        </p>
                      </div>
                      <div style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', backgroundColor: item.score >= 80 ? 'rgba(16,185,129,0.12)' : 'rgba(99,16,188,0.12)', color: item.score >= 80 ? 'var(--matrix-mastery)' : 'var(--matrix-primary)', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                        {item.score}%
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Growth & Improvement Plans Progress */}
          <div className="solid-card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--matrix-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🚀 Growth Improvement Plans ({improvementPlans.length})
            </h3>
            {improvementPlans.length === 0 ? (
              <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', margin: 0 }}>No active growth plans generated.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {improvementPlans.map(plan => {
                  const planProgress = plan.totalTasks > 0 ? Math.round((plan.completedTasks / plan.totalTasks) * 100) : 0
                  return (
                    <div key={plan.id} style={{ backgroundColor: 'var(--matrix-bg-alt)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--matrix-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.4rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--matrix-text-primary)' }}>{plan.focusArea}</h4>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--matrix-primary)' }}>{planProgress}%</span>
                      </div>
                      <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: 'var(--matrix-text-muted)', lineHeight: 1.4 }}>
                        {plan.GeneratedSummary || plan.generatedSummary || 'Personalized skill roadmap'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--matrix-text-muted)' }}>
                        <span>Tasks Completed: {plan.completedTasks}/{plan.totalTasks}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
