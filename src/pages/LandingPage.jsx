import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import AuthModal from '../components/AuthModal'
import SkillsShowcase from '../components/SkillsShowcase'
import LandingHeader from '../components/landing/LandingHeader'
import LandingHero from '../components/landing/LandingHero'
import LandingFeatures from '../components/landing/LandingFeatures'
import LandingFooter from '../components/landing/LandingFooter'

export default function LandingPage() {
  const [isGatewayOpen, setIsGatewayOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const setAuth = useAuthStore(state => state.setAuth)
  const navigate = useNavigate()

  const openAuthGateway = (mode) => {
    setAuthMode(mode)
    setIsGatewayOpen(true)
  }

  const closeAuthGateway = () => {
    setIsGatewayOpen(false)
  }

  // Called by AuthModal on successful login
  const handleLoginSuccess = (token, rememberMe = true, userData = null) => {
    setAuth(userData, token, rememberMe)
    closeAuthGateway()
    navigate('/dashboard')
  }

  return (
    <>
      {/* Global Navigation Component */}
      <LandingHeader onOpenAuth={openAuthGateway} />

      {/* Main Container */}
      <main className="main-layout">
        {/* Section 1: Hero & Live Simulator */}
        <LandingHero onOpenAuth={openAuthGateway} />

        {/* Section 2: Features Grid & How It Works */}
        <LandingFeatures />

        {/* Section 3: Interactive Skills Matrix Viewer */}
        <SkillsShowcase />

        {/* Section 4: CTA Panel */}
        <section className="cta-panel">
          <h2 className="cta-title">Your Skills Deserve More Than a Self-Assessment</h2>
          <p className="cta-desc">
            Join thousands of developers and engineering teams using SkillMatrix to measure, track, and accelerate technical growth with precision.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-accent" onClick={() => openAuthGateway('register')}>Create Free Account</button>
            <button className="btn btn-secondary" onClick={() => openAuthGateway('login')}>Sign In</button>
          </div>
        </section>
      </main>

      {/* Global Footer Component */}
      <LandingFooter />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isGatewayOpen}
        onClose={closeAuthGateway}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}
