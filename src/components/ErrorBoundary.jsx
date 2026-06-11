import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--animal-bg-color, #f8f8f0)',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😵</div>
            <h2 style={{ 
              color: '#e05a5a', 
              marginBottom: '12px',
              fontSize: '20px',
            }}>
              出现错误
            </h2>
            <p style={{ 
              color: '#794f27', 
              marginBottom: '20px',
              fontSize: '14px',
            }}>
              {this.state.error?.message || '应用遇到了一个错误'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#19c8b9',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}