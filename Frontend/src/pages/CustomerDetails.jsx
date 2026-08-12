import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import { createCustomerFollowup, getChallans, getCustomerById, getCustomerFollowups } from '../services/api.service'

const formatDate = (date) => date ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)) : 'Not scheduled'
const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

function CustomerDetails({ onNavigate }) {
  const customerId = useMemo(() => window.location.pathname.split('/').filter(Boolean).at(-1), [])
  const [tab, setTab] = useState('Follow-ups')
  const [customer, setCustomer] = useState(null)
  const [followUps, setFollowUps] = useState([])
  const [challans, setChallans] = useState([])
  const [note, setNote] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showFollowupForm, setShowFollowupForm] = useState(false)

  const loadDetails = async () => {
    setLoading(true)
    setMessage('')

    try {
      const [customerResponse, followupResponse, challanResponse] = await Promise.all([
        getCustomerById(customerId),
        getCustomerFollowups(customerId),
        getChallans('', ''),
      ])

      setCustomer(customerResponse.customer)
      setFollowUps(followupResponse.followups || [])
      setChallans((challanResponse.data || []).filter((challan) => String(challan.customer_id) === String(customerId)))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetails()
  }, [customerId])

  const submitFollowup = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await createCustomerFollowup(customerId, { note, follow_up_date: followUpDate || null })
      setMessage(response.message || 'Follow-up added.')
      setNote('')
      setFollowUpDate('')
      setShowFollowupForm(false)
      await loadDetails()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="customer-details"><p className="utility-page__state">Loading customer...</p></div>
  if (!customer) return <div className="customer-details"><p className="utility-page__state utility-page__state--error">{message || 'Customer not found.'}</p></div>

  const displayName = customer.business_name || customer.name

  return <div className="customer-details">
    <header className="customer-details__header">
      <div><div className="customer-details__title-line"><h2>{displayName}</h2><span>{customer.status || 'Lead'}</span></div><p>{titleCase(customer.customer_type)} Customer</p></div>
      <div className="customer-details__actions"><Button icon="file-text" iconPosition="start" variant="secondary" onClick={() => onNavigate?.('/challans')}>Create Challan</Button><Button icon="plus" iconPosition="start" variant="primary" onClick={() => setShowFollowupForm(true)}>Add Follow-up</Button></div>
    </header>

    <div className="customer-details__summary">
      <section className="customer-details__contact"><h3><span>i</span>Primary Contact Info</h3><div className="customer-details__info-grid"><div><label>Contact Person</label><p>{customer.name}</p></div><div><label>Mobile</label><p>{customer.mobile}</p></div><div><label>Email</label><p>{customer.email || 'Not provided'}</p></div><div><label>GST Number</label><p><code>{customer.gst_number || 'Not provided'}</code></p></div></div><div className="customer-details__address"><label>Billing Address</label><p>{customer.address || 'No billing address saved.'}</p></div></section>
      <aside className="customer-details__stats"><div className="customer-details__stat customer-details__stat--balance"><span>□</span><div><label>Status</label><strong>{titleCase(customer.status || 'lead')}</strong></div></div><div className="customer-details__stat"><span>◴</span><div><label>Next Follow-up</label><strong>{formatDate(customer.follow_up_date)}</strong></div></div></aside>
    </div>

    {message && <p className="utility-page__message">{message}</p>}

    <section className="customer-details__activity">
      <nav aria-label="Customer details sections">{['Overview', 'Follow-ups', 'Sales Challans', 'Activity'].map((name) => <button key={name} type="button" onClick={() => setTab(name)} className={tab === name ? 'is-active' : ''}>{name}</button>)}</nav>
      <div className="customer-details__activity-content"><div className="customer-details__activity-heading"><h3>{tab === 'Follow-ups' ? 'Recent Follow-ups' : tab}</h3>{tab === 'Follow-ups' && <Button icon="plus" iconPosition="start" variant="ghost" onClick={() => setShowFollowupForm(true)}>Add Follow-up</Button>}</div>
        {tab === 'Overview' && <p className="customer-details__tab-empty">{customer.notes || 'No customer notes saved yet.'}</p>}
        {tab === 'Follow-ups' && <div className="customer-details__timeline">{followUps.length ? followUps.map((item, index) => <article key={item.id} className="customer-details__entry"><span className={index === 0 ? 'is-current' : ''} /><div><header><time>{formatDate(item.follow_up_date || item.created_at)}</time><small>User #{item.created_by}</small></header><p>{item.note}</p></div></article>) : <p className="customer-details__tab-empty">No follow-ups have been recorded.</p>}</div>}
        {tab === 'Sales Challans' && <div className="customer-details__mini-table">{challans.length ? challans.map((challan) => <div key={challan.id}><span>#{challan.challan_number || challan.id}</span><strong>{titleCase(challan.status)}</strong><small>{formatDate(challan.created_at)}</small></div>) : <p className="customer-details__tab-empty">No challans created for this customer yet.</p>}</div>}
        {tab === 'Activity' && <p className="customer-details__tab-empty">Customer activity will appear as backend activity endpoints are added.</p>}
      </div>
    </section>

    {showFollowupForm && (
      <div className="app-modal" role="dialog" aria-modal="true" aria-label="Add follow-up">
        <form className="app-modal__panel" onSubmit={submitFollowup}>
          <header><h3>Add Follow-up</h3><button type="button" onClick={() => setShowFollowupForm(false)}>Close</button></header>
          <div className="app-form-grid">
            <label className="app-form-grid__wide">Note<textarea value={note} onChange={(event) => setNote(event.target.value)} required /></label>
            <label>Follow-up Date<input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} /></label>
          </div>
          <footer><Button variant="secondary" onClick={() => setShowFollowupForm(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Follow-up'}</Button></footer>
        </form>
      </div>
    )}
  </div>
}

export default CustomerDetails
