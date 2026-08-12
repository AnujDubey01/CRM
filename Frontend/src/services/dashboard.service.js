import { getAccessToken, isUsingDemoSession } from './session.service'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const shouldUseMockDataMode = () =>
  import.meta.env.VITE_DASHBOARD_USE_MOCK === 'true' || isUsingDemoSession()

const mockDashboardData = {
  kpis: {
    customers: { value: '1,248', badge: '+8.2%' },
    products: { value: '452', badge: null },
    lowStock: { value: '12', badge: 'Needs attention' },
    challans: { value: '184', badge: '+12' },
  },
  salesOverview: [
    { label: 'Jan', value: 28 },
    { label: 'Feb', value: 42 },
    { label: 'Mar', value: 33 },
    { label: 'Apr', value: 55 },
    { label: 'May', value: 72 },
    { label: 'Jun', value: 20 },
  ],
  inventoryHealth: {
    total: 452,
    segments: [
      { label: 'Healthy', value: 340, tone: 'healthy' },
      { label: 'Low Stock', value: 12, tone: 'warning' },
      { label: 'Out of Stock', value: 100, tone: 'danger' },
    ],
  },
  lowStockAlerts: [
    {
      id: 'sku-a2-492',
      name: 'Industrial Filter A2',
      sku: 'SKU-A2-492',
      current_stock: 4,
      minimum_stock: 15,
    },
    {
      id: 'sku-hv-101',
      name: 'Hydraulic Valve Pro',
      sku: 'SKU-HV-101',
      current_stock: 2,
      minimum_stock: 10,
    },
  ],
  recentActivity: [
    { icon: 'users-round', title: 'Maruti Distribution created', time: '10 mins ago', actor: 'Admin' },
    { icon: 'boxes', title: 'Stock Received: SKU-492', time: '1 hour ago', actor: 'Warehouse A' },
    { icon: 'file-text', title: 'Challan #CH-0123 confirmed', time: '2 hours ago', actor: 'Sales' },
  ],
}

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0))

const buildInventoryHealth = (totalProducts, lowStockProducts) => {
  const lowStock = Number(lowStockProducts || 0)
  const total = Number(totalProducts || 0)
  const outOfStock = Math.min(lowStock, Math.max(Math.round(lowStock * 0.35), 0))
  const lowStockOnly = Math.max(lowStock - outOfStock, 0)
  const healthy = Math.max(total - lowStockOnly - outOfStock, 0)

  return {
    total,
    segments: [
      { label: 'Healthy', value: healthy, tone: 'healthy' },
      { label: 'Low Stock', value: lowStockOnly, tone: 'warning' },
      { label: 'Out of Stock', value: outOfStock, tone: 'danger' },
    ],
  }
}

const fetchJson = async (path) => {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    let message = 'Request failed.'

    try {
      const errorBody = await response.json()
      message = errorBody.message || message
    } catch {
      // Ignore invalid JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

const mapApiDashboard = (dashboardPayload, lowStockPayload) => {
  const metrics = dashboardPayload?.data || {}
  const lowStockAlerts = lowStockPayload?.data || []

  return {
    kpis: {
      customers: {
        value: formatNumber(metrics.totalCustomers),
        badge: '+8.2%',
      },
      products: {
        value: formatNumber(metrics.totalProducts),
        badge: null,
      },
      lowStock: {
        value: formatNumber(metrics.lowStockProducts),
        badge: Number(metrics.lowStockProducts) > 0 ? 'Needs attention' : null,
      },
      challans: {
        value: formatNumber(metrics.monthlyChallans),
        badge: `+${metrics.monthlyChallans || 0}`,
      },
    },
    salesOverview: mockDashboardData.salesOverview,
    inventoryHealth: buildInventoryHealth(
      metrics.totalProducts,
      metrics.lowStockProducts,
    ),
    lowStockAlerts,
    recentActivity: mockDashboardData.recentActivity,
  }
}

export const getDashboardData = async () => {
  if (shouldUseMockDataMode()) {
    return {
      data: mockDashboardData,
      usingMockData: true,
    }
  }

  const [dashboardPayload, lowStockPayload] = await Promise.all([
    fetchJson('/api/dashboard'),
    fetchJson('/api/dashboard/low-stock'),
  ])

  return {
    data: mapApiDashboard(dashboardPayload, lowStockPayload),
    usingMockData: false,
  }
}
