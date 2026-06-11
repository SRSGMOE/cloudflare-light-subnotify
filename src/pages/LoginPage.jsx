import React, { useState } from 'react'
import { Button, Card, Input } from 'animal-island-ui'
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
      <Card style={{
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        borderRadius: 'var(--animal-border-radius-lg)',
      }}>
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
        
        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--animal-text-color)',
          }}>
            用户名
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            onPressEnter={handleLogin}
          />
        </div>
        
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--animal-text-color)',
          }}>
            密码
          </label>
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            onPressEnter={handleLogin}
          />
        </div>
        
        <Button
          type="primary"
          block
          size="large"
          loading={loading}
          onClick={handleLogin}
        >
          登录
        </Button>
      </Card>
    </div>
  )
}