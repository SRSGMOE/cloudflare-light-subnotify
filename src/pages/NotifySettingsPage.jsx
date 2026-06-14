import React, { useState, useEffect, useRef } from 'react'
import { Icon, Switch } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  testTelegram,
  getEmailSettings,
  saveEmailSettings,
  testEmail,
  getMiaoSettings,
  saveMiaoSettings,
  testMiao,
  getNotifySettings
} from '../api'

export default function NotifySettingsPage({ showSuccess, showError }) {
  const { currentTheme } = useTheme()
  
  // Telegram
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramChats, setTelegramChats] = useState([])
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramModalVisible, setTelegramModalVisible] = useState(false)
  const [telegramEditingId, setTelegramEditingId] = useState(null)
  const [telegramForm, setTelegramForm] = useState({ label: '', chat_id: '' })
  const telegramTestCooldown = useRef({})
  
  // 邮件
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [emailSmtp, setEmailSmtp] = useState({ smtp_host: '', smtp_port: '465', smtp_user: '', smtp_password: '' })
  const [emailReceivers, setEmailReceivers] = useState([])
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailModalVisible, setEmailModalVisible] = useState(false)
  const [emailEditingId, setEmailEditingId] = useState(null)
  const [emailForm, setEmailForm] = useState({ label: '', email: '' })
  const emailTestCooldown = useRef({})
  
  // 喵提醒
  const [miaoEnabled, setMiaoEnabled] = useState(false)
  const [miaoCodes, setMiaoCodes] = useState([])
  const [miaoLoading, setMiaoLoading] = useState(false)
  const [miaoModalVisible, setMiaoModalVisible] = useState(false)
  const [miaoEditingId, setMiaoEditingId] = useState(null)
  const [miaoForm, setMiaoForm] = useState({ label: '', code: '' })
  const miaoTestCooldown = useRef({})
  
  // 确认弹窗
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', onConfirm: null, type: 'warning' })

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const [telegram, email, miao] = await Promise.all([
        getTelegramSettings(), getEmailSettings(), getMiaoSettings()
      ])
      setTelegramEnabled(telegram.enabled || false)
      setTelegramBotToken(telegram.bot_token || '')
      setTelegramChats(telegram.chats || [])
      setEmailEnabled(email.enabled || false)
      if (email.smtp) setEmailSmtp(email.smtp)
      setEmailReceivers(email.receivers || [])
      setMiaoEnabled(miao.enabled || false)
      setMiaoCodes(miao.codes || [])
    } catch (e) {}
  }

  const validateLabel = (label) => {
    if (!label) return true
    const chineseCount = (label.match(/[\u4e00-\u9fa5]/g) || []).length
    const otherCount = label.length - chineseCount
    return chineseCount <= 4 && otherCount <= 8
  }

  const showConfirm = (title, message, onConfirm, type = 'warning') => {
    setConfirmModal({ visible: true, title, message, onConfirm: () => { setConfirmModal({ ...confirmModal, visible: false }); onConfirm() }, type })
  }
  const hideConfirm = () => setConfirmModal({ ...confirmModal, visible: false })

  const checkCooldown = (ref, id) => {
    const now = Date.now()
    if (now - (ref.current[id] || 0) < 300000) {
      showError('测试太频繁，请等待后再试')
      return false
    }
    ref.current[id] = now
    return true
  }

  const getPreviewMessage = async () => {
    try {
      const res = await fetch('/api/notify-settings')
      const data = await res.json()
      const title = data.title || '订阅到期提醒'
      return '📢 ' + title + '\n\n📦 订阅名称：示例订阅\n🔖 订阅内容：这是订阅内容示例\n🌏 当前时区：北京时间 UTC+8\n📮 通知周期：每周五 14:30\n📆 下次通知：2024-01-12 14:30'
    } catch (e) {
      return '📢 订阅到期提醒\n\n📦 订阅名称：示例订阅\n🔖 订阅内容：这是订阅内容示例\n🌏 当前时区：北京时间 UTC+8\n📮 通知周期：每周五 14:30\n📆 下次通知：2024-01-12 14:30'
    }
  }

  // Telegram 操作
  const handleTelegramSave = async () => {
    if (!telegramForm.label.trim() || !telegramForm.chat_id.trim()) { showError('请填写标签和Chat ID'); return }
    const action = telegramEditingId ? '更新' : '添加'
    showConfirm(`确认${action}`, `确定${action}此 Chat ID 吗？`, async () => {
      let newChats
      if (telegramEditingId) {
        newChats = telegramChats.map(c => c.id === telegramEditingId ? { ...c, label: telegramForm.label, chat_id: telegramForm.chat_id } : c)
      } else {
        newChats = [...telegramChats, { id: Date.now(), label: telegramForm.label, chat_id: telegramForm.chat_id }]
      }
      setTelegramChats(newChats)
      setTelegramModalVisible(false)
      try {
        await saveTelegramSettings({ enabled: telegramEnabled, bot_token: telegramBotToken, chats: newChats })
        showSuccess(telegramEditingId ? 'Chat ID 已更新' : 'Chat ID 已添加')
      } catch (e) { showError('保存失败') }
    })
  }

  const handleTelegramDelete = async (id) => {
    showConfirm('确认删除', '确定删除此 Chat ID 吗？', async () => {
      const newChats = telegramChats.filter(c => c.id !== id)
      setTelegramChats(newChats)
      try {
        await saveTelegramSettings({ enabled: telegramEnabled, bot_token: telegramBotToken, chats: newChats })
        showSuccess('Chat ID 已删除')
      } catch (e) { showError('删除失败') }
    }, 'danger')
  }

  const handleTelegramTest = async (chat) => {
    if (!checkCooldown(telegramTestCooldown, chat.id)) return
    if (!telegramBotToken || !chat.chat_id) { showError('请先填写Bot Token和Chat ID'); return }
    try {
      const message = await getPreviewMessage()
      const result = await testTelegram({ bot_token: telegramBotToken, chat_id: chat.chat_id, message })
      if (result.success) showSuccess('测试通知已发送')
      else showError('测试失败: ' + (result.error || '未知错误'))
    } catch (e) { showError('测试失败: 网络错误') }
  }

  const handleSaveTelegram = async () => {
    setTelegramLoading(true)
    try {
      await saveTelegramSettings({ enabled: telegramEnabled, bot_token: telegramBotToken, chats: telegramChats })
      showSuccess('TG Bot 设置已保存')
    } catch (e) { showError('保存失败') }
    setTelegramLoading(false)
  }

  // 邮件操作
  const handleEmailSave = async () => {
    if (!emailForm.label.trim() || !emailForm.email.trim()) { showError('请填写标签和邮箱'); return }
    const action = emailEditingId ? '更新' : '添加'
    showConfirm(`确认${action}`, `确定${action}此收件人吗？`, async () => {
      let newReceivers
      if (emailEditingId) {
        newReceivers = emailReceivers.map(r => r.id === emailEditingId ? { ...r, label: emailForm.label, email: emailForm.email } : r)
      } else {
        newReceivers = [...emailReceivers, { id: Date.now(), label: emailForm.label, email: emailForm.email }]
      }
      setEmailReceivers(newReceivers)
      setEmailModalVisible(false)
      try {
        await saveEmailSettings({ enabled: emailEnabled, smtp: emailSmtp, receivers: newReceivers })
        showSuccess(emailEditingId ? '收件人已更新' : '收件人已添加')
      } catch (e) { showError('保存失败') }
    })
  }

  const handleEmailDelete = async (id) => {
    showConfirm('确认删除', '确定删除此收件人吗？', async () => {
      const newReceivers = emailReceivers.filter(r => r.id !== id)
      setEmailReceivers(newReceivers)
      try {
        await saveEmailSettings({ enabled: emailEnabled, smtp: emailSmtp, receivers: newReceivers })
        showSuccess('收件人已删除')
      } catch (e) { showError('删除失败') }
    }, 'danger')
  }

  const handleEmailTest = async (receiver) => {
    if (!checkCooldown(emailTestCooldown, receiver.id)) return
    if (!emailSmtp.smtp_host || !emailSmtp.smtp_user || !receiver.email) { showError('请先填写SMTP设置和邮箱'); return }
    try {
      const message = await getPreviewMessage()
      const result = await testEmail({ smtp: emailSmtp, email: receiver.email, message })
      if (result.success) showSuccess('测试邮件已发送')
      else showError('测试失败: ' + (result.error || '未知错误'))
    } catch (e) { showError('测试失败: 网络错误') }
  }

  const handleSaveEmail = async () => {
    setEmailLoading(true)
    try {
      await saveEmailSettings({ enabled: emailEnabled, smtp: emailSmtp, receivers: emailReceivers })
      showSuccess('邮件设置已保存')
    } catch (e) { showError('保存失败') }
    setEmailLoading(false)
  }

  // 喵提醒操作
  const handleMiaoSave = async () => {
    if (!miaoForm.label.trim() || !miaoForm.code.trim()) { showError('请填写标签和喵码'); return }
    const action = miaoEditingId ? '更新' : '添加'
    showConfirm(`确认${action}`, `确定${action}此喵提醒吗？`, async () => {
      let newCodes
      if (miaoEditingId) {
        newCodes = miaoCodes.map(item => item.id === miaoEditingId ? { ...item, label: miaoForm.label, code: miaoForm.code } : item)
      } else {
        newCodes = [...miaoCodes, { id: Date.now(), label: miaoForm.label, code: miaoForm.code }]
      }
      setMiaoCodes(newCodes)
      setMiaoModalVisible(false)
      try {
        await saveMiaoSettings({ enabled: miaoEnabled, codes: newCodes })
        showSuccess(miaoEditingId ? '喵提醒已更新' : '喵提醒已添加')
      } catch (e) { showError('保存失败') }
    })
  }

  const handleMiaoDelete = async (id) => {
    showConfirm('确认删除', '确定删除此喵提醒吗？', async () => {
      const newCodes = miaoCodes.filter(item => item.id !== id)
      setMiaoCodes(newCodes)
      try {
        await saveMiaoSettings({ enabled: miaoEnabled, codes: newCodes })
        showSuccess('喵提醒已删除')
      } catch (e) { showError('删除失败') }
    }, 'danger')
  }

  const handleMiaoTest = async (item) => {
    if (!checkCooldown(miaoTestCooldown, item.id)) return
    if (!item.code) { showError('请先填写喵码'); return }
    try {
      const message = await getPreviewMessage()
      const result = await testMiao({ code: item.code, message })
      if (result.success) showSuccess('测试通知已发送')
      else showError('测试失败: ' + (result.error || '未知错误'))
    } catch (e) { showError('测试失败: 网络错误') }
  }

  const handleSaveMiao = async () => {
    setMiaoLoading(true)
    try {
      await saveMiaoSettings({ enabled: miaoEnabled, codes: miaoCodes })
      showSuccess('喵提醒设置已保存')
    } catch (e) { showError('保存失败') }
    setMiaoLoading(false)
  }

  const renderSwitchStatus = (enabled) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: enabled ? 'var(--animal-success-color)' : 'var(--animal-error-color)',
        boxShadow: enabled ? '0 0 6px var(--animal-success-color)' : '0 0 6px var(--animal-error-color)',
      }} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: enabled ? 'var(--animal-success-color)' : 'var(--animal-error-color)' }}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  )

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--animal-text-color)', marginBottom: '24px' }}>
        通知设置
      </h2>

      <div style={{ maxWidth: '60%', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }} className="settings-container">

        {/* TG Bot 设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>TG Bot 设置</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch checked={telegramEnabled} onChange={setTelegramEnabled} size="small" />
                {renderSwitchStatus(telegramEnabled)}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleSaveTelegram} disabled={telegramLoading}>
              {telegramLoading ? '保存中...' : '保存设置'}
            </button>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Bot Token</label>
              <input className="input" value={telegramBotToken} onChange={(e) => setTelegramBotToken(e.target.value)} placeholder="请输入Bot Token" disabled={!telegramEnabled} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label className="form-label" style={{ margin: 0 }}>Chat ID 列表</label>
                <button className="btn btn-secondary btn-sm" onClick={() => { setTelegramEditingId(null); setTelegramForm({ label: '', chat_id: '' }); setTelegramModalVisible(true) }} disabled={!telegramEnabled} style={!telegramEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>+ 添加</button>
              </div>
              {telegramChats.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--animal-text-color-disabled)', fontSize: '13px', background: 'var(--animal-bg-color)', borderRadius: 'var(--animal-border-radius-sm)', border: '1px dashed var(--animal-border-color-light)' }}>暂无 Chat ID</div>
              ) : (
                <table className="table" style={{ margin: 0 }}>
                  <thead><tr><th style={{ width: '35px', textAlign: 'left', paddingLeft: '12px' }}>#</th><th style={{ width: '80px' }}>标签</th><th>Chat ID</th><th style={{ width: '150px', textAlign: 'right', paddingRight: '12px' }}></th></tr></thead>
                  <tbody>
                    {telegramChats.map((chat, index) => (
                      <tr key={chat.id}>
                        <td style={{ textAlign: 'left', paddingLeft: '12px', color: 'var(--animal-text-color-secondary)', fontSize: '12px' }}>{index + 1}</td>
                        <td>{chat.label}</td>
                        <td style={{ fontSize: '12px', color: 'var(--animal-text-color-secondary)' }}>{chat.chat_id}</td>
                        <td style={{ textAlign: 'right', paddingRight: '12px' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleTelegramTest(chat)} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>测试</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setTelegramEditingId(chat.id); setTelegramForm({ label: chat.label, chat_id: chat.chat_id }); setTelegramModalVisible(true) }} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>编辑</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleTelegramDelete(chat.id)} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* 邮件通知设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>邮件通知设置</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch checked={emailEnabled} onChange={setEmailEnabled} size="small" />
                {renderSwitchStatus(emailEnabled)}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleSaveEmail} disabled={emailLoading}>
              {emailLoading ? '保存中...' : '保存设置'}
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group"><label className="form-label" style={{ fontSize: '12px' }}>SMTP 服务器</label><input className="input" value={emailSmtp.smtp_host} onChange={(e) => setEmailSmtp({...emailSmtp, smtp_host: e.target.value})} placeholder="smtp.qq.com" disabled={!emailEnabled} style={{ fontSize: '13px' }} /></div>
              <div className="form-group"><label className="form-label" style={{ fontSize: '12px' }}>SMTP 端口</label><input className="input" value={emailSmtp.smtp_port} onChange={(e) => setEmailSmtp({...emailSmtp, smtp_port: e.target.value})} placeholder="465" disabled={!emailEnabled} style={{ fontSize: '13px' }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group"><label className="form-label" style={{ fontSize: '12px' }}>SMTP 用户名</label><input className="input" value={emailSmtp.smtp_user} onChange={(e) => setEmailSmtp({...emailSmtp, smtp_user: e.target.value})} placeholder="your@email.com" disabled={!emailEnabled} style={{ fontSize: '13px' }} /></div>
              <div className="form-group"><label className="form-label" style={{ fontSize: '12px' }}>SMTP 密码/授权码</label><input className="input" type="password" value={emailSmtp.smtp_password} onChange={(e) => setEmailSmtp({...emailSmtp, smtp_password: e.target.value})} placeholder="授权码" disabled={!emailEnabled} style={{ fontSize: '13px' }} /></div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label className="form-label" style={{ margin: 0 }}>收件人列表</label>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEmailEditingId(null); setEmailForm({ label: '', email: '' }); setEmailModalVisible(true) }} disabled={!emailEnabled} style={!emailEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>+ 添加</button>
              </div>
              {emailReceivers.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--animal-text-color-disabled)', fontSize: '13px', background: 'var(--animal-bg-color)', borderRadius: 'var(--animal-border-radius-sm)', border: '1px dashed var(--animal-border-color-light)' }}>暂无收件人</div>
              ) : (
                <table className="table" style={{ margin: 0 }}>
                  <thead><tr><th style={{ width: '35px', textAlign: 'left', paddingLeft: '12px' }}>#</th><th style={{ width: '80px' }}>标签</th><th>邮箱</th><th style={{ width: '150px', textAlign: 'right', paddingRight: '12px' }}></th></tr></thead>
                  <tbody>
                    {emailReceivers.map((receiver, index) => (
                      <tr key={receiver.id}>
                        <td style={{ textAlign: 'left', paddingLeft: '12px', color: 'var(--animal-text-color-secondary)', fontSize: '12px' }}>{index + 1}</td>
                        <td>{receiver.label}</td>
                        <td style={{ fontSize: '12px', color: 'var(--animal-text-color-secondary)' }}>{receiver.email}</td>
                        <td style={{ textAlign: 'right', paddingRight: '12px' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEmailTest(receiver)} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>测试</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setEmailEditingId(receiver.id); setEmailForm({ label: receiver.label, email: receiver.email }); setEmailModalVisible(true) }} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>编辑</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleEmailDelete(receiver.id)} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* 喵提醒设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>喵提醒设置</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Switch checked={miaoEnabled} onChange={setMiaoEnabled} size="small" />
                {renderSwitchStatus(miaoEnabled)}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleSaveMiao} disabled={miaoLoading}>
              {miaoLoading ? '保存中...' : '保存设置'}
            </button>
          </div>
          <div className="card-body">
            <div style={{ marginTop: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label className="form-label" style={{ margin: 0 }}>喵码列表</label>
                <button className="btn btn-secondary btn-sm" onClick={() => { setMiaoEditingId(null); setMiaoForm({ label: '', code: '' }); setMiaoModalVisible(true) }} disabled={!miaoEnabled} style={!miaoEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>+ 添加</button>
              </div>
              {miaoCodes.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--animal-text-color-disabled)', fontSize: '13px', background: 'var(--animal-bg-color)', borderRadius: 'var(--animal-border-radius-sm)', border: '1px dashed var(--animal-border-color-light)' }}>暂无喵码</div>
              ) : (
                <table className="table" style={{ margin: 0 }}>
                  <thead><tr><th style={{ width: '35px', textAlign: 'left', paddingLeft: '12px' }}>#</th><th style={{ width: '80px' }}>标签</th><th>喵码</th><th style={{ width: '150px', textAlign: 'right', paddingRight: '12px' }}></th></tr></thead>
                  <tbody>
                    {miaoCodes.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ textAlign: 'left', paddingLeft: '12px', color: 'var(--animal-text-color-secondary)', fontSize: '12px' }}>{index + 1}</td>
                        <td>{item.label}</td>
                        <td style={{ fontSize: '12px', color: 'var(--animal-text-color-secondary)' }}>{item.code}</td>
                        <td style={{ textAlign: 'right', paddingRight: '12px' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleMiaoTest(item)} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>测试</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setMiaoEditingId(item.id); setMiaoForm({ label: item.label, code: item.code }); setMiaoModalVisible(true) }} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>编辑</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleMiaoDelete(item.id)} style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Telegram 模态框 */}
      {telegramModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>{telegramEditingId ? '编辑 Chat ID' : '添加 Chat ID'}</h3><button className="modal-close" onClick={() => setTelegramModalVisible(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">自定义标签 <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '8px', fontWeight: 400, fontSize: '12px' }}>(最多4个中文或8个英文)</span></label><input className="input" value={telegramForm.label} onChange={(e) => { if (validateLabel(e.target.value)) setTelegramForm({...telegramForm, label: e.target.value}) }} placeholder="例如：工作群" /></div>
              <div className="form-group"><label className="form-label">Chat ID</label><input className="input" value={telegramForm.chat_id} onChange={(e) => setTelegramForm({...telegramForm, chat_id: e.target.value})} placeholder="请输入Chat ID" /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setTelegramModalVisible(false)}>取消</button><button className="btn btn-primary" onClick={handleTelegramSave}>保存</button></div>
          </div>
        </div>
      )}

      {/* 邮件模态框 */}
      {emailModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>{emailEditingId ? '编辑收件人' : '添加收件人'}</h3><button className="modal-close" onClick={() => setEmailModalVisible(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">自定义标签 <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '8px', fontWeight: 400, fontSize: '12px' }}>(最多4个中文或8个英文)</span></label><input className="input" value={emailForm.label} onChange={(e) => { if (validateLabel(e.target.value)) setEmailForm({...emailForm, label: e.target.value}) }} placeholder="例如：个人邮箱" /></div>
              <div className="form-group"><label className="form-label">收件人邮箱</label><input className="input" value={emailForm.email} onChange={(e) => setEmailForm({...emailForm, email: e.target.value})} placeholder="receiver@email.com" /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setEmailModalVisible(false)}>取消</button><button className="btn btn-primary" onClick={handleEmailSave}>保存</button></div>
          </div>
        </div>
      )}

      {/* 喵提醒模态框 */}
      {miaoModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header"><h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>{miaoEditingId ? '编辑喵提醒' : '添加喵提醒'}</h3><button className="modal-close" onClick={() => setMiaoModalVisible(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">自定义标签 <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '8px', fontWeight: 400, fontSize: '12px' }}>(最多4个中文或8个英文)</span></label><input className="input" value={miaoForm.label} onChange={(e) => { if (validateLabel(e.target.value)) setMiaoForm({...miaoForm, label: e.target.value}) }} placeholder="例如：手机提醒" /></div>
              <div className="form-group"><label className="form-label">喵码</label><input className="input" value={miaoForm.code} onChange={(e) => setMiaoForm({...miaoForm, code: e.target.value})} placeholder="请输入喵码" /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setMiaoModalVisible(false)}>取消</button><button className="btn btn-primary" onClick={handleMiaoSave}>保存</button></div>
          </div>
        </div>
      )}

      <ConfirmModal visible={confirmModal.visible} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={hideConfirm} type={confirmModal.type} />
    </div>
  )
}