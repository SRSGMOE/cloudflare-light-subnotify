const API_BASE = '/api'

export async function fetchApi(url, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })
  
  if (response.status === 401) {
    localStorage.removeItem('token')
    throw new Error('401')
  }
  
  return response
}

export async function getSubscriptions() {
  const response = await fetchApi('/subscriptions')
  return response.json()
}

export async function createSubscription(data) {
  const response = await fetchApi('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function updateSubscription(id, data) {
  const response = await fetchApi(`/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function deleteSubscription(id) {
  const response = await fetchApi(`/subscriptions/${id}`, {
    method: 'DELETE',
  })
  return response.json()
}

export async function getNotifySettings() {
  const response = await fetchApi('/notify-settings')
  return response.json()
}

export async function saveNotifySettings(data) {
  const response = await fetchApi('/notify-settings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function getTelegramSettings() {
  const response = await fetchApi('/telegram-settings')
  return response.json()
}

export async function saveTelegramSettings(data) {
  const response = await fetchApi('/telegram-settings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function testTelegram(data) {
  const response = await fetchApi('/test-telegram', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function testNotify(data) {
  const response = await fetchApi('/test-notify', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function getEmailSettings() {
  const response = await fetchApi('/email-settings')
  return response.json()
}

export async function saveEmailSettings(data) {
  const response = await fetchApi('/email-settings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function testEmail(data) {
  const response = await fetchApi('/test-email', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function getMiaoSettings() {
  const response = await fetchApi('/miao-settings')
  return response.json()
}

export async function saveMiaoSettings(data) {
  const response = await fetchApi('/miao-settings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function testMiao(data) {
  const response = await fetchApi('/test-miao', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function getExchangeRate() {
  const response = await fetchApi('/exchange-rate')
  return response.json()
}

export async function refreshExchangeRate() {
  const response = await fetchApi('/exchange-rate', {
    method: 'POST',
  })
  return response.json()
}

export async function getApiPaths() {
  const response = await fetchApi('/api-paths')
  return response.json()
}

export async function saveApiPaths(data) {
  const response = await fetchApi('/api-paths', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function login(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return response.json()
}

export async function checkAuth() {
  const response = await fetch('/api/auth/status')
  return response.json()
}

export async function verifyToken(token) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  return response.json()
}