import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { cancelChallan, confirmChallan, createChallan, getChallans, getCustomers, getProducts } from '../services/api.service'

const statusOptions = ['All Statuses', 'Confirmed', 'Draft', 'Cancelled']
const formatDate = (date) => date ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)) : '-'
const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

function SalesChallans() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [records, setRecords] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadChallans = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await getChallans(search, status === 'All Statuses' ? '' : status.toLowerCase())
      setRecords(response.data || [])
    } catch (error) {
      setRecords([])
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFormOptions = async () => {
    try {
      const [customerResponse, productResponse] = await Promise.all([getCustomers(''), getProducts('')])
      setCustomers(customerResponse.customers || [])
      setProducts(productResponse.products || [])
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadChallans()
    loadFormOptions()
  }, [])

  const visibleChallans = useMemo(() => records, [records])

  const addItem = () => setItems((oldItems) => [...oldItems, { product_id: '', quantity: 1 }])
  const removeItem = (index) => setItems((oldItems) => oldItems.filter((_, itemIndex) => itemIndex !== index))
  const updateItem = (index, field, value) => setItems((oldItems) => oldItems.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))

  const submitChallan = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await createChallan({
        customer_id: Number(customerId),
        items: items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
      })
      setMessage(response.message || 'Challan created.')
      setCustomerId('')
      setItems([{ product_id: '', quantity: 1 }])
      setModalOpen(false)
      await loadChallans()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (challan, action) => {
    try {
      const response = action === 'confirm' ? await confirmChallan(challan.id) : await cancelChallan(challan.id)
      setMessage(response.message)
      await loadChallans()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="challans-page">
      <div className="challans-page__header">
        <div>
          <h2 className="challans-page__title">Sales Challans</h2>
          <p className="challans-page__subtitle">Create, track, and manage outgoing stock documents.</p>
        </div>
        <Button icon="plus" iconPosition="start" variant="primary" onClick={() => setModalOpen(true)}>New Challan</Button>
      </div>

      <div className="challans-page__filters">
        <label className="challans-page__search">
          <Icon name="search" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') loadChallans() }} type="search" placeholder="Search challan number..." />
        </label>
        <div className="challans-page__filter-group">
          <label className="challans-page__filter-label">Status:
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" className="challans-page__date" onClick={loadChallans}><Icon name="calendar" />Apply</button>
        </div>
      </div>

      <section className="challans-page__table-card" aria-label="Sales challans table">
        <div className="challans-page__table-wrap">
          <table className="challans-page__table">
            <thead><tr><th>Challan No.</th><th>Customer</th><th>Items</th><th>Total Qty</th><th>Created Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {visibleChallans.map((challan) => {
                const challanStatus = titleCase(challan.status || 'draft')

                return (
                  <tr key={challan.id}>
                    <td className="challans-page__number">#{challan.challan_number || challan.id}</td><td><strong>{challan.customer_name}</strong></td><td>{challan.item_count || '-'}</td><td>{challan.total_quantity || 0}</td><td>{formatDate(challan.created_at)}</td>
                    <td><span className={`challans-page__status challans-page__status--${challan.status}`}>{challanStatus}</span></td>
                    <td><div className="challans-page__row-actions">{challan.status === 'draft' && <><button type="button" onClick={() => updateStatus(challan, 'confirm')}>Confirm</button><button type="button" onClick={() => updateStatus(challan, 'cancel')}>Cancel</button></>}<button className="challans-page__action" type="button" aria-label={`Actions for ${challan.id}`}><Icon name="more-horizontal" /></button></div></td>
                  </tr>
                )
              })}
              {!loading && !visibleChallans.length && <tr><td className="challans-page__empty" colSpan="7">{message || 'No challans match your filters.'}</td></tr>}
              {loading && <tr><td className="challans-page__empty" colSpan="7">Loading challans...</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="challans-page__pagination"><span>{message || `Showing ${visibleChallans.length} results`}</span><div className="challans-page__pages"><button type="button" disabled aria-label="Previous page"><Icon name="chevron-left" /></button><button type="button" aria-label="Next page"><Icon name="chevron-right" /></button></div></div>
      </section>

      {modalOpen && (
        <div className="app-modal" role="dialog" aria-modal="true" aria-label="Create challan">
          <form className="app-modal__panel" onSubmit={submitChallan}>
            <header><h3>Create Challan</h3><button type="button" onClick={() => setModalOpen(false)}>Close</button></header>
            <div className="app-form-grid">
              <label className="app-form-grid__wide">Customer<select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.business_name || customer.name}</option>)}</select></label>
              {items.map((item, index) => <div className="app-form-grid app-form-grid__wide challan-item-row" key={index}><label>Product<select value={item.product_id} onChange={(event) => updateItem(index, 'product_id', event.target.value)} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></label><label>Quantity<input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} required /></label>{items.length > 1 && <button type="button" onClick={() => removeItem(index)}>Remove</button>}</div>)}
            </div>
            <button className="app-modal__link-button" type="button" onClick={addItem}>Add another item</button>
            {message && <p className="app-modal__message">{message}</p>}
            <footer><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Draft'}</Button></footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default SalesChallans
