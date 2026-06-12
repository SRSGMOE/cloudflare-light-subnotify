import React, { useState, useEffect } from 'react'
import { Icon, Checkbox } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import { 
  createSubscription, 
  updateSubscription, 
  deleteSubscription,
  getTelegramSettings,
  getEmailSettings
} from '../api'

export default function SubscriptionPage({ subscriptions, onRefresh, showSuccess, showError }) {
  const { currentTheme } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // 通知途径选项
  const [notifyChannels, setNotifyChannels] = useState([])
  
  const [form, setForm] = useState({
    name: '',
    content: '',
    cycle_type: 'daily',
    cycle_value: '',
    cycle_hour: '09',
    cycle_minute: '00',
    timezone: 'UTC',
    notify_channels: [],
  })

  const cycleLabels = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
    specific: '指定日期',
  }

  const tzLabels = {
    'UTC': '世界协调时 UTC',
    'CST': '北京时间 UTC+8',
    'ET': '美国东部 UTC-4',
  }

  useEffect(() => {
    fetchNotifyChannels()
  }, [])

  const fetchNotifyChannels = async () => {
    try {
      const [telegram, email] = await Promise.all([
        getTelegramSettings(),
        getEmailSettings()
      ])
      
      const channels = []
      
      // Telegram 渠道 - 只在总开关打开时显示
      if (telegram.enabled && telegram.chats) {
        telegram.chats.forEach((chat, index) => {
          if (chat.chat_id) {
            channels.push({
              key: `tg_${chat.id}`,
              type: 'telegram',
              label: chat.label ? `TG BOT（${chat.label}）` : `TG BOT #${index + 1}`,
              chat_id: chat.chat_id,
            })
          }
        })
      }
      
      // 邮件渠道 - 只在总开关打开时显示
      if (email.enabled && email.receivers) {
        email.receivers.forEach((receiver, index) => {
          if (receiver.email) {
            channels.push({
              key: `email_${receiver.id}`,
              type: 'email',
              label: receiver.label ? `邮件（${receiver.label}）` : `邮件 #${index + 1}`,
              email: receiver.email,
            })
          }
        })
      }
      
      setNotifyChannels(channels)
    } catch (error) {
      console.error('Fetch notify channels failed:', error)
    }
  }

  const getCycleLabel = (record) => {
    const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
    let label = cycleLabels[record.cycle_type] || record.cycle_type

    if (record.cycle_type === 'weekly' && record.cycle_value) {
      label += days[parseInt(record.cycle_value)] || ''
    } else if (record.cycle_type === 'monthly' && record.cycle_value) {
      label += record.cycle_value + '日'
    } else if (record.cycle_type === 'yearly' && record.cycle_value) {
      const parts = record.cycle_value.split('-')
      label += parts[0] + '月' + parts[1] + '日'
    } else if (record.cycle_type === 'specific' && record.cycle_value) {
      label = record.cycle_value
    }

    return label + ' ' + (record.cycle_hour || '09') + ':' + (record.cycle_minute || '00')
  }

  // 显示确认弹窗
  const showConfirm = (title, message, action) => {
    setConfirmTitle(title)
    setConfirmMessage(message)
    setConfirmAction(() => action)
    setConfirmVisible(true)
  }

  // 执行确认操作
  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction()
    }
    setConfirmVisible(false)
    setConfirmAction(null)
  }

  // 取消确认
  const handleCancelConfirm = () => {
    setConfirmVisible(false)
    setConfirmAction(null)
  }

  const handleAdd = () => {
    setEditingId(null)
    setForm({
      name: '',
      content: '',
      cycle_type: 'daily',
      cycle_value: '',
      cycle_hour: '09',
      cycle_minute: '00',
      timezone: 'UTC',
      notify_channels: [],
    })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    let channels = []
    try {
      channels = record.notify_channels ? JSON.parse(record.notify_channels) : []
    } catch (e) {}
    
    setForm({
      name: record.name,
      content: record.content,
      cycle_type: record.cycle_type,
      cycle_value: record.cycle_value || '',
      cycle_hour: record.cycle_hour || '09',
      cycle_minute: record.cycle_minute || '00',
      timezone: record.timezone || 'UTC',
      notify_channels: channels,
    })
    setModalVisible(true)
  }

  const handleDelete = (record) => {
    showConfirm(
      '确认删除',
      `确定要删除订阅「${record.name}」吗？此操作不可撤销。`,
      async () => {
        try {
          await deleteSubscription(record.id)
          showSuccess('删除成功')
          onRefresh()
        } catch (error) {
          showError('删除失败')
        }
      }
    )
  }

  const handleToggle = (record) => {
    const action = record.is_active ? '停止' : '恢复'
    showConfirm(
      `确认${action}`,
      `确定要${action}订阅「${record.name}」吗？`,
      async () => {
        try {
          await updateSubscription(record.id, { is_active: !record.is_active })
          showSuccess(`已${action}`)
          onRefresh()
        } catch (error) {
          showError('操作失败')
        }
      }
    )
  }

  const handleSubmit = () => {
    if (!form.name || !form.content) {
      showError('请填写名称和内容')
      return
    }

    const action = editingId ? '更新' : '创建'
    showConfirm(
      `确认${action}`,
      `确定要${action}订阅「${form.name}」吗？`,
      async () => {
        setLoading(true)
        try {
          const data = {
            ...form,
            notify_channels: JSON.stringify(form.notify_channels)
          }
          
          if (editingId) {
            await updateSubscription(editingId, data)
            showSuccess('更新成功')
          } else {
            await createSubscription(data)
            showSuccess('添加成功')
          }
          setModalVisible(false)
          onRefresh()
        } catch (error) {
          showError('操作失败')
        }
        setLoading(false)
      }
    )
  }

  const handleCancelEdit = () => {
    showConfirm(
      '确认取消',
      '确定要取消编辑吗？未保存的内容将丢失。',
      () => {
        setModalVisible(false)
      }
    )
  }

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const toggleChannel = (channelKey) => {
    setForm(prev => {
      const channels = [...prev.notify_channels]
      const index = channels.indexOf(channelKey)
      if (index > -1) {
        channels.splice(index, 1)
      } else {
        channels.push(channelKey)
      }
      return { ...prev, notify_channels: channels }
    })
  }

  // 获取订阅的通知途径显示文本
  const getNotifyChannelsText = (record) => {
    try {
      const channels = record.notify_channels ? JSON.parse(record.notify_channels) : []
      if (channels.length === 0) return '未设置'
      return channels.map(key => {
        const channel = notifyChannels.find(c => c.key === key)
        return channel ? channel.label : key
      }).join('、')
    } catch (e) {
      return '未设置'
    }
  }

  return (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 700, 
        color: 'var(--animal-text-color)',
        margin: 0,
        marginBottom: '16px',
      }}>
        订阅管理
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={handleAdd}>
          {currentTheme !== 'animal-forest' && <span>➕</span>}
          添加订阅
        </button>
      </div>
      
      {/* 订阅卡片列表 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '16px',
        marginBottom: '24px',
      }}>
        {subscriptions.map((record, index) => (
          <div 
            key={record.id} 
            className="card"
            style={{
              border: '2px solid var(--animal-border-color-light)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = 'var(--animal-shadow-lg)'
              e.currentTarget.style.borderColor = 'var(--animal-primary-color)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--animal-shadow-base)'
              e.currentTarget.style.borderColor = 'var(--animal-border-color-light)'
            }}
          >
            <div style={{ padding: '20px' }}>
              {/* 头部：序号和状态 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <div style={{
                  background: 'var(--animal-primary-color-bg)',
                  color: 'var(--animal-primary-color)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  #{index + 1}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: record.is_active ? 'var(--animal-success-color)' : 'var(--animal-error-color)',
                    boxShadow: record.is_active 
                      ? '0 0 8px var(--animal-success-color)' 
                      : '0 0 8px var(--animal-error-color)',
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: record.is_active ? 'var(--animal-success-color)' : 'var(--animal-error-color)',
                  }}>
                    {record.is_active ? 'Active' : 'Stop'}
                  </span>
                </div>
              </div>
              
              {/* 内容区域 */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--animal-text-color-secondary)',
                    marginRight: '8px',
                  }}>
                    名称：
                  </span>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    color: 'var(--animal-text-color)',
                  }}>
                    {record.name}
                  </span>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--animal-text-color-secondary)',
                    marginRight: '8px',
                  }}>
                    周期：
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'var(--animal-text-color)',
                  }}>
                    {getCycleLabel(record)}
                  </span>
                </div>

                {record.content && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--animal-text-color-secondary)',
                      marginRight: '8px',
                    }}>
                      内容：
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: 'var(--animal-text-color-secondary)',
                      display: 'inline-block',
                      maxWidth: 'calc(100% - 40px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle',
                    }}>
                      {record.content}
                    </span>
                  </div>
                )}

                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--animal-text-color-secondary)',
                    marginRight: '8px',
                  }}>
                    时区：
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'var(--animal-text-color-secondary)',
                  }}>
                    {tzLabels[record.timezone] || record.timezone}
                  </span>
                </div>

                <div>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--animal-text-color-secondary)',
                    marginRight: '8px',
                  }}>
                    途径：
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--animal-primary-color)',
                    fontWeight: 500,
                  }}>
                    {getNotifyChannelsText(record)}
                  </span>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '12px',
                borderTop: '1px solid var(--animal-border-color-light)',
                paddingTop: '16px',
              }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleEdit(record)}
                >
                  {currentTheme === 'animal-forest' ? (
                    <Icon item={1} size={14} />
                  ) : (
                    <span>✏️</span>
                  )}
                  编辑
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggle(record)}
                  style={{
                    color: record.is_active ? 'var(--animal-warning-color)' : 'var(--animal-success-color)',
                    borderColor: record.is_active ? 'var(--animal-warning-color)' : 'var(--animal-success-color)',
                  }}
                >
                  {currentTheme === 'animal-forest' ? (
                    <Icon item={record.is_active ? 387 : 385} size={14} />
                  ) : (
                    <span>{record.is_active ? '⏹️' : '▶️'}</span>
                  )}
                  {record.is_active ? '停止' : '恢复'}
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDelete(record)}
                >
                  {currentTheme === 'animal-forest' ? (
                    <Icon item={463} size={14} />
                  ) : (
                    <span>🗑️</span>
                  )}
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 空状态 */}
      {subscriptions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--animal-text-color-secondary)' }}>
          <div style={{ marginBottom: '16px' }}>
            {currentTheme === 'animal-forest' ? (
              <Icon name="icon-design" size={64} />
            ) : (
              <span style={{ fontSize: '64px' }}>📋</span>
            )}
          </div>
          <p style={{ marginBottom: '16px', fontSize: '16px' }}>暂无订阅数据</p>
          <p style={{ fontSize: '14px', color: 'var(--animal-text-color-disabled)' }}>点击上方「添加订阅」按钮创建第一个订阅</p>
        </div>
      )}

      {/* 编辑/新建订阅模态框 */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                {editingId ? '编辑订阅' : '新建订阅'}
              </h3>
              <button 
                className="modal-close"
                onClick={handleCancelEdit}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">名称 *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="请输入订阅名称"
                />
              </div>

              <div className="form-group">
                <label className="form-label">内容 *</label>
                <textarea
                  className="textarea"
                  value={form.content}
                  onChange={(e) => updateForm('content', e.target.value)}
                  placeholder="请输入订阅内容"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">周期类型 *</label>
                  <select
                    className="select"
                    value={form.cycle_type}
                    onChange={(e) => updateForm('cycle_type', e.target.value)}
                  >
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="yearly">每年</option>
                    <option value="specific">指定日期</option>
                  </select>
                </div>

                {form.cycle_type !== 'daily' && (
                  <div className="form-group">
                    <label className="form-label">
                      {form.cycle_type === 'weekly' ? '星期几 (1-7)' :
                       form.cycle_type === 'monthly' ? '日期 (1-28)' :
                       form.cycle_type === 'yearly' ? '日期 (MM-DD)' : '指定日期'}
                    </label>
                    <input
                      className="input"
                      value={form.cycle_value}
                      onChange={(e) => updateForm('cycle_value', e.target.value)}
                      placeholder={
                        form.cycle_type === 'weekly' ? '1-7' :
                        form.cycle_type === 'monthly' ? '1-28' :
                        form.cycle_type === 'yearly' ? 'MM-DD' : 'YYYY-MM-DD'
                      }
                      type={form.cycle_type === 'specific' ? 'date' : 'text'}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">通知小时 (0-23)</label>
                  <input
                    className="input"
                    value={form.cycle_hour}
                    onChange={(e) => updateForm('cycle_hour', e.target.value)}
                    type="number"
                    min={0}
                    max={23}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">通知分钟</label>
                  <select
                    className="select"
                    value={form.cycle_minute}
                    onChange={(e) => updateForm('cycle_minute', e.target.value)}
                  >
                    <option value="00">00</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">时区 *</label>
                <select
                  className="select"
                  value={form.timezone}
                  onChange={(e) => updateForm('timezone', e.target.value)}
                >
                  <option value="UTC">世界协调时 UTC</option>
                  <option value="CST">北京时间 UTC+8</option>
                  <option value="ET">美国东部 UTC-4</option>
                </select>
              </div>

              {/* 通知途径选择 */}
              <div className="form-group">
                <label className="form-label">
                  通知途径
                  <span style={{ color: 'var(--animal-text-color-disabled)', marginLeft: '8px', fontWeight: 400 }}>
                    （可多选）
                  </span>
                </label>
                <div style={{ 
                  padding: '12px',
                  background: 'var(--animal-bg-color)',
                  borderRadius: 'var(--animal-border-radius-sm)',
                  border: '1px solid var(--animal-border-color-light)',
                }}>
                  {notifyChannels.length === 0 ? (
                    <div style={{ 
                      color: 'var(--animal-text-color-disabled)', 
                      fontSize: '14px',
                      textAlign: 'center',
                      padding: '8px',
                    }}>
                      暂无可用的通知途径，请先在系统设置中配置
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifyChannels.map(channel => (
                        <label 
                          key={channel.key}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--animal-primary-color-bg)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={form.notify_channels.includes(channel.key)}
                            onChange={() => toggleChannel(channel.key)}
                            style={{ 
                              width: '18px', 
                              height: '18px',
                              cursor: 'pointer',
                            }}
                          />
                          <span style={{ 
                            fontSize: '14px', 
                            color: 'var(--animal-text-color)',
                            fontWeight: form.notify_channels.includes(channel.key) ? 600 : 400,
                          }}>
                            {channel.type === 'telegram' ? '📱' : '📧'} {channel.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 二次确认弹窗 */}
      {confirmVisible && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                {confirmTitle}
              </h3>
              <button 
                className="modal-close"
                onClick={handleCancelConfirm}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--animal-text-color)',
                lineHeight: '1.6',
                margin: 0,
              }}>
                {confirmMessage}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCancelConfirm}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}