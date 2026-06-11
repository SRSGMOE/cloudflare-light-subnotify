import React, { useState } from 'react'
import { login } from '../api'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) {
      alert('请输入用户名和密码')
      return
    }

    setLoading(true)
    try {
      const result = await login(username, password)
      if (result.success) {
        localStorage.setItem('token', result.token)
        onLogin()
      } else {
        alert(result.error || '登录失败')
      }
    } catch (error) {
      alert('网络错误')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'var(--animal-bg-color-secondary)',
      padding: '20px',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <div className="card-body" style={{ padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--animal-text-color)',
            marginBottom: '8px',
          }}>
            Cloudflare Light Subnotify
          </h1>
          <p style={{
            color: 'var(--animal-text-color-secondary)',
            marginBottom: '24px',
            fontSize: '14px',
          }}>
            请输入管理员账号和密码登录
          </p>
          
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">用户名</label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">密码</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <button
            className="btn btn-primary btn-block"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
      </div>
    </div>
  )
}