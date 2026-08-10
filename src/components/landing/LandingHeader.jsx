export default function LandingHeader({ onOpenAuth }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-brand" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--matrix-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
            <rect x="3" y="3" width="6" height="6" rx="1" fill="var(--matrix-primary)"></rect>
            <rect x="15" y="3" width="6" height="6" rx="1"></rect>
            <rect x="9" y="15" width="6" height="6" rx="1"></rect>
            <path d="M9 6h6M6 9v6M18 9v6" stroke="var(--matrix-border-hover)" strokeWidth="1.5"></path>
          </svg>
          <span>SkillMatrix</span>
        </div>
        <ul className="nav-menu">
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><a href="#matrix-showcase" className="nav-link">Skill Tracks</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn btn-secondary" onClick={() => onOpenAuth('login')}>Login</button>
          <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>Get Started</button>
        </div>
      </div>
    </nav>
  )
}
