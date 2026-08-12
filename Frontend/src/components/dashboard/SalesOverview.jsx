import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import Icon from '../ui/Icon'
import Skeleton from '../ui/Skeleton'

const chartHeight = 220
const chartWidth = 420
const barWidth = 48
const baseY = 186
const maxBarHeight = 126

function SalesOverview({ data, loading }) {
  if (loading) {
    return (
      <Card className="dashboard-card sales-card">
        <div className="dashboard-card__header">
          <div>
            <Skeleton className="dashboard-card__title-skeleton" />
          </div>
          <Skeleton className="dashboard-card__menu-skeleton" />
        </div>
        <Skeleton className="sales-card__skeleton" />
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card className="dashboard-card sales-card">
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Sales Overview</h2>
          <button type="button" className="dashboard-card__icon-button" aria-label="More options">
            <Icon name="more-horizontal" />
          </button>
        </div>
        <EmptyState
          title="No data available for this period."
          description="Sales trends will appear here once monthly challan totals are available."
        />
      </Card>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <Card className="dashboard-card sales-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Sales Overview</h2>
        <button type="button" className="dashboard-card__icon-button" aria-label="More options">
          <Icon name="more-horizontal" />
        </button>
      </div>

      <div className="sales-chart">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="sales-chart__svg" role="img" aria-label="Monthly sales overview">
          {data.map((item, index) => {
            const height = Math.max((item.value / maxValue) * maxBarHeight, 18)
            const x = 22 + index * 66
            const y = baseY - height
            const isEmphasized = index === data.length - 2

            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  rx="8"
                  className={isEmphasized ? 'sales-chart__bar is-active' : 'sales-chart__bar'}
                />
                <text x={x + barWidth / 2} y="208" textAnchor="middle" className="sales-chart__label">
                  {item.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </Card>
  )
}

export default SalesOverview
