import React, { useState, useEffect } from 'react'
import { Icon, Switch } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  testTelegram,
  getNotifySettings,
  saveNotifySettings,
  testNotify,
  getEmailSettings,
  saveEmailSettings,
  testEmail
} from '../api'

export default function SettingsPage({ showSuccess, showError }) {
  const { currentTheme } = useTheme()
  
  // Telegram 设置
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [telegramSettings, setTelegramSettings] = useState({
    bot_token: '',
    chat_id: '',
  })
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramTestLoading, setTelegramTestLoading] = useState(false)
  
  // 邮件设置
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [emailSettings, setEmailSettings] = useState({
    smtp_host: '',
    smtp_port: '465',
    smtp_user: '',
    smtp_password: '',
    email_from: '',
    email_to: '',
  })
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailTestLoading, setEmailTestLoading] = useState(false)
  
  // 通知标题设置
  const [notifySettings, setNotifySettings] = useState({
    title: '订阅到期提醒',
  })
  const [notifyLoading, setNotifyLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [telegram, notify, email] = await Promise.all([
        getTelegramSettings(),
        getNotifySettings(),
        getEmailSettings(),
      ])
      setTelegramSettings(telegram)
      setNotifySettings(notify)
      setEmailSettings(email)
      setTelegramEnabled(telegram.enabled || false)
      setEmailEnabled(email.enabled || false)
    } catch (error) {
      console.error('Fetch settings failed:', error)
    }
  }

  // Telegram 相关操作
  const handleSaveTelegram = async () => {
    setTelegramLoading(true)
    try {
      await saveTelegramSettings({ ...telegramSettings, enabled: telegramEnabled })
      showSuccess('Telegram设置已保存')
    } catch (error) {
      showError('保存失败')
    }
    setTelegramLoading(false)
  }

  const handleTestTelegram = async () => {
    if (!telegramEnabled) return
    setTelegramTestLoading(true)
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
    setTelegramTestLoading(false)
  }

  // 邮件相关操作
  const handleSaveEmail = async () => {
    setEmailLoading(true)
    try {
      await saveEmailSettings({ ...emailSettings, enabled: emailEnabled })
      showSuccess('邮件设置已保存')
    } catch (error) {
      showError('保存失败')
    }
    setEmailLoading(false)
  }

  const handleTestEmail = async () => {
    if (!emailEnabled) return
    setEmailTestLoading(true)
    try {
      const result = await testEmail()
      if (result.success) {
        showSuccess('测试邮件已发送，请检查邮箱')
      } else {
        showError('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      showError('测试失败: 网络错误')
    }
    setEmailTestLoading(false)
  }

  // 通知标题相关操作
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
              Telegram Bot 设置
            </h3>
            <Switch 
              checked={telegramEnabled} 
              onChange={setTelegramEnabled}
              size="small"
            />
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Bot Token</label>
            <input
              className="input"
              value={telegramSettings.bot_token}
              onChange={(e) => setTelegramSettings({...telegramSettings, bot_token: e.target.value})}
              placeholder="请输入Telegram Bot Token"
              disabled={!telegramEnabled}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Chat ID</label>
            <input
              className="input"
              value={telegramSettings.chat_id}
              onChange={(e) => setTelegramSettings({...telegramSettings, chat_id: e.target.value})}
              placeholder="请输入接收通知的Chat ID"
              disabled={!telegramEnabled}
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
              disabled={!telegramEnabled || telegramTestLoading}
              style={!telegramEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon name="icon-chat" size={16} bounce={telegramEnabled} />
              ) : (
                <span>📤</span>
              )}
              {telegramTestLoading ? '发送中...' : '测试通知'}
            </button>
          </div>
        </div>
      </div>

      {/* 邮件通知设置 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
              邮件通知设置
            </h3>
            <Switch 
              checked={emailEnabled} 
              onChange={setEmailEnabled}
              size="small"
            />
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">SMTP 服务器</label>
              <input
                className="input"
                value={emailSettings.smtp_host}
                onChange={(e) => setEmailSettings({...emailSettings, smtp_host: e.target.value})}
                placeholder="smtp.qq.com"
                disabled={!emailEnabled}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP 端口</label>
              <input
                className="input"
                value={emailSettings.smtp_port}
                onChange={(e) => setEmailSettings({...emailSettings, smtp_port: e.target.value})}
                placeholder="465"
                disabled={!emailEnabled}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">SMTP 用户名</label>
              <input
                className="input"
                value={emailSettings.smtp_user}
                onChange={(e) => setEmailSettings({...emailSettings, smtp_user: e.target.value})}
                placeholder="your@email.com"
                disabled={!emailEnabled}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SMTP 密码</label>
              <input
                className="input"
                type="password"
                value={emailSettings.smtp_password}
                onChange={(e) => setEmailSettings({...emailSettings, smtp_password: e.target.value})}
                placeholder="授权码"
                disabled={!emailEnabled}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">发件人邮箱</label>
              <input
                className="input"
                value={emailSettings.email_from}
                onChange={(e) => setEmailSettings({...emailSettings, email_from: e.target.value})}
                placeholder="your@email.com"
                disabled={!emailEnabled}
              />
            </div>
            <div className="form-group">
              <label className="form-label">收件人邮箱</label>
              <input
                className="input"
                value={emailSettings.email_to}
                onChange={(e) => setEmailSettings({...emailSettings, email_to: e.target.value})}
                placeholder="receiver@email.com"
                disabled={!emailEnabled}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveEmail} 
              disabled={emailLoading}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon item={352} size={16} />
              ) : (
                <span>💾</span>
              )}
              {emailLoading ? '保存中...' : '保存设置'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleTestEmail} 
              disabled={!emailEnabled || emailTestLoading}
              style={!emailEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon name="icon-chat" size={16} bounce={emailEnabled} />
              ) : (
                <span>📤</span>
              )}
              {emailTestLoading ? '发送中...' : '测试通知'}
            </button>
          </div>
        </div>
      </div>

      {/* 通知标题设置 */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
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
        </div>
      </div>
    </div>
  )
}