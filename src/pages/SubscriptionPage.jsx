import React, { useState } from 'react'
import { Icon } from 'animal-island-ui'
import { createSubscription, updateSubscription, deleteSubscription } from '../api'

export default function SubscriptionPage({ subscriptions, onRefresh, showSuccess, showError }) {
  const [modalVisible, setModalVisible] = useState(false)
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

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除此订阅？')) return
    try {
      await deleteSubscription(id)
      showSuccess('删除成功')
      onRefresh()
    } catch (error) {
      showError('删除失败')
    }
  }

  const handleToggle = async (record) => {
    try {
      await updateSubscription(record.id, { is_active: !record.is_active })
      showSuccess(record.is_active ? '已暂停' : '已恢复')
      onRefresh()
    } catch (error) {
      showError('操作失败')
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.content) {
      showError('请填写名称和内容')
      return
    }

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
      
      <div className="card">
        {subscriptions.length > 0 ? (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>名称</th>
                  <th>内容</th>
                  <th>周期</th>
                  <th>时区</th>
                  <th>下次通知</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>{record.name}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.content}
                    </td>
                    <td>{getCycleLabel(record)}</td>
                    <td>{tzLabels[record.timezone] || record.timezone}</td>
                    <td>{record.next_notify_date} {record.cycle_hour || '09'}:{record.cycle_minute || '00'}</td>
                    <td>
                      <span className={`tag ${record.is_active ? 'tag-green' : 'tag-red'}`}>
                        {record.is_active ? '活跃' : '暂停'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(record)}>
                          <Icon name="icon-diy" size={14} />
                          编辑
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(record)}>
                          <Icon name={record.is_active ? 'icon-map' : 'icon-miles'} size={14} />
                          {record.is_active ? '暂停' : '恢复'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(record.id)}>
                          <Icon item={474} size={14} />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '16px 20px', borderTop: '2px solid var(--animal-border-color-light)', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={handleAdd}>
                <Icon item={478} size={18} />
                添加订阅
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--animal-text-color-secondary)' }}>
            <div style={{ marginBottom: '16px' }}>
              <Icon name="icon-design" size={64} />
            </div>
            <p style={{ marginBottom: '16px' }}>暂无订阅数据</p>
            <button className="btn btn-primary" onClick={handleAdd}>
              <Icon item={478} size={18} />
              添加订阅
            </button>
          </div>
        )}
      </div>

      {/* 模态框 */}
      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                {editingId ? '编辑订阅' : '新建订阅'}
              </h3>
              <button 
                onClick={() => setModalVisible(false)}
                style={{
                  background: 'var(--animal-bg-color)',
                  border: '2px solid var(--animal-border-color)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
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
              <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}