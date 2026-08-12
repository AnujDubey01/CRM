import KpiCard from '../components/dashboard/KpiCard'
import InventoryHealth from '../components/dashboard/InventoryHealth'
import LowStockAlerts from '../components/dashboard/LowStockAlerts'
import RecentActivity from '../components/dashboard/RecentActivity'
import SalesOverview from '../components/dashboard/SalesOverview'
import ErrorState from '../components/ui/ErrorState'
import { useDashboard } from '../hooks/useDashboard'

function Dashboard({ onNavigate, user }) {
  const { data, error, loading, retry, usingMockData } = useDashboard()

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__intro">
        <div>
          <h2 className="dashboard-page__greeting">Good morning, {user.firstName}</h2>
          <p className="dashboard-page__subtitle">
            Here&apos;s what&apos;s happening across your operations today.
          </p>
        </div>
        {usingMockData ? (
          <div className="dashboard-page__preview-badge">Development preview</div>
        ) : null}
      </div>

      {error ? <ErrorState message={error} onRetry={retry} /> : null}

      <div className="dashboard-grid dashboard-grid--kpi">
        <KpiCard
          badge={data?.kpis?.customers?.badge}
          icon="users-round"
          label="TOTAL CUSTOMERS"
          loading={loading}
          value={data?.kpis?.customers?.value}
        />
        <KpiCard
          badge={data?.kpis?.products?.badge}
          icon="package"
          label="TOTAL PRODUCTS"
          loading={loading}
          value={data?.kpis?.products?.value}
        />
        <KpiCard
          badge={data?.kpis?.lowStock?.badge}
          icon="triangle-alert"
          label="LOW STOCK ITEMS"
          loading={loading}
          tone="warning"
          value={data?.kpis?.lowStock?.value}
        />
        <KpiCard
          badge={data?.kpis?.challans?.badge}
          icon="file-text"
          label="MONTHLY CHALLANS"
          loading={loading}
          value={data?.kpis?.challans?.value}
        />
      </div>

      <div className="dashboard-grid dashboard-grid--charts">
        <SalesOverview data={data?.salesOverview} loading={loading} />
        <InventoryHealth data={data?.inventoryHealth} loading={loading} />
      </div>

      <div className="dashboard-grid dashboard-grid--bottom">
        <LowStockAlerts
          items={data?.lowStockAlerts}
          loading={loading}
          onNavigate={onNavigate}
        />
        <RecentActivity items={data?.recentActivity} loading={loading} />
      </div>
    </div>
  )
}

export default Dashboard
