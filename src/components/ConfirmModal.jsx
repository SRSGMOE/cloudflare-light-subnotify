import React from 'react'
import { Icon } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ConfirmModal({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  type = 'warning' // warning, danger, info
}) {
  const { currentTheme } = useTheme()
  
  if (!visible) return null
  
  const iconMap = {
    warning: '⚠️',
    danger: '🗑️',
    info: 'ℹ️'
  }
  
  const colorMap = {
    warning: 'var(--animal-warning-color)',
    danger: 'var(--animal-error-color)',
    info: 'var(--animal-primary-color)'
  }
  
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: 'var(--animal-text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}>
            <span style={{ fontSize: '20px' }}>{iconMap[type]}</span>
            {title}
          </h3>
          <button 
            className="modal-close"
            onClick={onCancel}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--animal-text-color)',
            lineHeight: '1.6',
            margin: 0,
          }}>
            {message}
          </p>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            style={type === 'danger' ? { 
              background: 'var(--animal-error-color)', 
              borderColor: 'var(--animal-error-color)' 
            } : {}}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}