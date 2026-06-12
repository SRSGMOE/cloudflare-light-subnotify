import React, { useState, useEffect } from 'react'
import { Icon } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  testTelegram,
  getNotifySettings,
  saveNotifySettings,
  testNotify
} from '../api'

export default function SettingsPage({ showSuccess, showError }) {
  const { currentTheme } = useTheme()
  const [telegramSettings, setTelegramSettings] = useState({
    bot_token: '',
    chat_id: '',
  })
  const [notifySettings, setNotifySettings] = useState({
    title: '订阅到期提醒',
  })
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [notifyTestLoading, setNotifyTestLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [telegram, notify] = await Promise.all([
        getTelegramSettings(),
        getNotifySettings(),
      ])
      setTelegramSettings(telegram)
      setNotifySettings(notify)
    } catch (error) {
      console.error('Fetch settings failed:', error)
    }
  }

  const handleSaveTelegram = async () => {
    setTelegramLoading(true)
    try {
      await saveTelegramSettings(telegramSettings)
      showSuccess('Telegram设置已保存')
    } catch (error) {
      showError('保存失败')
    }
    setTelegramLoading(false)
  }

  const handleTestTelegram = async () => {
    setTestLoading(true)
    try {
      const result = await testTelegram()
      if (result.success) {
        showSuccess('测试通知已发送，请检查Telegram')
      } else {
        showError('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      showError('测试失败: 网络错误')
    }
    setTestLoading(false)
  }

  const handleSaveNotify = async () => {
    setNotifyLoading(true)
    try {
      await saveNotifySettings(notifySettings)
      showSuccess('通知设置已保存')
    } catch (error) {
      showError('保存失败')
    }
    setNotifyLoading(false)
  }

  const handleTestNotify = async () => {
    setNotifyTestLoading(true)
    try {
      const result = await testNotify({ title: notifySettings.title })
      if (result.success) {
        showSuccess('测试通知已发送，请检查Telegram')
      } else {
        showError('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      showError('测试失败: 网络错误')
    }
    setNotifyTestLoading(false)
  }

  const notifyPreview = `📢 ${notifySettings.title || '订阅到期提醒'}

📦 - 订阅名称：示例订阅
🔖 - 订阅内容：这是订阅内容示例
🌏 - 当前时区：北京时间 UTC+8
📮 - 通知周期：每周五 14:30
📆 - 下次通知：2024-01-12 14:30`

  return (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 700, 
        color: 'var(--animal-text-color)',
        marginBottom: '24px',
      }}>
        系统设置
      </h2>

      {/* Telegram Bot 设置 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
            Telegram Bot 设置
          </h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Bot Token</label>
            <input
              className="input"
              value={telegramSettings.bot_token}
              onChange={(e) => setTelegramSettings({...telegramSettings, bot_token: e.target.value})}
              placeholder="请输入Telegram Bot Token"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Chat ID</label>
            <input
              className="input"
              value={telegramSettings.chat_id}
              onChange={(e) => setTelegramSettings({...telegramSettings, chat_id: e.target.value})}
              placeholder="请输入接收通知的Chat ID"
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveTelegram} 
              disabled={telegramLoading}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon item={352} size={16} />
              ) : (
                <span>💾</span>
              )}
              {telegramLoading ? '保存中...' : '保存设置'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleTestTelegram} 
              disabled={testLoading}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon name="icon-chat" size={16} bounce />
              ) : (
                <span>🔗</span>
              )}
              {testLoading ? '测试中...' : '连通测试'}
            </button>
          </div>
        </div>
      </div>

      {/* 通知标题设置 */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
            通知标题设置
          </h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <input
              className="input"
              value={notifySettings.title}
              onChange={(e) => setNotifySettings({...notifySettings, title: e.target.value})}
              placeholder="请输入通知标题"
            />
          </div>
          <div className="form-group">
            <label className="form-label">预览效果</label>
            <div style={{
              background: 'var(--animal-bg-color)',
              padding: '16px',
              borderRadius: 'var(--animal-border-radius-sm)',
              fontSize: '14px',
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              border: '2px solid var(--animal-border-color-light)',
              color: 'var(--animal-text-color)',
            }}>
              {notifyPreview}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveNotify} 
              disabled={notifyLoading}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon item={352} size={16} />
              ) : (
                <span>💾</span>
              )}
              {notifyLoading ? '保存中...' : '保存设置'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleTestNotify} 
              disabled={notifyTestLoading}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon name="icon-chat" size={16} bounce />
              ) : (
                <span>📤</span>
              )}
              {notifyTestLoading ? '发送中...' : '测试通知'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}