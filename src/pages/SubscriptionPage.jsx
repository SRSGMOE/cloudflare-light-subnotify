import React, { useState } from 'react'
import { Icon } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import { createSubscription, updateSubscription, deleteSubscription } from '../api'

export default function SubscriptionPage({ subscriptions, onRefresh, showSuccess, showError }) {
  const { currentTheme } = useTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    content: '',
    cycle_type: 'daily',
    cycle_value: '',
    cycle_hour: '09',
    cycle_minute: '00',
    timezone: 'UTC',
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
    })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setForm({
      name: record.name,
      content: record.content,
      cycle_type: record.cycle_type,
      cycle_value: record.cycle_value || '',
      cycle_hour: record.cycle_hour || '09',
      cycle_minute: record.cycle_minute || '00',
      timezone: record.timezone || 'UTC',
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
    const action = record.is_active ? '暂停' : '恢复'
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
          if (editingId) {
            await updateSubscription(editingId, form)
            showSuccess('更新成功')
          } else {
            await createSubscription(form)
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

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          color: 'var(--animal-text-color)',
          margin: 0,
        }}>
          订阅管理
        </h2>
      </div>
      
      {/* 订阅卡片列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {subscriptions.map((record, index) => (
          <div 
            key={record.id} 
            className="card"
            style={{
              border: '2px solid var(--animal-border-color-light)',
              transition: 'all 0.2s',
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
                    }}>
                      {record.content.length > 50 ? record.content.substring(0, 50) + '...' : record.content}
                    </span>
                  </div>
                )}

                <div>
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
                    <Icon name="icon-diy" size={14} />
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
                    <Icon name={record.is_active ? 'icon-map' : 'icon-miles'} size={14} />
                  ) : (
                    <span>{record.is_active ? '⏸️' : '▶️'}</span>
                  )}
                  {record.is_active ? '暂停' : '恢复'}
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDelete(record)}
                >
                  {currentTheme === 'animal-forest' ? (
                    <Icon item={474} size={14} />
                  ) : (
                    <span>🗑️</span>
                  )}
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* 添加订阅按钮 */}
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <button className="btn btn-primary" onClick={handleAdd}>
            {currentTheme === 'animal-forest' ? (
              <Icon item={478} size={18} />
            ) : (
              <span>➕</span>
            )}
            添加订阅
          </button>
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
            <button className="btn btn-primary" onClick={handleAdd}>
              {currentTheme === 'animal-forest' ? (
                <Icon item={478} size={18} />
              ) : (
                <span>➕</span>
              )}
              添加订阅
            </button>
          </div>
        )}
      </div>

      {/* 编辑/新建订阅模态框 */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
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