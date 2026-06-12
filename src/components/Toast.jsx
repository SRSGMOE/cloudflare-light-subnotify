import React, { useState, useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // 等待动画结束后关闭
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' ? 'var(--animal-success-color)' : 
                   type === 'error' ? 'var(--animal-error-color)' : 
                   'var(--animal-warning-color)'

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '100px'})`,
      background: bgColor,
      color: '#fff',
      padding: '16px 24px',
      borderRadius: 'var(--animal-border-radius-base)',
      boxShadow: 'var(--animal-shadow-lg)',
      zIndex: 9999,
      transition: 'transform 0.3s ease',
      fontWeight: 600,
      fontSize: '14px',
      maxWidth: '400px',
      textAlign: 'center',
    }}>
      {message}
    </div>
  )
}

// Toast 管理器
export function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}