import { useState } from 'react'

const SIMULATOR_QUESTIONS = [
  {
    id: 'q1',
    category: 'Architecture',
    question: 'Which architectural layer contains pure domain entities and business rules with zero external dependencies?',
    options: [
      'Infrastructure Layer',
      'Presentation API Layer',
      'Domain Layer',
      'Application Layer'
    ],
    correctIndex: 2
  },
  {
    id: 'q2',
    category: 'React Core',
    question: 'How do you prevent unnecessary child component re-renders when passing objects as props in React?',
    options: [
      'Wrap children with normal <div> tags',
      'Memoize the values with useMemo and use useCallback for functions',
      'Directly write inline functions inside render trees',
      'Force update variables on window objects'
    ],
    correctIndex: 1
  },
  {
    id: 'q3',
    category: 'REST Design',
    question: 'Which HTTP method should be utilized for an idempotent update to an entire resource record?',
    options: [
      'POST',
      'PATCH',
      'PUT',
      'GET'
    ],
    correctIndex: 2
  }
];

export default function Simulator({ onAuthTrigger }) {
  const [simStep, setSimStep] = useState('idle'); 
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQIndex < SIMULATOR_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setSimStep('loading');
      
      let correctCounts = 0;
      SIMULATOR_QUESTIONS.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCounts++;
        }
      });
      const finalScore = Math.round((correctCounts / SIMULATOR_QUESTIONS.length) * 100);
      setScore(finalScore);

      setTimeout(() => {
        setSimStep('results');
      }, 1500);
    }
  };

  const resetSimulator = () => {
    setSimStep('idle');
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setScore(0);
  };

  return (
    <div id="simulator" className="solid-card simulator-card">
      <div className="simulator-header">
        <span className="sim-title">AI Assessment Engine</span>
        <div className="sim-status">
          <div className="status-dot"></div>
          <span>{simStep === 'idle' ? 'Ready' : simStep === 'active' ? 'Testing' : simStep === 'loading' ? 'Analyzing' : 'Complete'}</span>
        </div>
      </div>

      {/* Step: Idle */}
      {simStep === 'idle' && (
        <div className="sim-body" style={{ textAlign: 'center', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.4rem' }}>Test Your Competencies Now</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--matrix-text-secondary)' }}>
            Take a quick mock evaluation covering Clean architecture principles, API logic, and reactive interfaces.
          </p>
          <button className="btn btn-accent" style={{ alignSelf: 'center' }} onClick={() => setSimStep('active')}>
            Begin Mock Test
          </button>
        </div>
      )}

      {/* Step: Active Testing */}
      {simStep === 'active' && (
        <>
          <div className="sim-progress-bar">
            {SIMULATOR_QUESTIONS.map((_, idx) => (
              <div 
                key={idx} 
                className={`progress-segment ${idx <= currentQIndex ? 'active' : ''}`}
              ></div>
            ))}
          </div>
          <div className="sim-body">
            <div className="sim-question-tag">
              Question {currentQIndex + 1} / {SIMULATOR_QUESTIONS.length} — {SIMULATOR_QUESTIONS[currentQIndex].category}
            </div>
            <div className="sim-question-text">
              {SIMULATOR_QUESTIONS[currentQIndex].question}
            </div>
            <div className="sim-options">
              {SIMULATOR_QUESTIONS[currentQIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`sim-option-btn ${selectedAnswers[currentQIndex] === idx ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(idx)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              disabled={selectedAnswers[currentQIndex] === undefined}
              onClick={handleNextQuestion}
            >
              {currentQIndex === SIMULATOR_QUESTIONS.length - 1 ? 'Submit Answers' : 'Next Question'}
            </button>
          </div>
        </>
      )}

      {/* Step: Loading / AI Analysis */}
      {simStep === 'loading' && (
        <div className="sim-body sim-loader-wrapper">
          <div className="spinner"></div>
          <h4 style={{ fontFamily: 'var(--font-mono)' }}>GENERATING PERFORMANCE METRICS</h4>
          <p style={{ fontSize: '0.85rem' }}>Comparing choices against backend evaluation guidelines...</p>
        </div>
      )}

      {/* Step: Results Display */}
      {simStep === 'results' && (
        <div className="sim-body sim-results">
          <div className="result-badge-row">
            <div className="score-display">
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Calculated Score</span>
              <span className="score-val">{score}%</span>
            </div>
            <span className="badge-pill" style={{ color: 'var(--matrix-accent)', borderColor: 'var(--matrix-accent)' }}>
              {score >= 100 ? 'Expert' : score >= 66 ? 'Intermediate' : 'Novice'}
            </span>
          </div>
          
          <div className="result-feedback">
            <div className="feedback-headline">AI Performance Plan Summary</div>
            <p style={{ color: 'var(--matrix-text-secondary)' }}>
              {score >= 100 
                ? 'Exceptional architecture and framework comprehension. Recommended next step: Explore concurrency states and asynchronous message queues.' 
                : score >= 66 
                ? 'Solid performance. Ensure precise routing updates and study structural patterns for Clean dependency injection contexts.' 
                : 'Initial fundamentals detected. Focus on resource layers, REST validation codes, and basic React state lifecycle hooks.'}
            </p>
          </div>

          <div>
            <div className="result-list-title">Target Improvement Focus Areas:</div>
            <ul className="focus-areas">
              <li className="focus-item">
                <div className="focus-dot"></div>
                <span>{score >= 100 ? 'Message broker event mapping' : score >= 66 ? 'Database transaction isolation' : 'Separation of Onion business logic'}</span>
              </li>
              <li className="focus-item">
                <div className="focus-dot"></div>
                <span>{score >= 100 ? 'Advanced memory optimizations' : 'Clean REST error codes mapping'}</span>
              </li>
            </ul>
          </div>

          <div className="sim-actions">
            <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={resetSimulator}>
              Reset Demo
            </button>
            <button className="btn btn-primary" style={{ flexGrow: 1 }} onClick={() => onAuthTrigger('register')}>
              Save Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
