import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../../api/axios'

export default function Assessments() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // The backend returns an array of StartAssessmentResponseDTO for a baseline
  // If it's a single test, we can wrap it in an array to unify the UI
  const [batches, setBatches] = useState([])
  
  // Progress tracking
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  
  // Store answers: { [batchId]: { [questionId]: answerValue } }
  const [answers, setAnswers] = useState({})
  
  // UI State
  const [submitting, setSubmitting] = useState(false)
  const [completedBatches, setCompletedBatches] = useState([])
  const [allDone, setAllDone] = useState(false)

  useEffect(() => {
    // Check if we arrived with baselineBatches in state
    if (location.state?.baselineBatches) {
      const b = Array.isArray(location.state.baselineBatches) ? location.state.baselineBatches : [location.state.baselineBatches]
      setBatches(b)
      
      // Initialize answer storage
      const initialAnswers = {}
      b.forEach(batch => {
        initialAnswers[batch.assessmentBatchId] = {}
      })
      setAnswers(initialAnswers)
    } else {
      // If we landed here without state, redirect back to careers
      navigate('/dashboard/careers')
    }
  }, [location.state, navigate])

  if (batches.length === 0) {
    return (
      <div className="dashboard-loading" style={{ margin: '3rem auto' }}>
        <div className="spinner"></div>
        <p>Loading your assessment...</p>
      </div>
    )
  }

  if (allDone) {
    return (
      <div className="dash-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="dash-empty-state" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--matrix-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'white' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Baseline Complete!</h2>
          <p style={{ color: 'var(--matrix-text-muted)', marginBottom: '2rem' }}>
            You have successfully completed all skill assessments in this track. We are analyzing your results and building your custom improvement plan.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/careers')} style={{ width: '100%' }}>
            Return to Career Paths
          </button>
        </div>
      </div>
    )
  }

  const currentBatch = batches[currentBatchIndex]
  const currentQuestion = currentBatch?.questions?.[currentQuestionIndex]
  const isLastQuestionInBatch = currentQuestionIndex === (currentBatch?.questions?.length || 0) - 1
  const isLastBatch = currentBatchIndex === batches.length - 1

  const handleSelectOption = (optionId) => {
    setAnswers(prev => ({
      ...prev,
      [currentBatch.assessmentBatchId]: {
        ...prev[currentBatch.assessmentBatchId],
        [currentQuestion.id]: { selectedOptionId: optionId }
      }
    }))
  }

  const handleSubmitBatch = async () => {
    setSubmitting(true)
    try {
      // Format answers for API
      const batchAnswers = answers[currentBatch.assessmentBatchId]
      const userAnswers = Object.keys(batchAnswers).map(qId => ({
        assessmentQuestionId: parseInt(qId),
        selectedOptionId: batchAnswers[qId].selectedOptionId,
        submittedCode: batchAnswers[qId].submittedCode || null
      }))

      await apiClient.post('/api/Assessments/submit', {
        assessmentBatchId: currentBatch.assessmentBatchId,
        userAnswers: userAnswers
      })

      setCompletedBatches(prev => [...prev, currentBatch.assessmentBatchId])

      if (isLastBatch) {
        setAllDone(true)
      } else {
        setCurrentBatchIndex(prev => prev + 1)
        setCurrentQuestionIndex(0)
      }
    } catch (err) {
      console.error('Failed to submit assessment', err)
      alert('Failed to submit your answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (isLastQuestionInBatch) {
      handleSubmitBatch()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const currentAnswer = answers[currentBatch?.assessmentBatchId]?.[currentQuestion?.id]
  const canProceed = !!currentAnswer

  return (
    <div className="dash-section" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
      <div className="dash-section-header">
        <h2 className="dash-section-title">Unified Track Baseline Assessment</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Complete each skill module to establish your baseline proficiency.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, alignItems: 'flex-start' }}>
        
        {/* Sidebar: Baseline Progress */}
        <div className="solid-card" style={{ width: '280px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--matrix-border)', paddingBottom: '0.75rem' }}>Assessment Modules</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {batches.map((batch, idx) => {
              const isActive = idx === currentBatchIndex
              const isCompleted = completedBatches.includes(batch.assessmentBatchId)
              
              return (
                <div key={batch.assessmentBatchId} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  border: isActive ? '1px solid var(--matrix-primary)' : '1px solid transparent',
                  opacity: (!isActive && !isCompleted) ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    background: isCompleted ? 'var(--matrix-accent)' : isActive ? 'var(--matrix-primary)' : 'var(--matrix-surface)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {isCompleted ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg> : (idx + 1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--matrix-primary)' : 'var(--matrix-text-primary)' }}>
                      Skill Module {idx + 1}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>
                      {batch.questions?.length} Questions
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Arena: Question View */}
        {currentQuestion && (
          <div className="solid-card" style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--matrix-primary)', fontWeight: 600, background: 'rgba(79, 70, 229, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                Question {currentQuestionIndex + 1} of {currentBatch.questions.length}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--matrix-text-muted)' }}>
                Time Limit: {currentBatch.timeLimitMinutes} mins
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.5 }}>
              {currentQuestion.questionText}
            </h3>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {currentQuestion.options?.map(opt => {
                const isSelected = currentAnswer?.selectedOptionId === opt.id
                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--matrix-surface)',
                      border: isSelected ? '2px solid var(--matrix-primary)' : '1px solid var(--matrix-border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      border: isSelected ? '6px solid var(--matrix-primary)' : '2px solid var(--matrix-border)',
                      transition: 'all 0.2s ease'
                    }} />
                    <span style={{ fontSize: '1rem', fontWeight: isSelected ? 600 : 400, color: 'var(--matrix-text-primary)' }}>
                      {opt.optionText}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Footer Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--matrix-border)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || submitting}
              >
                Previous
              </button>
              
              <button 
                className="btn btn-primary" 
                onClick={handleNext}
                disabled={!canProceed || submitting}
              >
                {submitting ? 'Submitting...' : isLastQuestionInBatch ? (isLastBatch ? 'Finish Baseline' : 'Submit & Next Skill') : 'Next Question'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
