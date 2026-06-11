import React, { useState } from 'react'
import { Button, Card, Table, Modal, Input, Select } from 'animal-island-ui'
import { createSubscription, updateSubscription, deleteSubscription } from '../api'

export default function SubscriptionPage({ subscriptions, onRefresh }) {
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

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_, __, index) => index + 1 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '周期', key: 'cycle', render: (_, record) => getCycleLabel(record) },
    { title: '时区', dataIndex: 'timezone', key: 'timezone', render: (tz) => tzLabels[tz] || tz },
    { 
      title: '下次通知', key: 'next_notify', 
      render: (_, record) => `${record.next_notify_date} ${record.cycle_hour || '09'}:${record.cycle_minute || '00'}`
    },
    { 
      title: '状态', dataIndex: 'is_active', key: 'status',
      render: (active) => (
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          background: active ? 'var(--animal-primary-color-bg)' : '#fde8e8',
          color: active ? 'var(--animal-primary-color-active)' : 'var(--animal-error-color)',
        }}>
          {active ? '活跃' : '暂停'}
        </span>
      )
    },
    {
      title: '操作', key: 'action', width: 220,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => handleEdit(record)}>
            ✏️ 编辑
          </Button>
          <Button size="small" onClick={() => handleToggle(record)}>
            {record.is_active ? '⏸️ 暂停' : '▶️ 恢复'}
          </Button>
          <Button size="small" danger onClick={() => {
            if (window.confirm('确定删除此订阅？')) handleDelete(record.id)
          }}>
            🗑️ 删除
          </Button>
        </div>
      ),
    },
  ]

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
    try {
      await deleteSubscription(id)
      alert('删除成功')
      onRefresh()
    } catch (error) {
      alert('删除失败')
    }
  }

  const handleToggle = async (record) => {
    try {
      await updateSubscription(record.id, { is_active: !record.is_active })
      alert(record.is_active ? '已暂停' : '已恢复')
      onRefresh()
    } catch (error) {
      alert('操作失败')
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.content) {
      alert('请填写名称和内容')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        await updateSubscription(editingId, form)
        alert('更新成功')
      } else {
        await createSubscription(form)
        alert('添加成功')
      }
      setModalVisible(false)
      onRefresh()
    } catch (error) {
      alert('操作失败')
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
        <Button type="primary" onClick={handleAdd}>
          ➕ 新建订阅
        </Button>
      </div>
      
      <Card style={{ borderRadius: '20px', padding: '0', overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingId ? '编辑订阅' : '新建订阅'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
              名称 *
            </label>
            <Input
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="请输入订阅名称"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
              内容 *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => updateForm('content', e.target.value)}
              placeholder="请输入订阅内容"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '2px solid var(--animal-border-color)',
                borderRadius: 'var(--animal-border-radius-sm)',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                周期类型 *
              </label>
              <select
                value={form.cycle_type}
                onChange={(e) => updateForm('cycle_type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid var(--animal-border-color)',
                  borderRadius: 'var(--animal-border-radius-sm)',
                  fontSize: '14px',
                }}
              >
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
                <option value="yearly">每年</option>
                <option value="specific">指定日期</option>
              </select>
            </div>

            {form.cycle_type !== 'daily' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                  {form.cycle_type === 'weekly' ? '星期几 (1-7)' :
                   form.cycle_type === 'monthly' ? '日期 (1-28)' :
                   form.cycle_type === 'yearly' ? '日期 (MM-DD)' : '指定日期'}
                </label>
                <Input
                  value={form.cycle_value}
                  onChange={(e) => updateForm('cycle_value', e.target.value)}
                  placeholder={
                    form.cycle_type === 'weekly' ? '1-7 (周一到周日)' :
                    form.cycle_type === 'monthly' ? '1-28' :
                    form.cycle_type === 'yearly' ? 'MM-DD' : 'YYYY-MM-DD'
                  }
                  type={form.cycle_type === 'specific' ? 'date' : 'text'}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                通知小时 (0-23)
              </label>
              <Input
                value={form.cycle_hour}
                onChange={(e) => updateForm('cycle_hour', e.target.value)}
                type="number"
                min={0}
                max={23}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
                通知分钟
              </label>
              <select
                value={form.cycle_minute}
                onChange={(e) => updateForm('cycle_minute', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid var(--animal-border-color)',
                  borderRadius: 'var(--animal-border-radius-sm)',
                  fontSize: '14px',
                }}
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

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--animal-text-color)' }}>
              时区 *
            </label>
            <select
              value={form.timezone}
              onChange={(e) => updateForm('timezone', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--animal-border-color)',
                borderRadius: 'var(--animal-border-radius-sm)',
                fontSize: '14px',
              }}
            >
              <option value="UTC">世界协调时 UTC</option>
              <option value="CST">北京时间 UTC+8</option>
              <option value="ET">美国东部 UTC-4</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}