import React, { useState, useEffect } from 'react'
import { Button, Card, Input } from 'animal-island-ui'
import { 
  getTelegramSettings, 
  saveTelegramSettings, 
  testTelegram,
  getNotifySettings,
  saveNotifySettings,
  testNotify
} from '../api'

export default function SettingsPage() {
  const [telegramSettings, setTelegramSettings] = useState({
    bot_token: '',
    chat_id: '',
  })
  const [notifySettings, setNotifySettings] = useState({
    title: '订阅到期提醒',
  })
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [notifyTestLoading, setNotifyTestLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [telegram, notify] = await Promise.all([
        getTelegramSettings(),
        getNotifySettings(),
      ])
      setTelegramSettings(telegram)
      setNotifySettings(notify)
    } catch (error) {
      console.error('Fetch settings failed:', error)
    }
  }

  const handleSaveTelegram = async () => {
    setLoading(true)
    try {
      await saveTelegramSettings(telegramSettings)
      alert('Telegram设置已保存')
    } catch (error) {
      alert('保存失败')
    }
    setLoading(false)
  }

  const handleTestTelegram = async () => {
    setTestLoading(true)
    try {
      const result = await testTelegram()
      if (result.success) {
        alert('测试通知已发送，请检查Telegram')
      } else {
        alert('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      alert('测试失败: 网络错误')
    }
    setTestLoading(false)
  }

  const handleSaveNotify = async () => {
    setLoading(true)
    try {
      await saveNotifySettings(notifySettings)
      alert('通知设置已保存')
    } catch (error) {
      alert('保存失败')
    }
    setLoading(false)
  }

  const handleTestNotify = async () => {
    setNotifyTestLoading(true)
    try {
      const result = await testNotify({ title: notifySettings.title })
      if (result.success) {
        alert('测试通知已发送，请检查Telegram')
      } else {
        alert('测试失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      alert('测试失败: 网络错误')
    }
    setNotifyTestLoading(false)
  }

  const notifyPreview = `${notifySettings.title || '订阅到期提醒'}

【名称】示例订阅
【内容】这是订阅内容示例
【周期】每周五 14:30
【时区】北京时间 UTC+8
【下次通知】2024-01-12 14:30`

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
      <Card style={{ 
        marginBottom: '24px', 
        borderRadius: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 700, 
            color: 'var(--animal-text-color)',
            margin: 0,
          }}>
            Telegram Bot 设置
          </h3>
          <Button onClick={handleTestTelegram} loading={testLoading}>
            🔗 连通性测试
          </Button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--animal-text-color)',
          }}>
            Bot Token
          </label>
          <Input
            value={telegramSettings.bot_token}
            onChange={(e) => setTelegramSettings({
              ...telegramSettings,
              bot_token: e.target.value,
            })}
            placeholder="请输入Telegram Bot Token"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--animal-text-color)',
          }}>
            Chat ID
          </label>
          <Input
            value={telegramSettings.chat_id}
            onChange={(e) => setTelegramSettings({
              ...telegramSettings,
              chat_id: e.target.value,
            })}
            placeholder="请输入接收通知的Chat ID"
          />
        </div>

        <Button type="primary" onClick={handleSaveTelegram} loading={loading}>
          💾 保存设置
        </Button>
      </Card>

      {/* 通知标题设置 */}
      <Card style={{ borderRadius: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: 700, 
          color: 'var(--animal-text-color)',
          marginBottom: '20px',
        }}>
          通知标题设置
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <Input
            value={notifySettings.title}
            onChange={(e) => setNotifySettings({
              ...notifySettings,
              title: e.target.value,
            })}
            placeholder="请输入通知标题"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 600,
            fontSize: '14px',
            color: 'var(--animal-text-color)',
          }}>
            预览效果
          </label>
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button type="primary" onClick={handleSaveNotify} loading={loading}>
            💾 保存设置
          </Button>
          <Button onClick={handleTestNotify} loading={notifyTestLoading}>
            📤 测试通知
          </Button>
        </div>
      </Card>
    </div>
  )
}