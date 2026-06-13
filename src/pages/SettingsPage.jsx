import React, { useState, useEffect } from 'react'
import { Icon, Switch } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
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
  const [telegramChats, setTelegramChats] = useState([])
  const [telegramLoading, setTelegramLoading] = useState(false)
  
  // Telegram 模态框
  const [telegramModalVisible, setTelegramModalVisible] = useState(false)
  const [telegramEditingId, setTelegramEditingId] = useState(null)
  const [telegramForm, setTelegramForm] = useState({ label: '', chat_id: '' })
  const [telegramTestLoading, setTelegramTestLoading] = useState(false)
  
  // 邮件设置
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [emailSmtp, setEmailSmtp] = useState({
    smtp_host: '',
    smtp_port: '465',
    smtp_user: '',
    smtp_password: '',
  })
  const [emailReceivers, setEmailReceivers] = useState([])
  const [emailLoading, setEmailLoading] = useState(false)
  
  // 邮件模态框
  const [emailModalVisible, setEmailModalVisible] = useState(false)
  const [emailEditingId, setEmailEditingId] = useState(null)
  const [emailForm, setEmailForm] = useState({ label: '', email: '' })
  const [emailTestLoading, setEmailTestLoading] = useState(false)
  
  // 通知标题设置
  const [notifySettings, setNotifySettings] = useState({
    title: '订阅到期提醒',
  })
  const [notifyLoading, setNotifyLoading] = useState(false)
  
  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  })

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
      setTelegramChats(telegram.chats || [])
      
      // 邮件设置
      setEmailEnabled(email.enabled || false)
      if (email.smtp) {
        setEmailSmtp(email.smtp)
      }
      setEmailReceivers(email.receivers || [])
      
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

  // ============ Telegram 操作 ============
  const openTelegramAdd = () => {
    setTelegramEditingId(null)
    setTelegramForm({ label: '', chat_id: '' })
    setTelegramModalVisible(true)
  }

  const openTelegramEdit = (chat) => {
    setTelegramEditingId(chat.id)
    setTelegramForm({ label: chat.label, chat_id: chat.chat_id })
    setTelegramModalVisible(true)
  }

  const handleTelegramSave = async () => {
    if (!telegramForm.label.trim() || !telegramForm.chat_id.trim()) {
      showError('请填写标签和Chat ID')
      return
    }

    const action = telegramEditingId ? '更新' : '添加'
    showConfirm(
      `确认${action}`,
      `确定${action}此 Chat ID 吗？`,
      async () => {
        let newChats
        if (telegramEditingId) {
          newChats = telegramChats.map(chat => 
            chat.id === telegramEditingId 
              ? { ...chat, label: telegramForm.label, chat_id: telegramForm.chat_id }
              : chat
          )
        } else {
          newChats = [...telegramChats, { 
            id: Date.now(), 
            label: telegramForm.label, 
            chat_id: telegramForm.chat_id 
          }]
        }
        
        // 更新本地状态
        setTelegramChats(newChats)
        setTelegramModalVisible(false)
        
        // 自动保存到数据库
        try {
          await saveTelegramSettings({ 
            enabled: telegramEnabled, 
            bot_token: telegramBotToken,
            chats: newChats 
          })
          showSuccess(telegramEditingId ? 'Chat ID 已更新并保存' : 'Chat ID 已添加并保存')
        } catch (error) {
          showError('保存失败')
        }
      }
    )
  }

  const handleTelegramDelete = async (id) => {
    showConfirm(
      '确认删除',
      '确定删除此 Chat ID 吗？',
      async () => {
        const newChats = telegramChats.filter(chat => chat.id !== id)
        setTelegramChats(newChats)
        
        // 自动保存到数据库
        try {
          await saveTelegramSettings({ 
            enabled: telegramEnabled, 
            bot_token: telegramBotToken,
            chats: newChats 
          })
          showSuccess('Chat ID 已删除')
        } catch (error) {
          showError('删除失败')
        }
      },
      'danger'
    )
  }

  const handleTelegramTest = async () => {
    if (!telegramBotToken || !telegramForm.chat_id) {
      showError('请先填写Bot Token和Chat ID')
      return
    }
    setTelegramTestLoading(true)
    try {
      const result = await testTelegram({ 
        bot_token: telegramBotToken, 
        chat_id: telegramForm.chat_id 
      })
      if (result.success) {
        showSuccess('测试通知已发送')
      } else {
        showError('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      showError('测试失败: 网络错误')
    }
    setTelegramTestLoading(false)
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

  // ============ 邮件操作 ============
  const openEmailAdd = () => {
    setEmailEditingId(null)
    setEmailForm({ label: '', email: '' })
    setEmailModalVisible(true)
  }

  const openEmailEdit = (receiver) => {
    setEmailEditingId(receiver.id)
    setEmailForm({ label: receiver.label, email: receiver.email })
    setEmailModalVisible(true)
  }

  const handleEmailSave = async () => {
    if (!emailForm.label.trim() || !emailForm.email.trim()) {
      showError('请填写标签和邮箱')
      return
    }

    const action = emailEditingId ? '更新' : '添加'
    showConfirm(
      `确认${action}`,
      `确定${action}此收件人吗？`,
      async () => {
        let newReceivers
        if (emailEditingId) {
          newReceivers = emailReceivers.map(r => 
            r.id === emailEditingId 
              ? { ...r, label: emailForm.label, email: emailForm.email }
              : r
          )
        } else {
          newReceivers = [...emailReceivers, { 
            id: Date.now(), 
            label: emailForm.label, 
            email: emailForm.email 
          }]
        }
        
        // 更新本地状态
        setEmailReceivers(newReceivers)
        setEmailModalVisible(false)
        
        // 自动保存到数据库
        try {
          await saveEmailSettings({ 
            enabled: emailEnabled, 
            smtp: emailSmtp,
            receivers: newReceivers 
          })
          showSuccess(emailEditingId ? '收件人已更新并保存' : '收件人已添加并保存')
        } catch (error) {
          showError('保存失败')
        }
      }
    )
  }

  const handleEmailDelete = async (id) => {
    showConfirm(
      '确认删除',
      '确定删除此收件人吗？',
      async () => {
        const newReceivers = emailReceivers.filter(r => r.id !== id)
        setEmailReceivers(newReceivers)
        
        // 自动保存到数据库
        try {
          await saveEmailSettings({ 
            enabled: emailEnabled, 
            smtp: emailSmtp,
            receivers: newReceivers 
          })
          showSuccess('收件人已删除')
        } catch (error) {
          showError('删除失败')
        }
      },
      'danger'
    )
  }

  const handleEmailTest = async () => {
    if (!emailSmtp.smtp_host || !emailSmtp.smtp_user || !emailForm.email) {
      showError('请先填写SMTP设置和邮箱')
      return
    }
    setEmailTestLoading(true)
    try {
      const result = await testEmail({ 
        smtp: emailSmtp,
        email: emailForm.email 
      })
      if (result.success) {
        showSuccess('测试邮件已发送')
      } else {
        showError('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      showError('测试失败: 网络错误')
    }
    setEmailTestLoading(false)
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

  // 显示确认弹窗
  const showConfirm = (title, message, onConfirm, type = 'warning') => {
    setConfirmModal({
      visible: true,
      title,
      message,
      onConfirm: () => {
        setConfirmModal({ ...confirmModal, visible: false })
        onConfirm()
      },
      type
    })
  }
  
  // 关闭确认弹窗
  const hideConfirm = () => {
    setConfirmModal({ ...confirmModal, visible: false })
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 左卡片：Telegram Bot 设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              className="btn btn-primary btn-sm" 
              onClick={handleSaveTelegram} 
              disabled={telegramLoading}
            >
              {telegramLoading ? '保存中...' : '保存设置'}
            </button>
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
          </div>
        </div>

        {/* 右卡片：Chat ID 设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
              Chat ID 设置
            </h3>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={openTelegramAdd}
              disabled={!telegramEnabled}
              style={!telegramEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              + 添加
            </button>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
            {telegramChats.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--animal-text-color-disabled)', fontSize: '14px' }}>
                暂无 Chat ID
              </div>
            ) : (
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>操作</th>
                    <th style={{ width: '50px' }}>序号</th>
                    <th>标签</th>
                    <th>Chat ID</th>
                  </tr>
                </thead>
                <tbody>
                  {telegramChats.map((chat, index) => (
                    <tr key={chat.id}>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openTelegramEdit(chat)}
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            编辑
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleTelegramDelete(chat.id)}
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                      <td>{index + 1}</td>
                      <td>{chat.label}</td>
                      <td style={{ fontSize: '12px', color: 'var(--animal-text-color-secondary)' }}>{chat.chat_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 邮件通知设置 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 左卡片：邮件通知设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              className="btn btn-primary btn-sm" 
              onClick={handleSaveEmail} 
              disabled={emailLoading}
            >
              {emailLoading ? '保存中...' : '保存设置'}
            </button>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
            </div>
          </div>
        </div>

        {/* 右卡片：收件人设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
              收件人设置
            </h3>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={openEmailAdd}
              disabled={!emailEnabled}
              style={!emailEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              + 添加
            </button>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
            {emailReceivers.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--animal-text-color-disabled)', fontSize: '14px' }}>
                暂无收件人
              </div>
            ) : (
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>操作</th>
                    <th style={{ width: '50px' }}>序号</th>
                    <th>标签</th>
                    <th>邮箱</th>
                  </tr>
                </thead>
                <tbody>
                  {emailReceivers.map((receiver, index) => (
                    <tr key={receiver.id}>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEmailEdit(receiver)}
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            编辑
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEmailDelete(receiver.id)}
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                      <td>{index + 1}</td>
                      <td>{receiver.label}</td>
                      <td style={{ fontSize: '12px', color: 'var(--animal-text-color-secondary)' }}>{receiver.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 通知标题设置 */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>
            通知标题设置
          </h3>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleSaveNotify} 
            disabled={notifyLoading}
          >
            {notifyLoading ? '保存中...' : '保存设置'}
          </button>
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
        </div>
      </div>

      {/* Telegram Chat ID 模态框 */}
      {telegramModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                {telegramEditingId ? '编辑 Chat ID' : '添加 Chat ID'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setTelegramModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  自定义标签
                  <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '8px', fontWeight: 400, fontSize: '12px' }}>
                    (最多4个中文或8个英文)
                  </span>
                </label>
                <input
                  className="input"
                  value={telegramForm.label}
                  onChange={(e) => {
                    if (validateLabel(e.target.value)) {
                      setTelegramForm({...telegramForm, label: e.target.value})
                    }
                  }}
                  placeholder="例如：工作群"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Chat ID</label>
                <input
                  className="input"
                  value={telegramForm.chat_id}
                  onChange={(e) => setTelegramForm({...telegramForm, chat_id: e.target.value})}
                  placeholder="请输入Chat ID"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleTelegramTest}
                disabled={telegramTestLoading || !telegramBotToken || !telegramForm.chat_id}
              >
                {telegramTestLoading ? '发送中...' : '测试通知'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setTelegramModalVisible(false)}
              >
                取消
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleTelegramSave}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 邮件收件人模态框 */}
      {emailModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                {emailEditingId ? '编辑收件人' : '添加收件人'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setEmailModalVisible(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  自定义标签
                  <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '8px', fontWeight: 400, fontSize: '12px' }}>
                    (最多4个中文或8个英文)
                  </span>
                </label>
                <input
                  className="input"
                  value={emailForm.label}
                  onChange={(e) => {
                    if (validateLabel(e.target.value)) {
                      setEmailForm({...emailForm, label: e.target.value})
                    }
                  }}
                  placeholder="例如：个人邮箱"
                />
              </div>
              <div className="form-group">
                <label className="form-label">收件人邮箱</label>
                <input
                  className="input"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                  placeholder="receiver@email.com"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleEmailTest}
                disabled={emailTestLoading || !emailSmtp.smtp_host || !emailForm.email}
              >
                {emailTestLoading ? '发送中...' : '测试通知'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setEmailModalVisible(false)}
              >
                取消
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleEmailSave}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 确认弹窗 */}
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={hideConfirm}
        type={confirmModal.type}
      />
    </div>
  )
}