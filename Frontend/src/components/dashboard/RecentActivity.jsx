import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import Icon from '../ui/Icon'
import Skeleton from '../ui/Skeleton'

function RecentActivity({ items, loading }) {
  return (
    <Card className="dashboard-card activity-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Recent Activity</h2>
      </div>

      {loading ? (
        <div className="activity-card__list">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="activity-card__skeleton" />
          ))}
        </div>
      ) : items?.length ? (
        <div className="activity-card__list">
          {items.map((item) => (
            <div className="activity-card__item" key={`${item.title}-${item.time}`}>
              <div className="activity-card__icon">
                <Icon name={item.icon} />
              </div>
              <div className="activity-card__content">
                <div className="activity-card__title">{item.title}</div>
                <div className="activity-card__meta">
                  {item.time} • {item.actor}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recent activity."
          description="Recent customer, stock, and challan events will appear here."
        />
      )}
    </Card>
  )
}

export default RecentActivity
