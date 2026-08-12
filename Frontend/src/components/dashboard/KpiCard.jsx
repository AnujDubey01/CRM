import Badge from '../ui/Badge'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import Skeleton from '../ui/Skeleton'

function KpiCard({
  badge,
  icon,
  loading = false,
  tone = 'default',
  value,
  label,
}) {
  return (
    <Card className={`kpi-card kpi-card--${tone}`}>
      <div className="kpi-card__header">
        <div className="kpi-card__icon">
          <Icon name={icon} />
        </div>
        {loading ? <Skeleton className="kpi-card__badge-skeleton" /> : badge ? <Badge tone={tone}>{badge}</Badge> : null}
      </div>
      <div className="kpi-card__body">
        <div className="kpi-card__label">{label}</div>
        {loading ? (
          <Skeleton className="kpi-card__value-skeleton" />
        ) : (
          <div className="kpi-card__value">{value}</div>
        )}
      </div>
    </Card>
  )
}

export default KpiCard
