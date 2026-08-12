import Button from '../ui/Button'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'

function LowStockAlerts({ items, loading, onNavigate }) {
  return (
    <Card className="dashboard-card table-card">
      <div className="dashboard-card__header">
        <h2 className="dashboard-card__title">Low Stock Alerts</h2>
        <button type="button" className="dashboard-card__link" onClick={() => onNavigate('/inventory')}>
          View All
        </button>
      </div>

      {loading ? (
        <div className="table-card__skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="table-card__row-skeleton" />
          ))}
        </div>
      ) : items?.length ? (
        <div className="table-card__wrapper">
          <table className="table-card__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current</th>
                <th>Min</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id || item.sku}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td className="is-alert">{item.current_stock}</td>
                  <td>{item.minimum_stock}</td>
                  <td>
                    <Button size="small" variant="secondary" onClick={() => onNavigate('/inventory')}>
                      Reorder
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Inventory looks healthy"
          description="No products are currently below their minimum stock level."
        />
      )}
    </Card>
  )
}

export default LowStockAlerts
