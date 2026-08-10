export default function LandingFeatures() {
  return (
    <>
      <section id="features" className="section-wrapper">
        <div className="section-header">
          <span className="section-label">Why SkillMatrix</span>
          <h2 className="section-title">Built for Engineers Who Take Growth Seriously</h2>
          <p className="section-desc">
            Stop guessing where your gaps are. SkillMatrix gives you data-backed insights, structured learning plans, and the tools managers need to upskill their teams.
          </p>
        </div>
        <div className="features-grid">
          <div className="solid-card feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
            <h3 className="feature-title">Adaptive AI Assessments</h3>
            <p className="feature-desc">
              Questions that adapt to your level in real time. Whether you're a junior developer or a senior architect, every test is uniquely generated to challenge you where it matters most.
            </p>
          </div>

          <div className="solid-card feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 className="feature-title">Personalized Roadmaps</h3>
            <p className="feature-desc">
              After each assessment, receive a step-by-step improvement plan with focus topics, curated resources, and milestone checkpoints — so you always know what to study next.
            </p>
          </div>

          <div className="solid-card feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className="feature-title">Progress Analytics</h3>
            <p className="feature-desc">
              Track scores over time, earn achievement badges, and visualize your growth curve. Managers get a bird's-eye view of team-wide proficiency and can spot skill gaps instantly.
            </p>
          </div>

          <div className="solid-card feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>
            </div>
            <h3 className="feature-title">Team Management</h3>
            <p className="feature-desc">
              Organizations can onboard teams, assign specific skill assessments, and track every member's improvement journey from a single management dashboard.
            </p>
          </div>

          <div className="solid-card feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <h3 className="feature-title">Live Code Evaluation</h3>
            <p className="feature-desc">
              Go beyond multiple choice. SkillMatrix supports sandbox code execution during assessments — write real code, run it, and get evaluated on actual output correctness.
            </p>
          </div>

          <div className="solid-card feature-card">
            <div className="feature-icon-box">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3 className="feature-title">Career Path Guidance</h3>
            <p className="feature-desc">
              Map your current skill levels to industry career paths. See exactly which competencies you need to unlock to move from mid-level to senior, or from backend to full-stack.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-wrapper">
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Three Steps to Measurable Growth</h2>
          <p className="section-desc">
            Getting started takes less than two minutes. No credit card, no setup complexity — just sign up and take your first assessment.
          </p>
        </div>
        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="solid-card feature-card">
            <div className="feature-icon-box" style={{ borderColor: 'var(--matrix-primary)', color: 'var(--matrix-primary)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700 }}>01</span>
            </div>
            <h3 className="feature-title">Pick Your Track</h3>
            <p className="feature-desc">
              Choose from 120+ technology tracks spanning software engineering, cloud infrastructure, data science, AI systems, and more.
            </p>
          </div>
          <div className="solid-card feature-card">
            <div className="feature-icon-box" style={{ borderColor: 'var(--matrix-accent)', color: 'var(--matrix-accent)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700 }}>02</span>
            </div>
            <h3 className="feature-title">Take the Assessment</h3>
            <p className="feature-desc">
              Answer AI-generated questions that adapt in real time. Each test evaluates theory, practical application, and code execution skills.
            </p>
          </div>
          <div className="solid-card feature-card">
            <div className="feature-icon-box" style={{ borderColor: 'var(--matrix-primary)', color: 'var(--matrix-primary)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700 }}>03</span>
            </div>
            <h3 className="feature-title">Follow Your Roadmap</h3>
            <p className="feature-desc">
              Receive a detailed improvement plan with focus areas, learning resources, and milestone tasks. Retake assessments to measure real progress.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
