import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const describeArc = (centerX, centerY, radius, startAngle, endAngle) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ')
}

function InventoryHealth({ data, loading }) {
  if (loading) {
    return (
      <Card className="dashboard-card inventory-card">
        <Skeleton className="dashboard-card__title-skeleton" />
        <div className="inventory-card__loading">
          <Skeleton className="inventory-card__chart-skeleton" />
          <Skeleton className="inventory-card__legend-skeleton" />
        </div>
      </Card>
    )
  }

  if (!data?.segments?.length) {
    return (
      <Card className="dashboard-card inventory-card">
        <h2 className="dashboard-card__title">Inventory Health</h2>
        <EmptyState
          title="No data available for this period."
          description="Inventory composition will appear once product counts are available."
        />
      </Card>
    )
  }

  const total = data.total || data.segments.reduce((sum, segment) => sum + segment.value, 0)
  const arcs = data.segments.reduce((segments, segment) => {
    const startAngle =
      segments.length === 0
        ? 0
        : segments[segments.length - 1].endAngle
    const angle = (segment.value / total) * 360

    return [
      ...segments,
      {
        ...segment,
        startAngle,
        endAngle: startAngle + angle,
      },
    ]
  }, [])

  return (
    <Card className="dashboard-card inventory-card">
      <h2 className="dashboard-card__title">Inventory Health</h2>
      <div className="inventory-card__content">
        <div className="inventory-card__chart">
          <svg viewBox="0 0 180 180" className="inventory-card__svg" role="img" aria-label="Inventory health distribution">
            <circle cx="90" cy="90" r="54" className="inventory-card__track" />
            {arcs.map((segment) => {
              const path = describeArc(
                90,
                90,
                54,
                segment.startAngle,
                segment.endAngle,
              )

              return (
                <path
                  key={segment.label}
                  d={path}
                  className={`inventory-card__arc inventory-card__arc--${segment.tone}`}
                />
              )
            })}
          </svg>
          <div className="inventory-card__center">
            <div className="inventory-card__total">{total}</div>
            <div className="inventory-card__caption">TOTAL ITEMS</div>
          </div>
        </div>
        <div className="inventory-card__legend">
          {data.segments.map((segment) => (
            <div className="inventory-card__legend-row" key={segment.label}>
              <div className="inventory-card__legend-label">
                <span className={`inventory-card__legend-dot inventory-card__legend-dot--${segment.tone}`} />
                <span>{segment.label}</span>
              </div>
              <span className="inventory-card__legend-value">{segment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default InventoryHealth
