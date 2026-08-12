import { getAccessToken } from './session.service'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

export const apiRequest = async (path, options = {}) => {
  const token = getAccessToken()

  if (!token) {
    throw new Error('Please sign in to view live workspace data.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = ['Authorization header missing', 'Token missing', 'Invalid token'].includes(payload.message)
      ? 'Your session has expired. Please sign in again.'
      : payload.message

    throw new Error(message || 'The request could not be completed.')
  }
  return payload
}

export const getProducts = (search = '') => apiRequest(`/api/products?limit=100&search=${encodeURIComponent(search)}`)
export const getCustomers = (search = '') => apiRequest(`/api/customers?limit=100&search=${encodeURIComponent(search)}`)
export const getChallans = (search = '', status = '') => apiRequest(`/api/challans?limit=100&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ''}`)

export const authRequest = async (path, body) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'The request could not be completed.')
  }

  return payload
}

export const registerUser = (body) => authRequest('/api/auth/register', body)
export const loginUser = (body) => authRequest('/api/auth/login', body)

export const getCustomerById = (id) => apiRequest(`/api/customers/${id}`)
export const createCustomer = (body) => apiRequest('/api/customers', { method: 'POST', body: JSON.stringify(body) })
export const updateCustomer = (id, body) => apiRequest(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteCustomer = (id) => apiRequest(`/api/customers/${id}`, { method: 'DELETE' })
export const getCustomerFollowups = (id) => apiRequest(`/api/customers/${id}/followups`)
export const createCustomerFollowup = (id, body) => apiRequest(`/api/customers/${id}/followups`, { method: 'POST', body: JSON.stringify(body) })

export const createProduct = (body) => apiRequest('/api/products', { method: 'POST', body: JSON.stringify(body) })
export const updateProduct = (id, body) => apiRequest(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteProduct = (id) => apiRequest(`/api/products/${id}`, { method: 'DELETE' })
export const getProductMovements = (id) => apiRequest(`/api/products/${id}/movements`)

export const createChallan = (body) => apiRequest('/api/challans', { method: 'POST', body: JSON.stringify(body) })
export const getChallanById = (id) => apiRequest(`/api/challans/${id}`)
export const confirmChallan = (id) => apiRequest(`/api/challans/${id}/confirm`, { method: 'POST' })
export const cancelChallan = (id) => apiRequest(`/api/challans/${id}/cancel`, { method: 'POST' })
