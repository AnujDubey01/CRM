import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../services/api.service'

const blankCustomer = {
  name: '',
  mobile: '',
  email: '',
  business_name: '',
  gst_number: '',
  customer_type: 'wholesale',
  address: '',
  status: 'lead',
  follow_up_date: '',
  notes: '',
}

const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const initials = (customer) => (customer.business_name || customer.name || 'NA').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

function Customers({ onOpenCustomer }) {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(blankCustomer)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadCustomers = async (term = search) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await getCustomers(term)
      setCustomers(response.customers || [])
    } catch (error) {
      setCustomers([])
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers('')
  }, [])

  const visibleCustomers = useMemo(() => customers, [customers])

  const openCreate = () => {
    setForm(blankCustomer)
    setEditingId(null)
    setModalOpen(true)
    setMessage('')
  }

  const openEdit = (customer) => {
    setForm({
      name: customer.name || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      business_name: customer.business_name || '',
      gst_number: customer.gst_number || '',
      customer_type: customer.customer_type || 'wholesale',
      address: customer.address || '',
      status: customer.status || 'lead',
      follow_up_date: customer.follow_up_date ? String(customer.follow_up_date).slice(0, 10) : '',
      notes: customer.notes || '',
    })
    setEditingId(customer.id)
    setModalOpen(true)
    setMessage('')
  }

  const updateField = (field, value) => setForm((oldForm) => ({ ...oldForm, [field]: value }))

  const submitCustomer = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = editingId ? await updateCustomer(editingId, form) : await createCustomer(form)
      setMessage(response.message || 'Customer saved.')
      setModalOpen(false)
      await loadCustomers()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const removeCustomer = async (customer) => {
    if (!window.confirm(`Delete ${customer.business_name || customer.name}?`)) return

    try {
      const response = await deleteCustomer(customer.id)
      setMessage(response.message || 'Customer deleted.')
      await loadCustomers()
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <div className="customers-page">
      <div className="customers-page__header">
        <div>
          <h2 className="customers-page__title">Customers</h2>
          <p className="customers-page__subtitle">Manage relationships, accounts, and follow-ups.</p>
        </div>
        <Button icon="plus" iconPosition="start" variant="primary" onClick={openCreate}>Add Customer</Button>
      </div>

      <div className="customers-page__filters">
        <label className="customers-page__search">
          <Icon name="search" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') loadCustomers(event.currentTarget.value) }} type="search" placeholder="Search customers by name..." />
        </label>
        <div className="customers-page__filter-group">
          <button type="button" className="customers-page__select" onClick={() => loadCustomers(search)}>Refresh <Icon name="chevron-right" /></button>
        </div>
      </div>

      <section className="customers-page__table-card" aria-label="Customers table">
        <div className="customers-page__table-wrap">
          <table className="customers-page__table">
            <thead><tr><th>Customer</th><th>Contact</th><th>Type</th><th>Status</th><th>Follow-up</th><th>Actions</th></tr></thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td><button type="button" className="customers-page__customer customers-page__customer-button" onClick={() => onOpenCustomer?.(customer.id)}><span className={`customers-page__avatar customers-page__avatar--${customer.status || 'lead'}`}>{initials(customer)}</span><div><strong>{customer.business_name || customer.name}</strong><span>{customer.name}</span></div></button></td>
                  <td>{customer.mobile}<br /><small>{customer.email || 'No email'}</small></td>
                  <td><span className="customers-page__tag">{titleCase(customer.customer_type)}</span></td>
                  <td><span className={`customers-page__status customers-page__status--${customer.status || 'lead'}`}><span aria-hidden="true" />{titleCase(customer.status || 'lead')}</span></td>
                  <td><span className={`customers-page__follow customers-page__follow--${customer.follow_up_date ? 'scheduled' : 'empty'}`}><Icon name="calendar" />{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString('en-IN') : 'None scheduled'}</span></td>
                  <td><div className="table-actions"><button type="button" onClick={() => openEdit(customer)}>Edit</button><button type="button" onClick={() => removeCustomer(customer)}>Delete</button></div></td>
                </tr>
              ))}
              {!loading && !visibleCustomers.length && <tr><td className="challans-page__empty" colSpan="6">{message || 'No customers found.'}</td></tr>}
              {loading && <tr><td className="challans-page__empty" colSpan="6">Loading customers...</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="customers-page__pagination"><span>{message || `Showing ${visibleCustomers.length} customers`}</span></div>
      </section>

      {modalOpen && (
        <div className="app-modal" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit customer' : 'Add customer'}>
          <form className="app-modal__panel" onSubmit={submitCustomer}>
            <header><h3>{editingId ? 'Edit Customer' : 'Add Customer'}</h3><button type="button" onClick={() => setModalOpen(false)}>Close</button></header>
            <div className="app-form-grid">
              <label>Contact Name<input value={form.name} onChange={(event) => updateField('name', event.target.value)} required /></label>
              <label>Mobile<input value={form.mobile} onChange={(event) => updateField('mobile', event.target.value)} required /></label>
              <label>Email<input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} /></label>
              <label>Business Name<input value={form.business_name} onChange={(event) => updateField('business_name', event.target.value)} /></label>
              <label>GST Number<input value={form.gst_number} onChange={(event) => updateField('gst_number', event.target.value)} /></label>
              <label>Customer Type<select value={form.customer_type} onChange={(event) => updateField('customer_type', event.target.value)} required><option value="wholesale">Wholesale</option><option value="retail">Retail</option><option value="distributor">Distributor</option></select></label>
              <label>Status<select value={form.status} onChange={(event) => updateField('status', event.target.value)}><option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              <label>Follow-up Date<input type="date" value={form.follow_up_date} onChange={(event) => updateField('follow_up_date', event.target.value)} /></label>
              <label className="app-form-grid__wide">Address<textarea value={form.address} onChange={(event) => updateField('address', event.target.value)} /></label>
              <label className="app-form-grid__wide">Notes<textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} /></label>
            </div>
            {message && <p className="app-modal__message">{message}</p>}
            <footer><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</Button></footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default Customers
