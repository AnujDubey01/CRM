import Card from '../components/ui/Card'

function PlaceholderPage({ title, user }) {
  return (
    <div className="placeholder-page">
      <Card className="placeholder-page__card">
        <div className="placeholder-page__eyebrow">Coming next</div>
        <h2 className="placeholder-page__title">{title}</h2>
        <p className="placeholder-page__description">
          This section is ready to sit inside the shared OpsFlow shell for {user.roleLabel.toLowerCase()} users.
          The navigation, responsive layout, and topbar actions are already wired for future pages.
        </p>
      </Card>
    </div>
  )
}

export default PlaceholderPage
