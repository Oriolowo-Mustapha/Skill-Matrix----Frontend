import Simulator from '../Simulator'

export default function LandingHero({ onOpenAuth }) {
  return (
    <section className="hero-grid">
      <div className="hero-info">
        <div className="badge-pill">AI-Powered Learning Platform</div>
        <h1 className="hero-title">
          Know Exactly <br />
          <span className="text-gradient">Where You Stand</span>
        </h1>
        <p className="hero-description">
          SkillMatrix uses intelligent assessments to pinpoint your technical strengths and weaknesses, then builds a personalized roadmap to get you to the next level — whether you're a solo developer or managing a team of fifty.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>Start Free Assessment</button>
          <a className="btn btn-secondary" href="#simulator">
            Try Live Demo
          </a>
        </div>
        
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">120+</span>
            <span className="stat-label">Skill Tracks Available</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15K+</span>
            <span className="stat-label">Assessments Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">User Satisfaction</span>
          </div>
        </div>
      </div>

      <Simulator onAuthTrigger={onOpenAuth} />
    </section>
  )
}
