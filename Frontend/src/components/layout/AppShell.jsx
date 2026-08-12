import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppShell({
  children,
  currentPath,
  currentTitle,
  onNavigate,
  onLogout,
  onSidebarToggle,
  showTopbar = true,
  sidebarVariant = 'compact',
  sidebarOpen,
  user,
}) {
  const shellClassName = [
    'app-shell',
    sidebarVariant === 'wide' ? 'app-shell--wide-sidebar' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="workspace">
      <div className="workspace__pattern" aria-hidden="true" />
      <div className={shellClassName}>
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          onLogout={onLogout}
          sidebarOpen={sidebarOpen}
          user={user}
        />
        <div className="app-shell__main">
          {showTopbar ? (
            <Topbar
              currentTitle={currentTitle}
              onCreateSelect={onNavigate}
              onSidebarToggle={onSidebarToggle}
              user={user}
            />
          ) : null}
          <main className="app-shell__content">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AppShell
