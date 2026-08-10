import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, maxWidth = '500px', children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth, width: '90%' }}
      >
        <button className="modal-close" onClick={onClose}>&times;</button>
        {title && <h3 className="modal-title" style={{ marginBottom: '1.5rem' }}>{title}</h3>}
        {children}
      </div>
    </div>
  )
}
