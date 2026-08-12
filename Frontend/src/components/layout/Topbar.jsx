import Icon from '../ui/Icon'
import Button from '../ui/Button'

function Topbar({ currentTitle, onSidebarToggle, user }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <Button
          ariaLabel="Open navigation"
          className="topbar__menu"
          icon="menu"
          onClick={onSidebarToggle}
          title="Open navigation"
          variant="ghost"
        />
        <h1 className="topbar__title">{currentTitle}</h1>
      </div>

      <div className="topbar__actions">
        <label className="topbar__search">
          <Icon name="search" />
          <input type="search" placeholder="Quick search..." />
        </label>
        <Button
          ariaLabel="Notifications"
          className="topbar__icon-button"
          icon="bell"
          title="Notifications"
          variant="ghost"
        />
        <Button
          ariaLabel="Help"
          className="topbar__icon-button"
          icon="circle-help"
          title="Help"
          variant="ghost"
        />
        <div className="topbar__avatar" aria-label={user.name}>
          {user.firstName?.[0] || user.name?.[0] || 'A'}
        </div>
      </div>
    </header>
  )
}

export default Topbar
