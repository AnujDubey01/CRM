import { useEffect, useState } from 'react'
import './App.css'
import AppShell from './components/layout/AppShell'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import PlaceholderPage from './pages/PlaceholderPage'
import Products from './pages/Products'
import SalesChallans from './pages/SalesChallans'
import Login from './pages/Login'
import CustomerDetails from './pages/CustomerDetails'
import { Inventory, Operations, Reports, Settings, System } from './pages/OperationsPages'
import { getCurrentUser } from './services/session.service'

const routeMeta = {
  '/login': { page: 'login' },
  '/dashboard': {
    section: 'Overview',
    title: 'Dashboard Overview',
    page: 'dashboard',
  },
  '/reports': {
    section: 'Overview',
    title: 'Reports',
    page: 'reports',
  },
  '/customers': {
    section: 'Operations',
    title: 'Customers',
    page: 'customers',
  },
  '/products': {
    section: 'Operations',
    title: 'Products',
    page: 'products',
  },
  '/operations': {
    section: 'Operations',
    title: 'Operations',
    page: 'operations',
  },
  '/inventory': {
    section: 'Operations',
    title: 'Inventory',
    page: 'inventory',
  },
  '/challans': {
    section: 'Operations',
    title: 'Sales Challans',
    page: 'challans',
  },
  '/system': {
    section: 'Administration',
    title: 'System',
    page: 'system',
  },
  '/settings': {
    section: 'Administration',
    title: 'Settings',
    page: 'settings',
  },
}

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') {
    return '/login'
  }

  const exactPath = Object.keys(routeMeta).find(
    (candidatePath) =>
      pathname === candidatePath || pathname.startsWith(`${candidatePath}/`),
  )

  return exactPath || '/dashboard'
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname || '/')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(() => getCurrentUser())

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/')
      setSidebarOpen(false)
    }

    const handleStorage = () => {
      setUser(getCurrentUser())
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const navigate = (nextPath) => {
    if (nextPath === pathname) {
      setSidebarOpen(false)
      return
    }

    window.history.pushState({}, '', nextPath)
    setPathname(nextPath)
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('authToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('authUser')
    localStorage.removeItem('currentUser')
    setUser(getCurrentUser())
    navigate('/login')
  }

  const routePath = normalizePath(pathname)
  const currentRoute = routeMeta[routePath] || routeMeta['/dashboard']
  const isCustomerDetail = pathname.startsWith('/customers/')

  const pageContent = {
    customers: isCustomerDetail ? <CustomerDetails onNavigate={navigate} /> : <Customers onOpenCustomer={(id) => navigate(`/customers/${id}`)} />,
    dashboard: <Dashboard onNavigate={navigate} user={user} />,
    products: <Products />,
    challans: <SalesChallans />,
    login: <Login onLogin={(nextUser) => { setUser({ ...nextUser, firstName: nextUser.name.split(' ')[0], roleLabel: nextUser.role.charAt(0).toUpperCase() + nextUser.role.slice(1).toLowerCase() }); navigate('/dashboard') }} />,
    inventory: <Inventory />,
    operations: <Operations />,
    reports: <Reports />,
    settings: <Settings />,
    system: <System user={user} />,
    placeholder: <PlaceholderPage title={currentRoute.title} user={user} />,
  }[currentRoute.page]

  if (currentRoute.page === 'login') return pageContent

  return (
    <AppShell
      currentPath={routePath}
      currentTitle={currentRoute.title}
      onNavigate={navigate}
      onLogout={handleLogout}
      onSidebarToggle={() => setSidebarOpen((previous) => !previous)}
      sidebarOpen={sidebarOpen}
      user={user}
    >
      {pageContent}
    </AppShell>
  )
}

export default App
