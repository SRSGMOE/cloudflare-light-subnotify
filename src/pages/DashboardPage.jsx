import React, { useState, useEffect } from 'react'
import { Icon } from 'animal-island-ui'

export default function DashboardPage({ subscriptions }) {
  const [utcTime, setUtcTime] = useState('')
  const [cstTime, setCstTime] = useState('')
  const [etTime, setEtTime] = useState('')

  useEffect(() => {
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const updateTime = () => {
    const now = new Date()
    setUtcTime(formatDateTime(now, 0))
    setCstTime(formatDateTime(now, 8))
    setEtTime(formatDateTime(now, -4))
  }

  const formatDateTime = (date, offsetHours) => {
    const local = new Date(date.getTime() + offsetHours * 3600000)
    const year = local.getUTCFullYear()
    const month = String(local.getUTCMonth() + 1).padStart(2, '0')
    const day = String(local.getUTCDate()).padStart(2, '0')
    const hours = String(local.getUTCHours()).padStart(2, '0')
    const minutes = String(local.getUTCMinutes()).padStart(2, '0')
    const seconds = String(local.getUTCSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const active = subscriptions.filter(s => s.is_active)
  const paused = subscriptions.filter(s => !s.is_active)

  return (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 700, 
        color: 'var(--animal-text-color)',
        marginBottom: '24px',
      }}>
        数据表盘
      </h2>
      
      {/* 提示卡片 */}
      <div className="card" style={{
        marginBottom: '24px',
        background: 'var(--animal-warning-color)',
        border: '2px solid var(--animal-warning-color-active)',
      }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Icon item={440} size={28} bounce />
            <span style={{ fontWeight: 600, color: 'var(--animal-text-color)' }}>
              温馨提示：建议您先把设备时间进行一次同步更新再进行操作，以确保时间显示准确。
            </span>
          </div>
        </div>
      </div>
      
      {/* 时间卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, #5B9BD5, #4472C4)',
          color: '#fff',
        }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon item={477} size={16} />
              <span style={{ fontSize: '12px', opacity: 0.9 }}>世界协调时 UTC</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              {utcTime}
            </div>
          </div>
        </div>
        
        <div className="card" style={{
          background: 'linear-gradient(135deg, #ED7D31, #C55A11)',
          color: '#fff',
        }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon item={477} size={16} />
              <span style={{ fontSize: '12px', opacity: 0.9 }}>北京时间 CST</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              {cstTime}
            </div>
          </div>
        </div>
        
        <div className="card" style={{
          background: 'linear-gradient(135deg, #70AD47, #548235)',
          color: '#fff',
        }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Icon item={477} size={16} />
              <span style={{ fontSize: '12px', opacity: 0.9 }}>美国东部 ET</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              {etTime}
            </div>
          </div>
        </div>
      </div>
      
      {/* 数据卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'var(--animal-primary-color-bg)',
                borderRadius: 'var(--animal-border-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon item={320} size={28} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                  {subscriptions.length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--animal-text-color-secondary)' }}>
                  总订阅
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#e8f5e9',
                borderRadius: 'var(--animal-border-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon item={319} size={28} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                  {active.length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--animal-text-color-secondary)' }}>
                  订阅中
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#fff3e0',
                borderRadius: 'var(--animal-border-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon item={318} size={28} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--animal-text-color)' }}>
                  {paused.length}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--animal-text-color-secondary)' }}>
                  已停止
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}