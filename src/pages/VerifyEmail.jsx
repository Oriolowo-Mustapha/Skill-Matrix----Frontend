import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/axios'
import { toast } from 'react-hot-toast'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const executedRef = useRef(false)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (executedRef.current) return
    executedRef.current = true

    if (!token || !email) {
      setStatus('error')
      setErrorMessage('Invalid verification link. Token or Email parameter is missing.')
      return
    }

    async function verify() {
      try {
        await apiClient.get(`/api/auth/verify-email`, {
          params: { token, email }
        })
        setStatus('success')
        toast.success('Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setErrorMessage(
          err?.message || 'Verification failed. The link may have expired or already been used.'
        )
      }
    }

    verify()
  }, [token, email])

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--matrix-bg, #0A0F1D)',
        color: 'var(--matrix-text-primary, #F8FAFC)',
        padding: '2rem'
      }}
    >
      <div 
        className="solid-card fade-in"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: 'var(--matrix-surface, #131B2E)',
          borderRadius: '16px',
          border: '1px solid var(--matrix-border, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* State A: Loading Verifying */}
        {status === 'verifying' && (
          <div>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '4px solid rgba(18, 78, 120, 0.3)',
                borderTopColor: 'var(--matrix-primary, #124E78)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem auto'
              }}
            />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: 'var(--matrix-text-muted, #94A3B8)', fontSize: '0.95rem' }}>
              Please wait while we confirm your email address with Skill Matrix 2.0.
            </p>
          </div>
        )}

        {/* State B: Success */}
        {status === 'success' && (
          <div>
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 1.5rem auto',
                border: '2px solid #10b981'
              }}
            >
              ✓
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.75rem', color: '#10b981' }}>
              Email Verified Successfully!
            </h2>
            <p style={{ color: 'var(--matrix-text-muted, #94A3B8)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Your account for <strong>{email}</strong> has been activated. You can now log in to start taking skill assessments and managing your learning growth.
            </p>
            <button 
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 600 }}
              onClick={() => navigate('/')}
            >
              Proceed to Login →
            </button>
          </div>
        )}

        {/* State C: Error */}
        {status === 'error' && (
          <div>
            <div 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(215, 78, 9, 0.15)',
                color: 'var(--matrix-crimson, #D74E09)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                margin: '0 auto 1.5rem auto',
                border: '2px solid var(--matrix-crimson, #D74E09)'
              }}
            >
              ✖
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--matrix-text-primary, #F8FAFC)' }}>
              Verification Link Invalid or Expired
            </h2>
            <p style={{ color: 'var(--matrix-text-muted, #94A3B8)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              {errorMessage || 'This verification link may have expired (24h limit) or has already been used.'}
            </p>
            <button 
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
              onClick={() => navigate('/')}
            >
              Return to Home Page
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
