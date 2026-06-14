import React, { useState, useEffect } from 'react'
import { Icon } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { getNotifySettings, saveNotifySettings, getApiPaths, saveApiPaths } from '../api'

export default function SystemSettingsPage({ showSuccess, showError }) {
  const { currentTheme } = useTheme()
  
  // 通知标题
  const [notifySettings, setNotifySettings] = useState({ title: '订阅到期提醒' })
  const [notifyLoading, setNotifyLoading] = useState(false)
  
  // API 路径
  const [apiPaths, setApiPaths] = useState({ check_notifications: '', exchange_rate: '' })
  
  // 确认弹窗
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', onConfirm: null, type: 'warning' })

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const [notify, paths] = await Promise.all([
        getNotifySettings(),
        getApiPaths()
      ])
      setNotifySettings(notify)
      if (paths.check_notifications || paths.exchange_rate) {
        setApiPaths(paths)
      }
    } catch (e) {}
  }

  const handleSaveNotify = async () => {
    setNotifyLoading(true)
    try {
      await saveNotifySettings(notifySettings)
      showSuccess('通知标题已保存')
    } catch (e) { showError('保存失败') }
    setNotifyLoading(false)
  }

  // 生成随机路径（18位大小写字母和数字）
  const generateRandomPath = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 18; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const hideConfirm = () => setConfirmModal({ ...confirmModal, visible: false })

  const handleGeneratePaths = async () => {
    const path = generateRandomPath()
    const newPaths = { check_notifications: path, exchange_rate: path }
    
    // 页内弹窗确认
    setConfirmModal({
      visible: true,
      title: '确认生成新路径',
      message: '确定生成新的API路径吗？

新路径：' + path + '

注意：生成后旧路径将失效！',
      type: 'warning',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, visible: false })
        setApiPaths(newPaths)
        try {
          await saveApiPaths(newPaths)
          showSuccess('API路径已生成并保存')
        } catch (e) { showError('保存失败') }
      }
    })
  }

  const handleCopyPath = (type) => {
    const path = type === 'check' ? apiPaths.check_notifications : apiPaths.exchange_rate
    const endpoint = type === 'check' ? '/api/check-notifications' : '/api/exchange-rate'
    const url = window.location.origin + '/' + path + endpoint
    navigator.clipboard.writeText(url).then(() => {
      showSuccess('已复制到剪贴板')
    }).catch(() => {
      showError('复制失败')
    })
  }

  const notifyPreview = `📢 ${notifySettings.title || '订阅到期提醒'}

📦 订阅名称：示例订阅
🔖 订阅内容：这是订阅内容示例
💰 项目收支：支出 100 CNY
📮 通知周期：每周五 14:30
🌏 当前时区：北京时间 UTC+8
📆 下次通知：2024-01-12 14:30`

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--animal-text-color)', marginBottom: '24px' }}>
        系统设置
      </h2>

      <div style={{ maxWidth: '40%', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }} className="settings-container">

        {/* API 路径设置 */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>API 路径设置</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '16px' }}>
              <button className="btn btn-primary" onClick={handleGeneratePaths} style={{ marginBottom: '16px' }}>
                🎲 随机生成路径
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">检查通知 API 路径</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input"
                  value={apiPaths.check_notifications ? `${window.location.origin}/${apiPaths.check_notifications}/api/check-notifications` : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    const match = value.match(/\/([^/]+)\/api\/check-notifications/)
                    if (match) {
                      setApiPaths({...apiPaths, check_notifications: match[1]})
                    }
                  }}
                  placeholder="请先随机生成路径"
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleCopyPath('check')}
                  disabled={!apiPaths.check_notifications}
                  title="复制完整URL"
                >
                  📋
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">汇率计算 API 路径</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input"
                  value={apiPaths.exchange_rate ? `${window.location.origin}/${apiPaths.exchange_rate}/api/exchange-rate` : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    const match = value.match(/\/([^/]+)\/api\/exchange-rate/)
                    if (match) {
                      setApiPaths({...apiPaths, exchange_rate: match[1]})
                    }
                  }}
                  placeholder="请先随机生成路径"
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleCopyPath('exchange')}
                  disabled={!apiPaths.exchange_rate}
                  title="复制完整URL"
                >
                  📋
                </button>
              </div>
            </div>

            <div style={{ 
              background: 'var(--animal-bg-color)', 
              padding: '12px 16px', 
              borderRadius: 'var(--animal-border-radius-sm)', 
              fontSize: '13px', 
              color: 'var(--animal-text-color-secondary)',
              marginTop: '8px'
            }}>
              💡 随机路径规则：大小写字母和数字，18位。用于防止API被滥用。
            </div>
          </div>
        </div>

        {/* 通知标题设置 */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--animal-text-color)', margin: 0 }}>通知标题设置</h3>
            <button className="btn btn-primary btn-sm" onClick={handleSaveNotify} disabled={notifyLoading}>
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
      </div>

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