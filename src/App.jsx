import React, { useState, useEffect } from 'react'
import { checkAuth, verifyToken, getSubscriptions } from './api'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [checking, setChecking] = useState(true)
  const [needLogin, setNeedLogin] = useState(false)
  const [logged, setLogged] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await checkAuth()
      const { requireAuth } = response
      setNeedLogin(requireAuth)
      
      if (!requireAuth) {
        setLogged(true)
        fetchSubscriptions()
      } else {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const { valid } = await verifyToken(token)
            setLogged(valid)
            if (valid) {
              fetchSubscriptions()
            }
          } catch (e) {
            localStorage.removeItem('token')
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setNeedLogin(true)
    }
    setChecking(false)
  }

  const fetchSubscriptions = async () => {
    try {
      const data = await getSubscriptions()
      setSubscriptions(data)
    } catch (error) {
      console.error('Fetch subscriptions failed:', error)
    }
  }

  const handleLogin = () => {
    setLogged(true)
    fetchSubscriptions()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setLogged(false)
    setSubscriptions([])
  }

  if (checking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--animal-bg-color-secondary)'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
          <div>加载中...</div>
        </div>
      </div>
    )
  }

  if (needLogin && !logged) {
    return <LoginPage onLogin={handleLogin} />
  }

  const menuItems = [
    { key: 'dashboard', icon: '📊', label: '数据表盘' },
    { key: 'subscriptions', icon: '📋', label: '订阅管理' },
    { key: 'settings', icon: '⚙️', label: '系统设置' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--animal-bg-color)' }}>
      {/* 侧边栏 */}
      <div style={{
        width: '250px',
        background: 'var(--animal-bg-color-secondary)',
        borderRight: '2px solid var(--animal-border-color-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '2px solid var(--animal-border-color-light)',
          background: 'var(--animal-bg-color)',
        }}>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 700,
            color: 'var(--animal-text-color)',
            margin: 0,
          }}>
            🌿 订阅通知
          </h1>
        </div>
        
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {menuItems.map(item => (
            <div
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderLeft: currentPage === item.key 
                  ? '3px solid var(--animal-primary-color)' 
                  : '3px solid transparent',
                background: currentPage === item.key 
                  ? 'var(--animal-primary-color-bg)' 
                  : 'transparent',
                color: currentPage === item.key 
                  ? 'var(--animal-primary-color)' 
                  : 'var(--animal-text-color-secondary)',
              }}
            >
              <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>
                {item.icon}
              </span>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div style={{
          padding: '20px',
          borderTop: '2px solid var(--animal-border-color-light)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--animal-primary-color-bg)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--animal-primary-color)',
            }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--animal-text-color)' }}>
                管理员
              </div>
              <div style={{ fontSize: '12px', color: 'var(--animal-text-color-secondary)' }}>
                系统管理员
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-block" onClick={handleLogout}>
            🚪 退出登录
          </button>
        </div>
      </div>
      
      {/* 主内容区 */}
      <main style={{
        flex: 1,
        marginLeft: '250px',
        padding: '24px',
      }}>
        {currentPage === 'dashboard' && (
          <DashboardPage subscriptions={subscriptions} />
        )}
        
        {currentPage === 'subscriptions' && (
          <SubscriptionPage 
            subscriptions={subscriptions} 
            onRefresh={fetchSubscriptions} 
          />
        )}
        
        {currentPage === 'settings' && (
          <SettingsPage />
        )}
      </main>
    </div>
  )
}