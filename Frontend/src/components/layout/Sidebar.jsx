import Button from '../ui/Button'
import Icon from '../ui/Icon'

const navigationItems = [
  { label: 'Overview', path: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Customers', path: '/customers', icon: 'users-round' },
  { label: 'Products', path: '/products', icon: 'package' },
  { label: 'Inventory', path: '/inventory', icon: 'warehouse' },
  { label: 'Sales Challans', path: '/challans', icon: 'file-text' },
  { label: 'Operations', path: '/operations', icon: 'clipboard-clock' },
  { label: 'System', path: '/system', icon: 'shield-check' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
]

const roleVisibility = {
  admin: null,
  sales: new Set(['/dashboard', '/customers', '/products', '/challans', '/operations', '/settings']),
  warehouse: new Set(['/dashboard', '/products', '/inventory', '/settings']),
  accounts: new Set(['/dashboard', '/challans', '/settings']),
}

const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

function Sidebar({ currentPath, onNavigate, onLogout, sidebarOpen, user }) {
  const visiblePaths = roleVisibility[user.role?.toLowerCase()] ?? null
  const showSignOutOnly = currentPath === '/customers'

  return (
    <>
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' is-visible' : ''}`}
        aria-hidden="true"
        onClick={() => onNavigate(currentPath)}
      />
      <aside className={`sidebar${sidebarOpen ? ' is-open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo" aria-hidden="true">
            <Icon name="logo" />
          </div>
          <div>
            <div className="sidebar__brand-name">OpsFlow</div>
            <div className="sidebar__brand-subtitle">Enterprise ERP</div>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          {navigationItems
            .filter((item) => !visiblePaths || visiblePaths.has(item.path))
            .map((item) => {
              const isActive = currentPath === item.path

              return (
                <button
                  key={item.path}
                  type="button"
                  className={`sidebar__link${isActive ? ' is-active' : ''}`}
                  onClick={() => onNavigate(item.path)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              )
            })}
        </nav>

        <div className={`sidebar__footer${showSignOutOnly ? ' sidebar__footer--signout' : ''}`}>
          {showSignOutOnly ? null : (
            <div className="sidebar__user">
              <div className="sidebar__avatar">{getInitials(user.name)}</div>
              <div className="sidebar__user-details">
                <div className="sidebar__user-name">{user.name}</div>
                <div className="sidebar__user-role">{user.roleLabel}</div>
              </div>
            </div>
          )}
          <Button
            ariaLabel="Sign out"
            className="sidebar__logout"
            icon="log-out"
            iconPosition="start"
            onClick={onLogout}
            title="Sign out"
            variant="ghost"
          >
            {showSignOutOnly ? 'Sign Out' : null}
          </Button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
