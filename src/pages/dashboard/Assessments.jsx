import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import apiClient from '../../api/axios'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

const getAssessmentStorageKey = () => {
  const user = useAuthStore.getState().user
  return user?.id ? `skill_matrix_active_assessment_${user.id}` : 'skill_matrix_active_assessment_guest'
}

const LANGUAGE_TEMPLATES = {
  javascript: `// JavaScript (Node.js) Solution Template
function solution() {
  console.log("Hello, World!");
  return true;
}

solution();`,

  python: `# Python 3.11 Solution Template
def solution():
    print("Hello, World!")
    return True

if __name__ == "__main__":
    solution()`,

  csharp: `// C# (.NET 8) Solution Template
using System;

public class Program 
{
    public static void Main() 
    {
        Console.WriteLine("Hello, World!");
    }
}`,

  java: `// Java 17 Solution Template
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,

  typescript: `// TypeScript Solution Template
function solution(): boolean {
  console.log("Hello, World!");
  return true;
}

solution();`,

  cpp: `// C++ (GCC 13) Solution Template
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`
}

export default function Assessments() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('assessment') // 'assessment' | 'history'
  
  // Assessment Batches State (Lazy Initializer from Location State or LocalStorage)
  const [batches, setBatches] = useState(() => {
    if (location.state?.baselineBatches || location.state?.assessment) {
      const raw = location.state.baselineBatches || location.state.assessment
      return Array.isArray(raw) ? raw : [raw]
    }
    const key = getAssessmentStorageKey()
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.batches && parsed.batches.length > 0) {
          return parsed.batches
        }
      } catch {
        localStorage.removeItem(key)
      }
    }
    return []
  })

  // Progress tracking (Lazy Initialized)
  const [currentBatchIndex, setCurrentBatchIndex] = useState(() => {
    if (location.state?.baselineBatches || location.state?.assessment) return 0
    const key = getAssessmentStorageKey()
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.currentBatchIndex || 0
      } catch { /* ignore */ }
    }
    return 0
  })

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (location.state?.baselineBatches || location.state?.assessment) return 0
    const key = getAssessmentStorageKey()
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.currentQuestionIndex || 0
      } catch { /* ignore */ }
    }
    return 0
  })
  
  // Answer storage (Lazy Initialized)
  const [answers, setAnswers] = useState(() => {
    if (location.state?.baselineBatches || location.state?.assessment) {
      const raw = location.state.baselineBatches || location.state.assessment
      const b = Array.isArray(raw) ? raw : [raw]
      const initialAnswers = {}
      b.forEach(batch => {
        initialAnswers[batch.assessmentBatchId || batch.id] = {}
      })
      return initialAnswers
    }
    const key = getAssessmentStorageKey()
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.answers || {}
      } catch { /* ignore */ }
    }
    return {}
  })

  // UI & Flow State
  const [submitting, setSubmitting] = useState(false)
  const [completedBatches, setCompletedBatches] = useState(() => {
    if (location.state?.baselineBatches || location.state?.assessment) return []
    const key = getAssessmentStorageKey()
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.completedBatches || []
      } catch { /* ignore */ }
    }
    return []
  })
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [allDone, setAllDone] = useState(false)

  // Code Playground State
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [codeSnippet, setCodeSnippet] = useState(LANGUAGE_TEMPLATES.javascript)
  const [runningCode, setRunningCode] = useState(false)
  const [executionResult, setExecutionResult] = useState(null)

  // History & Scorecard Inspection State
  const [historyList, setHistoryList] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedResultDetail, setSelectedResultDetail] = useState(null)

  // Derived Active Question Identifiers
  const currentBatch = batches[currentBatchIndex]
  const currentBatchId = currentBatch?.assessmentBatchId || currentBatch?.id
  const currentQuestion = currentBatch?.questions?.[currentQuestionIndex]
  const isCodeQuestion = currentQuestion?.questionType === 'Coding' || currentQuestion?.codeTemplate || currentQuestion?.isCode
  const isLastQuestionInBatch = currentQuestionIndex === (currentBatch?.questions?.length || 0) - 1
  const isLastBatch = currentBatchIndex === batches.length - 1

  // Register Monaco Language IntelliSense & Snippet Autocompletion Providers
  const handleEditorWillMount = (monaco) => {
    if (window._monacoIntellisenseRegistered) return
    window._monacoIntellisenseRegistered = true

    // C# Completion Provider
    monaco.languages.registerCompletionItemProvider('csharp', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          { label: 'Console.WriteLine', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Console.WriteLine("${1:message}");', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Writes text to stdout', range },
          { label: 'Console.ReadLine', kind: monaco.languages.CompletionItemKind.Method, insertText: 'Console.ReadLine()', documentation: 'Reads text from stdin', range },
          { label: 'if-statement', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition})\n{\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'If statement', range },
          { label: 'for-loop', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++)\n{\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'For loop', range },
          { label: 'foreach-loop', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'foreach (var ${1:item} in ${2:collection})\n{\n\t${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Foreach loop', range },
          { label: 'public-class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public class ${1:Program}\n{\n\tpublic static void Main()\n\t{\n\t\t${2}\n\t}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'C# Program Class', range },
          { label: 'public-method', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public ${1:void} ${2:MyMethod}(${3})\n{\n\t${4}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'C# Method', range },
          { label: 'try-catch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try\n{\n\t${1}\n}\ncatch (Exception ex)\n{\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Try-Catch block', range },
          { label: 'string', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'string', range },
          { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'int', range },
          { label: 'bool', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'bool', range },
          { label: 'var', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'var', range },
          { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ', range }
        ]

        return { suggestions }
      }
    })

    // Python Completion Provider
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print(${1:val})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print statement', range },
          { label: 'def-func', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def ${1:func_name}(${2:args}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Define function', range },
          { label: 'if-statement', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if ${1:condition}:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'If statement', range },
          { label: 'for-in-range', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:i} in range(${2:n}):\n    ${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'For range loop', range },
          { label: 'try-except', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try:\n    ${1:pass}\nexcept Exception as e:\n    ${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Try Except block', range },
          { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ', range }
        ]

        return { suggestions }
      }
    })

    // Java Completion Provider
    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          { label: 'System.out.println', kind: monaco.languages.CompletionItemKind.Method, insertText: 'System.out.println("${1:message}");', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print to stdout', range },
          { label: 'main-method', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n    ${1}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Java main method', range },
          { label: 'if-statement', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n    ${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'If statement', range },
          { label: 'for-loop', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'For loop', range }
        ]

        return { suggestions }
      }
    })

    // C++ Completion Provider
    monaco.languages.registerCompletionItemProvider('cpp', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = [
          { label: 'std::cout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::cout << "${1:msg}" << std::endl;', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Print std::cout', range },
          { label: 'main-func', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'int main() {\n    ${1}\n    return 0;\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'C++ Main Function', range },
          { label: 'if-statement', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n    ${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'If statement', range }
        ]

        return { suggestions }
      }
    })
  }

  // Dynamic Language Switcher Handler
  const handleLanguageChange = (newLang) => {
    setCodeLanguage(newLang)
    if (LANGUAGE_TEMPLATES[newLang]) {
      setCodeSnippet(LANGUAGE_TEMPLATES[newLang])
    }
  }

  // Helper to load code template for target question
  const syncQuestionTemplate = (targetQuestionIndex, targetBatchIndex = currentBatchIndex) => {
    setExecutionResult(null) // Reset CodeSignal test suite results on question change
    const targetBatch = batches[targetBatchIndex]
    const targetBatchId = targetBatch?.assessmentBatchId || targetBatch?.id
    const targetQ = targetBatch?.questions?.[targetQuestionIndex]

    if (targetQ) {
      const savedCode = answers[targetBatchId]?.[targetQ.id]?.submittedCode
      if (savedCode) {
        setCodeSnippet(savedCode)
      } else if (targetQ.codeTemplate) {
        setCodeSnippet(targetQ.codeTemplate)
      } else {
        const qLang = targetQ.language?.toLowerCase() || codeLanguage || 'javascript'
        const targetLang = LANGUAGE_TEMPLATES[qLang] ? qLang : 'javascript'
        setCodeLanguage(targetLang)
        setCodeSnippet(LANGUAGE_TEMPLATES[targetLang] || LANGUAGE_TEMPLATES.javascript)
      }
    }
  }

  // Purge legacy storage key on mount
  useEffect(() => {
    localStorage.removeItem('skill_matrix_active_assessment_state')
  }, [])

  // Save Progress to LocalStorage for persistence
  useEffect(() => {
    const key = getAssessmentStorageKey()
    if (batches.length > 0 && !allDone) {
      const stateToSave = {
        batches,
        currentBatchIndex,
        currentQuestionIndex,
        answers,
        completedBatches
      }
      localStorage.setItem(key, JSON.stringify(stateToSave))
    } else {
      localStorage.removeItem(key)
    }
  }, [batches, currentBatchIndex, currentQuestionIndex, answers, completedBatches, allDone])

  // Auto-Submit on Tab Close / Page Leave Warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (batches.length > 0 && !allDone && !submitting) {
        e.preventDefault()
        e.returnValue = 'You have an active assessment in progress. Navigating away will submit your answers.'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [batches, allDone, submitting])

  // Fetch Assessment History
  useEffect(() => {
    if (activeTab === 'history') {
      async function loadHistory() {
        setLoadingHistory(true)
        try {
          const res = await apiClient.get('/api/Assessments/history')
          setHistoryList(res || [])
        } catch {
          toast.error('Failed to fetch assessment history.')
        } finally {
          setLoadingHistory(false)
        }
      }
      loadHistory()
    }
  }, [activeTab])

  // Handle MCQ Option Selection
  const handleSelectOption = (optionId) => {
    if (!currentQuestion) return
    setAnswers(prev => ({
      ...prev,
      [currentBatchId]: {
        ...prev[currentBatchId],
        [currentQuestion.id]: {
          ...prev[currentBatchId]?.[currentQuestion.id],
          selectedOptionId: optionId
        }
      }
    }))
  }

  // Handle Code Execution Playground (Judge0 API via Backend)
  const handleRunCode = async () => {
    setRunningCode(true)
    setExecutionResult(null)
    try {
      const res = await apiClient.post('/api/Assessments/run-code', {
        language: codeLanguage,
        sourceCode: codeSnippet,
        expectedOutput: currentQuestion?.expectedOutput || ''
      })
      setExecutionResult(res)
      if (res?.isSuccess) {
        toast.success('Code executed & test passed!')
      } else {
        toast.error('Code execution failed or produced errors.')
      }
      
      // Auto-save submitted code to answers
      if (currentQuestion) {
        setAnswers(prev => ({
          ...prev,
          [currentBatchId]: {
            ...prev[currentBatchId],
            [currentQuestion.id]: {
              ...prev[currentBatchId]?.[currentQuestion.id],
              submittedCode: codeSnippet
            }
          }
        }))
      }
    } catch {
      toast.error('Failed to run code.')
    } finally {
      setRunningCode(false)
    }
  }

  // Submit Current Batch Answers
  const handleSubmitBatch = async () => {
    setSubmitting(true)
    try {
      const batchAnswers = answers[currentBatchId] || {}
      const currentBatchQuestions = currentBatch?.questions || []
      
      const userAnswers = currentBatchQuestions.map(q => {
        const ans = batchAnswers[q.id]
        return {
          assessmentQuestionId: parseInt(q.id),
          selectedOptionId: ans?.selectedOptionId ? parseInt(ans.selectedOptionId) : null,
          submittedCode: ans?.submittedCode || null
        }
      })

      const res = await apiClient.post('/api/Assessments/submit', {
        assessmentBatchId: currentBatchId,
        userAnswers: userAnswers
      })

      setCompletedBatches(prev => [...prev, currentBatchId])

      if (isLastBatch) {
        setAllDone(true)
        setAssessmentResult(res)
        localStorage.removeItem(getAssessmentStorageKey())
      } else {
        const nextBatchIdx = currentBatchIndex + 1
        setCurrentBatchIndex(nextBatchIdx)
        setCurrentQuestionIndex(0)
        syncQuestionTemplate(0, nextBatchIdx)
      }
    } catch {
      toast.error('Failed to submit assessment answers.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (isLastQuestionInBatch) {
      handleSubmitBatch()
    } else {
      const nextQIdx = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextQIdx)
      syncQuestionTemplate(nextQIdx)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevQIdx = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevQIdx)
      syncQuestionTemplate(prevQIdx)
    }
  }

  // Fetch Detailed Result Scorecard
  const handleInspectScorecard = async (resultId) => {
    try {
      const res = await apiClient.get(`/api/Assessments/results/${resultId}`)
      setSelectedResultDetail(res)
    } catch {
      toast.error('Failed to fetch scorecard details.')
    }
  }

  const currentAnswer = answers[currentBatchId]?.[currentQuestion?.id]
  const canProceed = isCodeQuestion ? true : !!currentAnswer?.selectedOptionId

  return (
    <div className="dash-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Tab Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="dash-section-title">Assessment Arena</h2>
          <p className="dashboard-section-subtitle">Real-time evaluation suite with adaptive questions & Judge0 code sandbox.</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--matrix-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--matrix-border)' }}>
          <button 
            className={`btn ${activeTab === 'assessment' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('assessment')}
          >
            🎯 Active Assessment {batches.length > 0 && !allDone && '(1)'}
          </button>
          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('history')}
          >
            📜 Assessment History & Scorecards
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE ASSESSMENT ARENA */}
      {activeTab === 'assessment' && (
        <>
          {/* State A: Final Result Scorecard View */}
          {allDone && assessmentResult ? (
            <div className="solid-card fade-in" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: assessmentResult.passed ? 'rgba(16,185,129,0.15)' : 'rgba(215,78,9,0.15)', color: assessmentResult.passed ? '#10b981' : 'var(--matrix-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2.5rem' }}>
                {assessmentResult.passed ? '🎉' : '📈'}
              </div>

              <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: 'var(--matrix-text-primary)' }}>
                {assessmentResult.passed ? 'Assessment Passed!' : 'Assessment Completed'}
              </h2>
              <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                {assessmentResult.skillName} • {assessmentResult.proficiencyLevel} Proficiency Level
              </p>

              {/* Score Metric */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: 'var(--matrix-bg-alt)', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--matrix-border)' }}>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: assessmentResult.passed ? '#10b981' : 'var(--matrix-accent)' }}>
                    {assessmentResult.score}%
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase' }}>Final Score</span>
                </div>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
                    {assessmentResult.noOfCorrectAnswers}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase' }}>Correct</span>
                </div>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--matrix-crimson)' }}>
                    {assessmentResult.noOfWrongAnswers}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase' }}>Wrong</span>
                </div>
              </div>

              {assessmentResult.levelUp && (
                <div style={{ backgroundColor: 'rgba(242,187,5,0.15)', border: '1px solid #F2BB05', color: '#F2BB05', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  ⭐ LEVEL UP UNLOCKED: Promoted to {assessmentResult.newProficiencyLevel}!
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard/plans')}>
                  View AI Growth Plan →
                </button>
                <button className="btn btn-secondary" onClick={() => { setBatches([]); setAllDone(false); setActiveTab('history'); }}>
                  View History
                </button>
              </div>
            </div>
          ) : batches.length > 0 ? (
            /* State B: Live Assessment Question Stepper & Sandbox */
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
              
              {/* Left Sidebar: Module Stepper */}
              <div className="solid-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Modules Stepper
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {batches.map((batch, idx) => {
                    const bId = batch.assessmentBatchId || batch.id
                    const isActive = idx === currentBatchIndex
                    const isCompleted = completedBatches.includes(bId)
                    
                    return (
                      <div key={bId} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        padding: '0.75rem', 
                        borderRadius: '8px', 
                        backgroundColor: isActive ? 'rgba(18, 78, 120, 0.2)' : 'var(--matrix-bg-alt)',
                        border: `1px solid ${isActive ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`,
                        opacity: (!isActive && !isCompleted) ? 0.6 : 1
                      }}>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: isCompleted ? '#10b981' : isActive ? 'var(--matrix-primary)' : 'var(--matrix-bg-alt)',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {isCompleted ? '✓' : (idx + 1)}
                        </div>
                        <div>
                          <h5 style={{ margin: '0 0 0.15rem 0', fontSize: '0.875rem', color: 'var(--matrix-text-primary)' }}>Module {idx + 1}</h5>
                          <span style={{ fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>{batch.questions?.length || 0} Questions</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Main Arena: Question & Code Editor */}
              {currentQuestion && (
                <div className="solid-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '520px' }}>
                  
                  <div>
                    {/* Question Header & Stepper */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
                      <span className="badge-pill" style={{ backgroundColor: 'var(--matrix-bg-alt)', color: 'var(--matrix-primary)' }}>
                        Question {currentQuestionIndex + 1} of {currentBatch?.questions?.length}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--matrix-text-muted)' }}>
                        Time Limit: {currentBatch?.timeLimitMinutes || 15} mins
                      </span>
                    </div>

                    {/* Question Text */}
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1.5rem 0', lineHeight: 1.5, color: 'var(--matrix-text-primary)' }}>
                      {currentQuestion.questionText}
                    </h3>

                    {/* Code Question vs Multiple Choice */}
                    {isCodeQuestion ? (
                      /* Monaco Code Editor & Judge0 Sandbox */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.85rem', color: 'var(--matrix-text-muted)', fontWeight: 600 }}>Monaco Code Sandbox:</label>
                          <select className="form-input" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }} value={codeLanguage} onChange={e => handleLanguageChange(e.target.value)}>
                            <option value="javascript">JavaScript (Node.js)</option>
                            <option value="python">Python 3.11</option>
                            <option value="csharp">C# (.NET 8)</option>
                            <option value="java">Java 17</option>
                            <option value="typescript">TypeScript</option>
                            <option value="cpp">C++ (GCC 13)</option>
                          </select>
                        </div>

                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--matrix-border)' }}>
                          <Editor
                            height="320px"
                            language={codeLanguage === 'csharp' ? 'csharp' : codeLanguage}
                            theme="vs-dark"
                            value={codeSnippet}
                            beforeMount={handleEditorWillMount}
                            onChange={(val) => setCodeSnippet(val || '')}
                            options={{
                              fontSize: 14,
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              tabSize: 2,
                              lineNumbers: 'on',
                              quickSuggestions: { other: true, comments: true, strings: true },
                              suggestOnTriggerCharacters: true,
                              snippetSuggestions: 'inline',
                              wordBasedSuggestions: 'currentDocument',
                              acceptSuggestionOnEnter: 'on',
                              tabCompletion: 'on',
                              autoClosingBrackets: 'always',
                              autoClosingQuotes: 'always',
                              formatOnType: true
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button className="btn btn-secondary" onClick={handleRunCode} disabled={runningCode}>
                            {runningCode ? 'Executing via Judge0 Sandbox...' : '▶ Run Code (Judge0 Evaluation)'}
                          </button>
                        </div>

                        {executionResult && (
                          <div style={{ backgroundColor: 'var(--matrix-bg-alt)', padding: '1.25rem', borderRadius: '10px', border: `1.5px solid ${executionResult.isSuccess ? '#10b981' : 'var(--matrix-crimson)'}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            
                            {/* Summary Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ 
                                  padding: '0.25rem 0.75rem', 
                                  borderRadius: '20px', 
                                  backgroundColor: executionResult.isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(215,78,9,0.15)', 
                                  color: executionResult.isSuccess ? '#10b981' : 'var(--matrix-crimson)', 
                                  fontWeight: 700, 
                                  fontSize: '0.85rem' 
                                }}>
                                  {executionResult.isSuccess ? '✓ Test Passed (1/1)' : '✖ Test Failed (0/1)'}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--matrix-text-primary)', fontWeight: 600 }}>
                                  {executionResult.isSuccess ? 'All test inputs matched expected output' : 'Output mismatch or execution alert'}
                                </span>
                              </div>
                            </div>

                            {/* Test Cases Input vs Expected Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              
                              {/* Box A: Test Case Input */}
                              <div style={{ backgroundColor: 'var(--matrix-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--matrix-border)' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
                                  Test Input
                                </span>
                                <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--matrix-text-primary)', fontFamily: 'monospace', whitespace: 'pre-wrap' }}>
                                  {currentQuestion?.sampleInput || currentQuestion?.stdin || 'Standard Execution'}
                                </pre>
                              </div>

                              {/* Box B: Expected Output */}
                              <div style={{ backgroundColor: 'var(--matrix-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--matrix-border)' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
                                  Expected Output
                                </span>
                                <pre style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', fontFamily: 'monospace', whitespace: 'pre-wrap' }}>
                                  {currentQuestion?.expectedOutput || 'Execution completed with 0 exit code'}
                                </pre>
                              </div>

                            </div>

                            {/* Box C: Your Actual Console Output */}
                            <div style={{ backgroundColor: 'var(--matrix-surface)', padding: '0.85rem', borderRadius: '8px', border: `1px solid ${executionResult.isSuccess ? 'rgba(16,185,129,0.4)' : 'rgba(215,78,9,0.4)'}` }}>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
                                Your Program Output (stdout)
                              </span>
                              <pre style={{ margin: 0, fontSize: '0.85rem', color: executionResult.isSuccess ? 'var(--matrix-text-primary)' : '#ff6b6b', fontFamily: 'monospace', whitespace: 'pre-wrap' }}>
                                {executionResult.consoleOutput || '(No stdout)'}
                              </pre>
                              {executionResult.errorMessage && (
                                <pre style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#ff6b6b', fontFamily: 'monospace', whitespace: 'pre-wrap', borderTop: '1px dashed var(--matrix-border)', paddingTop: '0.5rem' }}>
                                  {executionResult.errorMessage}
                                </pre>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    ) : (
                      /* Multiple Choice Options */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                        {currentQuestion.options?.map(opt => {
                          const isSelected = currentAnswer?.selectedOptionId === opt.id
                          return (
                            <div 
                              key={opt.id}
                              onClick={() => handleSelectOption(opt.id)}
                              style={{
                                padding: '1rem 1.25rem',
                                borderRadius: '8px',
                                backgroundColor: isSelected ? 'rgba(18, 78, 120, 0.15)' : 'var(--matrix-bg-alt)',
                                border: `1.5px solid ${isSelected ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--matrix-primary)' : 'var(--matrix-border)'}`, backgroundColor: isSelected ? 'var(--matrix-primary)' : 'transparent' }} />
                              <span style={{ fontSize: '0.95rem', color: 'var(--matrix-text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                                {opt.optionText}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Navigation Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid var(--matrix-border)' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0 || submitting}
                    >
                      ← Previous
                    </button>
                    
                    <button 
                      className="btn btn-primary" 
                      onClick={handleNext}
                      disabled={!canProceed || submitting}
                    >
                      {submitting ? 'Submitting...' : isLastQuestionInBatch ? (isLastBatch ? 'Finish & View Score' : 'Submit & Next Module') : 'Next Question →'}
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* State C: Empty Assessment State */
            <div className="solid-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', maxWidth: '520px', margin: '1rem auto' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(18, 78, 120, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--matrix-primary)' }}>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--matrix-text-primary)' }}>No Active Assessment Session</h3>
              <p style={{ color: 'var(--matrix-text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
                Launch a skill assessment from your overview dashboard or browse past assessment scorecards.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard/skills')}>
                  Explore Skills Catalog
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('history')}>
                  View Past History
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: ASSESSMENT HISTORY & SCORECARDS DIRECTORY */}
      {activeTab === 'history' && (
        <div className="solid-card fade-in" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--matrix-text-primary)' }}>Assessment History Directory</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--matrix-text-muted)' }}>Complete audit log of all taken adaptive tests & track baseline evaluations.</p>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('history')}>
              🔄 Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--matrix-text-muted)' }}>Loading assessment history...</div>
          ) : historyList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {historyList.map((item) => (
                <div key={item.id} className="dash-compact-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      backgroundColor: item.passed ? 'rgba(16,185,129,0.15)' : 'rgba(215,78,9,0.15)', 
                      border: `1.5px solid ${item.passed ? '#10b981' : 'var(--matrix-accent)'}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: item.passed ? '#10b981' : 'var(--matrix-accent)'
                    }}>
                      {item.score}%
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: 'var(--matrix-text-primary)' }}>
                        {item.skillName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--matrix-text-muted)' }}>
                        <span>Level: <strong>{item.proficiencyLevel}</strong></span>
                        <span>•</span>
                        <span>Date: {new Date(item.dateCompleted).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{item.noOfCorrectAnswers}/{item.totalQuestions} Correct</span>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => handleInspectScorecard(item.id)}>
                    Inspect Scorecard →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--matrix-text-muted)' }}>
              No assessment history records found. Take your first skill check assessment to populate your history log!
            </div>
          )}
        </div>
      )}

      {/* Scorecard Inspection Detail Modal */}
      {selectedResultDetail && (
        <div className="modal-overlay" onClick={() => setSelectedResultDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '90%' }}>
            <button className="modal-close" onClick={() => setSelectedResultDetail(null)}>&times;</button>
            
            <h3 className="modal-title" style={{ marginBottom: '0.5rem' }}>Detailed Scorecard</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--matrix-text-muted)', marginBottom: '1.5rem' }}>
              {selectedResultDetail.skillName} • Completed on {new Date(selectedResultDetail.dateCompleted).toLocaleDateString()}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', backgroundColor: 'var(--matrix-bg-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--matrix-border)', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedResultDetail.passed ? '#10b981' : 'var(--matrix-accent)' }}>
                  {selectedResultDetail.score}%
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>Final Score</span>
              </div>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                  {selectedResultDetail.noOfCorrectAnswers}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>Correct</span>
              </div>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--matrix-crimson)' }}>
                  {selectedResultDetail.noOfWrongAnswers}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--matrix-text-muted)' }}>Wrong</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--matrix-text-muted)' }}>Proficiency Level:</span>
                <strong style={{ color: 'var(--matrix-text-primary)' }}>{selectedResultDetail.proficiencyLevel}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--matrix-text-muted)' }}>Passing Threshold:</span>
                <strong style={{ color: 'var(--matrix-text-primary)' }}>{selectedResultDetail.passingScore}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--matrix-text-muted)' }}>Badge Unlocked:</span>
                <strong style={{ color: selectedResultDetail.badgeUnlocked ? '#10b981' : 'var(--matrix-text-muted)' }}>
                  {selectedResultDetail.badgeUnlocked ? `🏅 ${selectedResultDetail.badgeTitle || 'Unlocked'}` : 'None'}
                </strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedResultDetail(null)}>
              Close Scorecard
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
