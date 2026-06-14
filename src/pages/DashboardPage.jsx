import React, { useState, useEffect } from 'react'
import { Icon } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import { getExchangeRate, refreshExchangeRate } from '../api'

export default function DashboardPage({ subscriptions }) {
  const { currentTheme } = useTheme()
  const [utcTime, setUtcTime] = useState('')
  const [cstTime, setCstTime] = useState('')
  const [etTime, setEtTime] = useState('')
  const [exchangeRates, setExchangeRates] = useState({
    usd: null,
    eur: null,
    jpy: null,
    lastUpdate: null
  })
  const [ratesLoading, setRatesLoading] = useState(false)

  useEffect(() => {
    updateTime()
    const timer = setInterval(updateTime, 1000)
    loadExchangeRates()
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

  const loadExchangeRates = async () => {
    try {
      const data = await getExchangeRate()
      if (data.lastUpdate) {
        setExchangeRates(data)
      }
    } catch (e) {
      console.error('加载汇率失败:', e)
    }
  }

  const handleRefreshRates = async () => {
    setRatesLoading(true)
    try {
      const result = await refreshExchangeRate()
      if (result.success && result.data) {
        setExchangeRates(result.data)
      }
    } catch (e) {
      console.error('刷新汇率失败:', e)
    }
    setRatesLoading(false)
  }

  const active = subscriptions.filter(s => s.is_active)
  const paused = subscriptions.filter(s => !s.is_active)

  const cardStyle = {
    background: '#f7f3df',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: 'var(--animal-shadow-base)',
    flex: 1,
    minWidth: '300px',
  }

  const cardTitleStyle = {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--animal-text-color)',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid var(--animal-border-color-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }

  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid var(--animal-border-color-light)',
  }

  const itemLabelStyle = {
    fontSize: '15px',
    color: 'var(--animal-text-color)',
    fontWeight: 500,
  }

  const itemValueStyle = {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--animal-text-color)',
    fontFamily: 'monospace',
  }

  return (
    <div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 700, 
        color: 'var(--animal-text-color)',
        marginBottom: '16px',
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
            {currentTheme === 'animal-forest' ? (
              <Icon item={440} size={28} bounce />
            ) : (
              <span style={{ fontSize: '24px' }}>💡</span>
            )}
            <span style={{ fontWeight: 600, color: 'var(--animal-text-color)' }}>
              温馨提示：建议您先把设备时间进行一次同步更新再进行操作，以确保时间显示准确。
            </span>
          </div>
        </div>
      </div>
      
      {/* 三列卡片布局 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '24px',
      }} className="dashboard-cards">
        
        {/* 时间卡片 */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            {currentTheme === 'animal-forest' ? (
              <Icon item={477} size={24} />
            ) : (
              <span style={{ fontSize: '20px' }}>🕐</span>
            )}
            世界时钟
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>世界协调 UTC+0</span>
            <span style={itemValueStyle}>{utcTime}</span>
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>中国北京 UTC+8</span>
            <span style={itemValueStyle}>{cstTime}</span>
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>美国东部 UTC-4</span>
            <span style={itemValueStyle}>{etTime}</span>
          </div>
        </div>
        
        {/* 订阅统计卡片 */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            {currentTheme === 'animal-forest' ? (
              <Icon item={467} size={24} />
            ) : (
              <span style={{ fontSize: '20px' }}>📊</span>
            )}
            订阅统计
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>订阅总数</span>
            <span style={{...itemValueStyle, color: 'var(--animal-primary-color)'}}>{subscriptions.length}</span>
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>活跃订阅</span>
            <span style={{...itemValueStyle, color: 'var(--animal-success-color)'}}>{active.length}</span>
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>停止订阅</span>
            <span style={{...itemValueStyle, color: 'var(--animal-error-color)'}}>{paused.length}</span>
          </div>
        </div>
        
        {/* 货币汇率卡片 */}
        <div style={cardStyle}>
          <div style={cardTitleStyle}>
            {currentTheme === 'animal-forest' ? (
              <Icon item={23} size={24} />
            ) : (
              <span style={{ fontSize: '20px' }}>💰</span>
            )}
            货币汇率
            <button 
              onClick={handleRefreshRates}
              disabled={ratesLoading}
              style={{
                marginLeft: 'auto',
                padding: '6px 12px',
                fontSize: '12px',
                background: 'var(--animal-bg-color)',
                border: '1px solid var(--animal-border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--animal-text-color-secondary)',
              }}
            >
              {ratesLoading ? '刷新中...' : '刷新'}
            </button>
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>美元 USD</span>
            <span style={itemValueStyle}>
              {exchangeRates.usd ? `1 USD = ${exchangeRates.usd} CNY` : '未更新'}
            </span>
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>欧元 EUR</span>
            <span style={itemValueStyle}>
              {exchangeRates.eur ? `1 EUR = ${exchangeRates.eur} CNY` : '未更新'}
            </span>
          </div>
          <div style={itemStyle}>
            <span style={itemLabelStyle}>日元 JPY</span>
            <span style={itemValueStyle}>
              {exchangeRates.jpy ? `1 JPY = ${exchangeRates.jpy} CNY` : '未更新'}
            </span>
          </div>
          {exchangeRates.lastUpdate && (
            <div style={{
              marginTop: '16px',
              fontSize: '12px',
              color: 'var(--animal-text-color-disabled)',
              textAlign: 'center',
            }}>
              更新时间: {new Date(exchangeRates.lastUpdate).toLocaleString('zh-CN')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}