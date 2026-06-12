import React, { useState, useEffect } from 'react'
import { Icon, Switch } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  testTelegram,
  getNotifySettings,
  saveNotifySettings,
  getEmailSettings,
  saveEmailSettings,
  testEmail
} from '../api'

export default function SettingsPage({ showSuccess, showError }) {
  const { currentTheme } = useTheme()
  
  // Telegram 设置
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramChats, setTelegramChats] = useState([
    { id: Date.now(), label: '', chat_id: '', enabled: false }
  ])
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [testingChatId, setTestingChatId] = useState(null)
  
  // 邮件设置
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [emailSmtp, setEmailSmtp] = useState({
    smtp_host: '',
    smtp_port: '465',
    smtp_user: '',
    smtp_password: '',
  })
  const [emailReceivers, setEmailReceivers] = useState([
    { id: Date.now(), label: '', email: '', enabled: false }
  ])
  const [emailLoading, setEmailLoading] = useState(false)
  const [testingEmailId, setTestingEmailId] = useState(null)
  
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
        getEmailSettings()
      ])
      
      // Telegram 设置
      setTelegramEnabled(telegram.enabled || false)
      setTelegramBotToken(telegram.bot_token || '')
      if (telegram.chats && telegram.chats.length > 0) {
        setTelegramChats(telegram.chats)
      }
      
      // 邮件设置
      setEmailEnabled(email.enabled || false)
      if (email.smtp) {
        setEmailSmtp(email.smtp)
      }
      if (email.receivers && email.receivers.length > 0) {
        setEmailReceivers(email.receivers)
      }
      
      // 通知标题
      setNotifySettings(notify)
    } catch (error) {
      console.error('Fetch settings failed:', error)
    }
  }

  // 验证标签长度
  const validateLabel = (label) => {
    if (!label) return true
    const chineseCount = (label.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherCount = label.length - chineseCount
    return chineseCount <= 4 && otherCount <= 8
  }

  // Telegram 操作
  const addTelegramChat = () => {
    setTelegramChats([...telegramChats, { id: Date.now(), label: '', chat_id: '', enabled: false }])
  }

  const removeTelegramChat = (id) => {
    setTelegramChats(telegramChats.filter(chat => chat.id !== id))
  }

  const updateTelegramChat = (id, field, value) => {
    setTelegramChats(telegramChats.map(chat => 
      chat.id === id ? { ...chat, [field]: value } : chat
    ))
  }

  const canToggleTelegramChat = (chat) => {
    return chat.label.trim() !== '' && chat.chat_id.trim() !== '' && telegramBotToken.trim() !== ''
  }

  const handleSaveTelegram = async () => {
    setTelegramLoading(true)
    try {
      await saveTelegramSettings({ 
        enabled: telegramEnabled, 
        bot_token: telegramBotToken,
        chats: telegramChats 
      })
      showSuccess('Telegram设置已保存')
    } catch (error) {
      showError('保存失败')
    }
    setTelegramLoading(false)
  }

  const handleTestTelegramChat = async (chat) => {
    if (!telegramBotToken || !chat.chat_id) {
      showError('请先填写Bot Token和Chat ID')
      return
    }
    setTestingChatId(chat.id)
    try {
      const result = await testTelegram({ 
        bot_token: telegramBotToken, 
        chat_id: chat.chat_id 
      })
      if (result.success) {
        showSuccess(`测试通知已发送至 ${chat.label || chat.chat_id}`)
      } else {
        showError('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      showError('测试失败: 网络错误')
    }
    setTestingChatId(null)
  }

  // 邮件操作
  const addEmailReceiver = () => {
    setEmailReceivers([...emailReceivers, { id: Date.now(), label: '', email: '', enabled: false }])
  }

  const removeEmailReceiver = (id) => {
    setEmailReceivers(emailReceivers.filter(r => r.id !== id))
  }

  const updateEmailReceiver = (id, field, value) => {
    setEmailReceivers(emailReceivers.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  const canToggleEmailReceiver = (receiver) => {
    return receiver.label.trim() !== '' && receiver.email.trim() !== '' && 
           emailSmtp.smtp_host.trim() !== '' && emailSmtp.smtp_user.trim() !== ''
  }

  const handleSaveEmail = async () => {
    setEmailLoading(true)
    try {
      await saveEmailSettings({ 
        enabled: emailEnabled, 
        smtp: emailSmtp,
        receivers: emailReceivers 
      })
      showSuccess('邮件设置已保存')
    } catch (error) {
      showError('保存失败')
    }
    setEmailLoading(false)
  }

  const handleTestEmailReceiver = async (receiver) => {
    if (!emailSmtp.smtp_host || !emailSmtp.smtp_user || !receiver.email) {
      showError('请先填写SMTP设置和收件人邮箱')
      return
    }
    setTestingEmailId(receiver.id)
    try {
      const result = await testEmail({ 
        smtp: emailSmtp,
        email: receiver.email 
      })
      if (result.success) {
        showSuccess(`测试邮件已发送至 ${receiver.label || receiver.email}`)
      } else {
        showError('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      showError('测试失败: 网络错误')
    }
    setTestingEmailId(null)
  }

  // 通知标题操作
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

  // 渲染开关状态
  const renderSwitchStatus = (enabled) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: enabled ? 'var(--animal-success-color)' : 'var(--animal-error-color)',
        boxShadow: enabled 
          ? '0 0 6px var(--animal-success-color)' 
          : '0 0 6px var(--animal-error-color)',
      }} />
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: enabled ? 'var(--animal-success-color)' : 'var(--animal-error-color)',
      }}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  )

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

      {/* Telegram Bot 设置 - 左右布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 左卡片：Telegram Bot 设置 */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
                Telegram Bot 设置
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch 
                  checked={telegramEnabled} 
                  onChange={setTelegramEnabled}
                  size="small"
                />
                {renderSwitchStatus(telegramEnabled)}
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Bot Token</label>
              <input
                className="input"
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="请输入Bot Token"
                disabled={!telegramEnabled}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveTelegram} 
              disabled={telegramLoading}
              style={{ width: '100%' }}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon item={352} size={16} />
              ) : (
                <span>💾</span>
              )}
              {telegramLoading ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>

        {/* 右卡片：Chat ID 设置 */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
                Chat ID 设置
              </h3>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={addTelegramChat}
                disabled={!telegramEnabled}
                style={!telegramEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                + 添加
              </button>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {telegramChats.map((chat, index) => (
              <div key={chat.id} style={{ 
                marginBottom: index < telegramChats.length - 1 ? '12px' : 0,
                padding: '12px',
                background: 'var(--animal-bg-color)',
                borderRadius: 'var(--animal-border-radius-sm)',
                border: '1px solid var(--animal-border-color-light)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                      #{index + 1}
                    </span>
                    <Switch 
                      checked={chat.enabled} 
                      onChange={(val) => updateTelegramChat(chat.id, 'enabled', val)}
                      size="small"
                      disabled={!telegramEnabled || !canToggleTelegramChat(chat)}
                    />
                    {renderSwitchStatus(chat.enabled)}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleTestTelegramChat(chat)}
                      disabled={!telegramEnabled || !canToggleTelegramChat(chat) || testingChatId === chat.id}
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                    >
                      {testingChatId === chat.id ? '...' : '测试'}
                    </button>
                    {telegramChats.length > 1 && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => removeTelegramChat(chat.id)}
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    className="input"
                    value={chat.label}
                    onChange={(e) => {
                      if (validateLabel(e.target.value)) {
                        updateTelegramChat(chat.id, 'label', e.target.value)
                      }
                    }}
                    placeholder="标签（最多4中文或8英文）"
                    disabled={!telegramEnabled}
                    style={{ fontSize: '12px', padding: '8px 10px' }}
                  />
                  <input
                    className="input"
                    value={chat.chat_id}
                    onChange={(e) => updateTelegramChat(chat.id, 'chat_id', e.target.value)}
                    placeholder="Chat ID"
                    disabled={!telegramEnabled}
                    style={{ fontSize: '12px', padding: '8px 10px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 邮件通知设置 - 左右布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 左卡片：邮件通知设置 */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
                邮件通知设置
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch 
                  checked={emailEnabled} 
                  onChange={setEmailEnabled}
                  size="small"
                />
                {renderSwitchStatus(emailEnabled)}
              </div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px' }}>SMTP 服务器</label>
                <input
                  className="input"
                  value={emailSmtp.smtp_host}
                  onChange={(e) => setEmailSmtp({...emailSmtp, smtp_host: e.target.value})}
                  placeholder="smtp.qq.com"
                  disabled={!emailEnabled}
                  style={{ fontSize: '13px' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '12px' }}>SMTP 端口</label>
                <input
                  className="input"
                  value={emailSmtp.smtp_port}
                  onChange={(e) => setEmailSmtp({...emailSmtp, smtp_port: e.target.value})}
                  placeholder="465"
                  disabled={!emailEnabled}
                  style={{ fontSize: '13px' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12px' }}>SMTP 用户名</label>
              <input
                className="input"
                value={emailSmtp.smtp_user}
                onChange={(e) => setEmailSmtp({...emailSmtp, smtp_user: e.target.value})}
                placeholder="your@email.com"
                disabled={!emailEnabled}
                style={{ fontSize: '13px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12px' }}>SMTP 密码/授权码</label>
              <input
                className="input"
                type="password"
                value={emailSmtp.smtp_password}
                onChange={(e) => setEmailSmtp({...emailSmtp, smtp_password: e.target.value})}
                placeholder="授权码"
                disabled={!emailEnabled}
                style={{ fontSize: '13px' }}
              />
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveEmail} 
              disabled={emailLoading}
              style={{ width: '100%' }}
            >
              {currentTheme === 'animal-forest' ? (
                <Icon item={352} size={16} />
              ) : (
                <span>💾</span>
              )}
              {emailLoading ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>

        {/* 右卡片：收件人设置 */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
                收件人设置
              </h3>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={addEmailReceiver}
                disabled={!emailEnabled}
                style={!emailEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                + 添加
              </button>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {emailReceivers.map((receiver, index) => (
              <div key={receiver.id} style={{ 
                marginBottom: index < emailReceivers.length - 1 ? '12px' : 0,
                padding: '12px',
                background: 'var(--animal-bg-color)',
                borderRadius: 'var(--animal-border-radius-sm)',
                border: '1px solid var(--animal-border-color-light)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                      #{index + 1}
                    </span>
                    <Switch 
                      checked={receiver.enabled} 
                      onChange={(val) => updateEmailReceiver(receiver.id, 'enabled', val)}
                      size="small"
                      disabled={!emailEnabled || !canToggleEmailReceiver(receiver)}
                    />
                    {renderSwitchStatus(receiver.enabled)}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleTestEmailReceiver(receiver)}
                      disabled={!emailEnabled || !canToggleEmailReceiver(receiver) || testingEmailId === receiver.id}
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                    >
                      {testingEmailId === receiver.id ? '...' : '测试'}
                    </button>
                    {emailReceivers.length > 1 && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => removeEmailReceiver(receiver.id)}
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    className="input"
                    value={receiver.label}
                    onChange={(e) => {
                      if (validateLabel(e.target.value)) {
                        updateEmailReceiver(receiver.id, 'label', e.target.value)
                      }
                    }}
                    placeholder="标签（最多4中文或8英文）"
                    disabled={!emailEnabled}
                    style={{ fontSize: '12px', padding: '8px 10px' }}
                  />
                  <input
                    className="input"
                    value={receiver.email}
                    onChange={(e) => updateEmailReceiver(receiver.id, 'email', e.target.value)}
                    placeholder="收件人邮箱"
                    disabled={!emailEnabled}
                    style={{ fontSize: '12px', padding: '8px 10px' }}
                  />
                </div>
              </div>
            ))}
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