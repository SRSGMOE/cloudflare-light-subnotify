import React, { useState, useEffect } from 'react'
import { Icon, Switch } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  getNotifySettings,
  saveNotifySettings,
  getEmailSettings,
  saveEmailSettings
} from '../api'

export default function SettingsPage({ showSuccess, showError }) {
  const { currentTheme } = useTheme()
  
  // Telegram 总开关
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  // Telegram Chat ID 列表
  const [telegramChats, setTelegramChats] = useState([
    { id: Date.now(), label: '', chat_id: '', enabled: false }
  ])
  const [telegramLoading, setTelegramLoading] = useState(false)
  
  // 邮件总开关
  const [emailEnabled, setEmailEnabled] = useState(false)
  // 邮件 SMTP 设置
  const [emailSmtp, setEmailSmtp] = useState({
    smtp_host: '',
    smtp_port: '465',
    smtp_user: '',
    smtp_password: '',
  })
  // 邮件收件人列表
  const [emailReceivers, setEmailReceivers] = useState([
    { id: Date.now(), label: '', email: '', enabled: false }
  ])
  const [emailLoading, setEmailLoading] = useState(false)
  
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
      
      // Telegram 设置
      setTelegramEnabled(telegram.enabled || false)
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
    // 计算中文字符数
    const chineseCount = (label.match(/[\u4e00-\u9fa5]/g) || []).length
    // 计算英文数字字符数
    const otherCount = label.length - chineseCount
    // 中文最多4个，英文数字最多8个
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
    return chat.label.trim() !== '' && chat.chat_id.trim() !== ''
  }

  const handleSaveTelegram = async () => {
    setTelegramLoading(true)
    try {
      await saveTelegramSettings({ 
        enabled: telegramEnabled, 
        chats: telegramChats 
      })
      showSuccess('Telegram设置已保存')
    } catch (error) {
      showError('保存失败')
    }
    setTelegramLoading(false)
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
    return receiver.label.trim() !== '' && receiver.email.trim() !== ''
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

      {/* Telegram Bot 设置 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={addTelegramChat}
              disabled={!telegramEnabled}
              style={!telegramEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              + 添加 Chat ID
            </button>
          </div>
        </div>
        <div className="card-body">
          {telegramChats.map((chat, index) => (
            <div key={chat.id} style={{ 
              marginBottom: index < telegramChats.length - 1 ? '16px' : 0,
              padding: '16px',
              background: 'var(--animal-bg-color)',
              borderRadius: 'var(--animal-border-radius-sm)',
              border: '1px solid var(--animal-border-color-light)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                    Chat ID #{index + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Switch 
                      checked={chat.enabled} 
                      onChange={(val) => updateTelegramChat(chat.id, 'enabled', val)}
                      size="small"
                      disabled={!telegramEnabled || !canToggleTelegramChat(chat)}
                    />
                    {renderSwitchStatus(chat.enabled)}
                  </div>
                </div>
                {telegramChats.length > 1 && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => removeTelegramChat(chat.id)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    删除
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>
                    自定义标签
                    <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '4px' }}>
                      (最多4个中文或8个英文)
                    </span>
                  </label>
                  <input
                    className="input"
                    value={chat.label}
                    onChange={(e) => {
                      if (validateLabel(e.target.value)) {
                        updateTelegramChat(chat.id, 'label', e.target.value)
                      }
                    }}
                    placeholder="例如：工作群"
                    disabled={!telegramEnabled}
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Chat ID</label>
                  <input
                    className="input"
                    value={chat.chat_id}
                    onChange={(e) => updateTelegramChat(chat.id, 'chat_id', e.target.value)}
                    placeholder="请输入Chat ID"
                    disabled={!telegramEnabled}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '16px' }}>
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
          </div>
        </div>
      </div>

      {/* 邮件通知设置 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={addEmailReceiver}
              disabled={!emailEnabled}
              style={!emailEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              + 添加收件人
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* SMTP 设置 */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '16px', 
            background: 'var(--animal-bg-color)', 
            borderRadius: 'var(--animal-border-radius-sm)',
            border: '1px solid var(--animal-border-color-light)',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--animal-text-color)', marginBottom: '12px' }}>
              SMTP 服务器设置
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
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
              <div className="form-group" style={{ marginBottom: 0 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
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
              <div className="form-group" style={{ marginBottom: 0 }}>
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
            </div>
          </div>

          {/* 收件人列表 */}
          {emailReceivers.map((receiver, index) => (
            <div key={receiver.id} style={{ 
              marginBottom: index < emailReceivers.length - 1 ? '16px' : 0,
              padding: '16px',
              background: 'var(--animal-bg-color)',
              borderRadius: 'var(--animal-border-radius-sm)',
              border: '1px solid var(--animal-border-color-light)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                    收件人 #{index + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Switch 
                      checked={receiver.enabled} 
                      onChange={(val) => updateEmailReceiver(receiver.id, 'enabled', val)}
                      size="small"
                      disabled={!emailEnabled || !canToggleEmailReceiver(receiver)}
                    />
                    {renderSwitchStatus(receiver.enabled)}
                  </div>
                </div>
                {emailReceivers.length > 1 && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => removeEmailReceiver(receiver.id)}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    删除
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>
                    自定义标签
                    <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '4px' }}>
                      (最多4个中文或8个英文)
                    </span>
                  </label>
                  <input
                    className="input"
                    value={receiver.label}
                    onChange={(e) => {
                      if (validateLabel(e.target.value)) {
                        updateEmailReceiver(receiver.id, 'label', e.target.value)
                      }
                    }}
                    placeholder="例如：个人邮箱"
                    disabled={!emailEnabled}
                    style={{ fontSize: '13px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>收件人邮箱</label>
                  <input
                    className="input"
                    value={receiver.email}
                    onChange={(e) => updateEmailReceiver(receiver.id, 'email', e.target.value)}
                    placeholder="receiver@email.com"
                    disabled={!emailEnabled}
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '16px' }}>
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