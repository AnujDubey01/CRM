import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/api.service'

const blankProduct = {
  name: '',
  sku: '',
  category: '',
  unit_price: '',
  current_stock: '',
  minimum_stock: '',
  warehouse: '',
}

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

const getStatus = (product) => {
  const stock = Number(product.current_stock || 0)
  const minimum = Number(product.minimum_stock || 0)

  if (stock <= 0) return { tone: 'danger', label: 'Out of Stock' }
  if (stock <= minimum) return { tone: 'warning', label: 'Low Stock' }
  return { tone: 'success', label: 'In Stock' }
}

function ProductImage() {
  return (
    <div className="products-page__image products-page__image--empty" aria-hidden="true">
      <Icon name="package" />
    </div>
  )
}

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(blankProduct)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadProducts = async (term = search) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await getProducts(term)
      setProducts(response.products || [])
    } catch (error) {
      setProducts([])
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts('')
  }, [])

  const visibleProducts = useMemo(() => products, [products])

  const openCreate = () => {
    setForm(blankProduct)
    setEditingId(null)
    setModalOpen(true)
    setMessage('')
  }

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      unit_price: product.unit_price ?? '',
      current_stock: product.current_stock ?? '',
      minimum_stock: product.minimum_stock ?? '',
      warehouse: product.warehouse || '',
    })
    setEditingId(product.id)
    setModalOpen(true)
    setMessage('')
  }

  const updateField = (field, value) => setForm((oldForm) => ({ ...oldForm, [field]: value }))

  const submitProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const body = {
      ...form,
      unit_price: Number(form.unit_price),
      current_stock: Number(form.current_stock),
      minimum_stock: Number(form.minimum_stock),
    }

    try {
      const response = editingId ? await updateProduct(editingId, body) : await createProduct(body)
      setMessage(response.message || 'Product saved.')
      setModalOpen(false)
      await loadProducts()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return

    try {
      const response = await deleteProduct(product.id)
      setMessage(response.message || 'Product deleted.')
      await loadProducts()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const exportProducts = () => {
    const rows = [['Name', 'SKU', 'Category', 'Unit Price', 'Current Stock', 'Minimum Stock', 'Warehouse'], ...visibleProducts.map((product) => [product.name, product.sku, product.category, product.unit_price, product.current_stock, product.minimum_stock, product.warehouse])]
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'products.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h2 className="products-page__title">Products</h2>
          <p className="products-page__subtitle">Manage your catalog, pricing, and inventory thresholds.</p>
        </div>
        <div className="products-page__actions">
          <Button icon="download" iconPosition="start" variant="secondary" onClick={exportProducts}>Export</Button>
          <Button icon="plus" iconPosition="start" variant="primary" onClick={openCreate}>Add Product</Button>
        </div>
      </div>

      <div className="products-page__filters">
        <label className="products-page__search">
          <Icon name="search" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') loadProducts(event.currentTarget.value) }} type="search" placeholder="Search products, SKUs..." />
        </label>
        <div className="products-page__filter-group">
          <button type="button" className="products-page__select" onClick={() => loadProducts(search)}>Refresh <Icon name="chevron-right" /></button>
        </div>
      </div>

      <section className="products-page__table-card" aria-label="Products table">
        <div className="products-page__table-wrap">
          <table className="products-page__table">
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Unit Price</th><th>Current Stock</th><th>Min Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {visibleProducts.map((product) => {
                const status = getStatus(product)
                const stockPercent = Math.min((Number(product.current_stock || 0) / Math.max(Number(product.minimum_stock || 1) * 4, 1)) * 100, 100)

                return (
                  <tr key={product.id}>
                    <td><div className="products-page__product"><ProductImage /><span>{product.name}</span></div></td>
                    <td><span className="products-page__sku">{product.sku}</span></td>
                    <td>{product.category}</td>
                    <td>{currency.format(Number(product.unit_price || 0))}</td>
                    <td><div className={`products-page__stock products-page__stock--${status.tone}`}><div className="products-page__stock-meta"><strong>{product.current_stock}</strong><span>{product.warehouse}</span></div><div className="products-page__stock-track"><span style={{ width: `${stockPercent}%` }} /></div></div></td>
                    <td>{product.minimum_stock}</td>
                    <td><span className={`products-page__status products-page__status--${status.tone}`}><span aria-hidden="true" />{status.label}</span></td>
                    <td><div className="table-actions"><button type="button" onClick={() => openEdit(product)}>Edit</button><button type="button" onClick={() => removeProduct(product)}>Delete</button></div></td>
                  </tr>
                )
              })}
              {!loading && !visibleProducts.length && <tr><td className="challans-page__empty" colSpan="8">{message || 'No products found.'}</td></tr>}
              {loading && <tr><td className="challans-page__empty" colSpan="8">Loading products...</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="products-page__pagination"><span>{message || `Showing ${visibleProducts.length} products`}</span></div>
      </section>

      {modalOpen && (
        <div className="app-modal" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit product' : 'Add product'}>
          <form className="app-modal__panel" onSubmit={submitProduct}>
            <header><h3>{editingId ? 'Edit Product' : 'Add Product'}</h3><button type="button" onClick={() => setModalOpen(false)}>Close</button></header>
            <div className="app-form-grid">
              <label>Name<input value={form.name} onChange={(event) => updateField('name', event.target.value)} required /></label>
              <label>SKU<input value={form.sku} onChange={(event) => updateField('sku', event.target.value)} required /></label>
              <label>Category<input value={form.category} onChange={(event) => updateField('category', event.target.value)} required /></label>
              <label>Warehouse<input value={form.warehouse} onChange={(event) => updateField('warehouse', event.target.value)} required /></label>
              <label>Unit Price<input type="number" min="0" step="0.01" value={form.unit_price} onChange={(event) => updateField('unit_price', event.target.value)} required /></label>
              <label>Current Stock<input type="number" min="0" value={form.current_stock} onChange={(event) => updateField('current_stock', event.target.value)} required /></label>
              <label>Minimum Stock<input type="number" min="0" value={form.minimum_stock} onChange={(event) => updateField('minimum_stock', event.target.value)} required /></label>
            </div>
            {message && <p className="app-modal__message">{message}</p>}
            <footer><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button></footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default Products
