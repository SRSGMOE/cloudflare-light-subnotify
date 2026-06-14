import React, { useState, useEffect } from 'react'
import { Icon } from 'animal-island-ui'
import { checkAuth, verifyToken, getSubscriptions } from './api'
import { useTheme } from './context/ThemeContext.jsx'
import { ToastContainer } from './components/Toast.jsx'
import useToast from './hooks/useToast.js'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SubscriptionPage from './pages/SubscriptionPage'
import NotifySettingsPage from './pages/NotifySettingsPage'
import SystemSettingsPage from './pages/SystemSettingsPage'

export default function App() {
  const [checking, setChecking] = useState(true)
  const [needLogin, setNeedLogin] = useState(false)
  const [logged, setLogged] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [subscriptions, setSubscriptions] = useState([])
  const { currentTheme, setTheme, themes } = useTheme()
  const { toasts, removeToast, showSuccess, showError } = useToast()

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
    return (
      <>
        <LoginPage onLogin={handleLogin} showError={showError} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    )
  }

  const menuItems = currentTheme === 'animal-forest' 
    ? [
        { key: 'dashboard', icon: 'icon-miles', label: '数据表盘' },
        { key: 'subscriptions', icon: 'icon-design', label: '订阅管理' },
        { key: 'notify-settings', item: 475, label: '通知设置' },
        { key: 'system-settings', icon: 'icon-diy', label: '系统设置' },
      ]
    : [
        { key: 'dashboard', icon: null, emoji: '📊', label: '数据表盘' },
        { key: 'subscriptions', icon: null, emoji: '📋', label: '订阅管理' },
        { key: 'notify-settings', icon: null, emoji: '🔔', label: '通知设置' },
        { key: 'system-settings', icon: null, emoji: '⚙️', label: '系统设置' },
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
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {currentTheme === 'animal-forest' ? (
            <Icon name="icon-variant" size={28} bounce />
          ) : (
            <span style={{ fontSize: '24px' }}>🔔</span>
          )}
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 700,
            color: 'var(--animal-text-color)',
            margin: 0,
          }}>
            Subnotify
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
              {item.icon ? (
                <Icon name={item.icon} size={24} bounce />
              ) : item.item ? (
                <Icon item={item.item} size={24} bounce />
              ) : (
                <span style={{ fontSize: '20px', width: '24px', textAlign: 'center' }}>{item.emoji}</span>
              )}
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </nav>
        
        {/* 主题切换 */}
        <div style={{
          padding: '16px 20px',
          borderTop: '2px solid var(--animal-border-color-light)',
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--animal-text-color-secondary)',
            marginBottom: '8px',
          }}>
            主题设置
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(themes).map(([key, theme]) => (
              <div
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--animal-border-radius-sm)',
                  border: currentTheme === key 
                    ? '2px solid var(--animal-primary-color)' 
                    : '2px solid var(--animal-border-color)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: currentTheme === key ? 'var(--animal-primary-color-bg)' : 'transparent',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.preview.primary}, ${theme.preview.bg})`,
                  margin: '0 auto 4px',
                  border: '1px solid var(--animal-border-color-light)',
                }} />
                <div style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: currentTheme === key ? 'var(--animal-primary-color)' : 'var(--animal-text-color-secondary)',
                }}>
                  {theme.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          padding: '16px 20px',
          borderTop: '2px solid var(--animal-border-color-light)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--animal-primary-color-bg)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {currentTheme === 'animal-forest' ? (
                <Icon item={440} size={28} />
              ) : (
                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--animal-primary-color)' }}>A</span>
              )}
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
            {currentTheme === 'animal-forest' ? (
              <Icon item={474} size={18} />
            ) : (
              <span>🚪</span>
            )}
            退出登录
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
            showSuccess={showSuccess}
            showError={showError}
          />
        )}
        
        {currentPage === 'notify-settings' && (
          <NotifySettingsPage 
            showSuccess={showSuccess}
            showError={showError}
          />
        )}
        
        {currentPage === 'system-settings' && (
          <SystemSettingsPage 
            showSuccess={showSuccess}
            showError={showError}
          />
        )}
      </main>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}