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

export async function testTelegram() {
  const response = await fetchApi('/test-telegram', {
    method: 'POST',
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

export async function testEmail() {
  const response = await fetchApi('/test-email', {
    method: 'POST',
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