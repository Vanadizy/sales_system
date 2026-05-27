import { AlertTriangle, Boxes, Eye, FileUp, History, Pencil, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { readSpreadsheetRows, spreadsheetNumber, spreadsheetValue } from '../../services/importService'
import { Badge, ConfirmDialog, DataTable, FormInput, Modal, PageHeader, PermissionGate, StatCard } from '../../components/UI'
import { dateTime, grossMargin, money } from '../../utils/format'

const blank = { name: '', barcode: '', category: 'General', price: '', cost: '', stock: '', reorder: '' }
const categories = ['General', 'Groceries', 'Beverages', 'Home Care', 'Stationery', 'Phones', 'Phone Accessories', 'Computer Accessories', 'Computers', 'Electronics', 'Appliances', 'Clothing', 'Beauty', 'Hardware', 'Services']

export default function ProductsPage() {
  const { scoped, data, activeCompany, role, addProduct, updateProduct, importProducts, deleteRecord, notify } = useApp()
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const importRef = useRef(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [trackingId, setTrackingId] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const catalogue = scoped('products')
  const invoices = scoped('sales')
  const movements = scoped('inventory')
  const invoiceLines = invoices.flatMap((invoice) => Array.isArray(invoice.items) ? invoice.items.map((item, index) => ({
    id: `${invoice.id}-${item.productId}-${index}`,
    productId: item.productId,
    invoice: invoice.invoice,
    date: invoice.paidAt || invoice.date,
    customer: invoice.customer || 'Walk-in Customer',
    status: invoice.status || 'Awaiting Payment',
    qty: Number(item.qty || 0),
    lineTotal: Number(item.price || 0) * Number(item.qty || 0),
  })) : [])
  const trackedProducts = catalogue.map((product) => {
    const lines = invoiceLines.filter((line) => line.productId === product.id)
    return {
      ...product,
      soldUnits: lines.filter((line) => line.status === 'Paid').reduce((sum, line) => sum + line.qty, 0),
      pendingUnits: lines.filter((line) => line.status === 'Awaiting Payment').reduce((sum, line) => sum + line.qty, 0),
    }
  })
  const products = trackedProducts.filter((row) => `${row.name} ${row.sku} ${row.category}`.toLowerCase().includes(query.toLowerCase()))
  const trackingProduct = trackedProducts.find((product) => product.id === trackingId)
  const trackingInvoices = invoiceLines.filter((line) => line.productId === trackingId)
  const trackingMovements = movements.filter((movement) => movement.productId === trackingId)
  const paidUnitsSold = trackedProducts.reduce((sum, product) => sum + product.soldUnits, 0)
  const remainingUnits = trackedProducts.reduce((sum, product) => sum + Number(product.stock || 0), 0)
  const pendingUnits = trackedProducts.reduce((sum, product) => sum + product.pendingUnits, 0)
  const soldProducts = trackedProducts.filter((product) => product.soldUnits > 0).length
  const lowStock = trackedProducts.filter((product) => product.stock <= product.reorder).length
  const pageSize = 6
  const pages = Math.max(1, Math.ceil(products.length / pageSize))
  const displayed = products.slice((page - 1) * pageSize, page * pageSize)
  const open = (product = blank) => setEditing({ ...product })
  const financePriceLocked = Boolean(editing?.id && role === 'Accountant')

  const submit = (event) => {
    event.preventDefault()
    const values = {
      ...editing,
      barcode: editing.barcode.trim(),
      category: editing.category.trim() || 'General',
      price: Number(editing.price),
      cost: Number(editing.cost),
      stock: Number(editing.stock),
      reorder: Number(editing.reorder),
    }
    const saved = editing.id ? updateProduct(editing.id, values) : addProduct(values)
    if (saved) setEditing(null)
  }

  const importFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const rows = await readSpreadsheetRows(file)
      const errors = []
      const records = rows.map((row, index) => {
        const name = String(spreadsheetValue(row, 'name', 'product', 'product name')).trim()
        const price = spreadsheetNumber(row, 'price', 'selling price', 'sale price')
        const cost = spreadsheetNumber(row, 'cost', 'purchase cost', 'unit cost') ?? 0
        const stock = spreadsheetNumber(row, 'stock', 'opening stock', 'quantity') ?? 0
        const reorder = spreadsheetNumber(row, 'reorder', 'reorder level', 'minimum stock') ?? 0
        if (!name || price == null || [price, cost, stock, reorder].some((number) => Number.isNaN(number) || number < 0)) {
          errors.push(`row ${row.__rowNumber || index + 2}`)
          return null
        }
        return {
          id: `preview-product-${index}`,
          name,
          category: String(spreadsheetValue(row, 'category', 'product category')).trim() || 'General',
          barcode: String(spreadsheetValue(row, 'barcode', 'barcode optional')).trim(),
          price,
          cost,
          stock,
          reorder,
        }
      }).filter(Boolean)
      if (!records.length || errors.length) {
        notify(`Product import failed. Check required values in ${errors.join(', ') || 'the spreadsheet'}.`, 'warning')
        return
      }
      setImportPreview({ fileName: file.name, records })
    } catch {
      notify('Unable to read the product spreadsheet.', 'warning')
    } finally {
      event.target.value = ''
    }
  }
  const confirmImport = () => {
    const records = importPreview.records.map((record) => ({
      name: record.name,
      category: record.category,
      barcode: record.barcode,
      price: record.price,
      cost: record.cost,
      stock: record.stock,
      reorder: record.reorder,
    }))
    if (importProducts(records)) {
      setPage(1)
      setImportPreview(null)
    }
  }

  return <>
    <PageHeader
      title="Products & stock"
      description="Manage all products, including phones, accessories, computers, electronics and general merchandise."
      action={<PermissionGate permission="products.add"><div className="flex flex-wrap gap-2"><input ref={importRef} className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={importFile} /><button className="btn-secondary" onClick={() => importRef.current?.click()}><FileUp size={17} />Import Excel</button><button className="btn-primary" onClick={() => open()}><Plus size={17} />Add product</button></div></PermissionGate>}
    />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Paid units sold" value={`${paidUnitsSold} units`} detail={`${soldProducts} products sold on paid invoices`} icon={ShoppingCart} tone="green" />
      <StatCard label="Total remaining stock" value={`${remainingUnits} units`} detail={`${catalogue.length} products currently tracked`} icon={Boxes} />
      <StatCard label="Reserved for payment" value={`${pendingUnits} units`} detail="Awaiting Finance confirmation" icon={History} tone={pendingUnits ? 'amber' : 'blue'} />
      <StatCard label="Low stock products" value={lowStock} detail="At or below minimum stock" icon={AlertTriangle} tone={lowStock ? 'amber' : 'green'} />
    </div>
    <div className="card">
      <label className="relative mb-5 block max-w-sm"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="input pl-10" placeholder="Search catalogue" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></label>
      <p className="mb-5 text-xs text-slate-500">Excel import columns: Name, Category, Selling Price, Purchase Cost, Opening Stock, Minimum Stock, Barcode (optional). Product names must be unique in this branch and product codes are generated automatically.</p>
      <DataTable rows={displayed} mobileTitle={(row) => row.name} columns={[{ key: 'name', label: 'Product' }, { key: 'sku', label: 'Product code' }, { key: 'category', label: 'Category' }, { key: 'price', label: 'Selling price', render: (row) => money(row.price, currency) }, { key: 'cost', label: 'Latest cost', render: (row) => money(row.cost, currency) }, { key: 'margin', label: 'Margin', render: (row) => <Badge variant={grossMargin(row.price, row.cost) > 0 ? 'success' : 'warning'}>{grossMargin(row.price, row.cost).toFixed(1)}%</Badge> }, { key: 'soldUnits', label: 'Paid units sold', render: (row) => `${row.soldUnits} units` }, { key: 'stock', label: 'Remaining stock', render: (row) => <Badge variant={row.stock <= row.reorder ? 'warning' : 'success'}>{row.stock} units</Badge> }, { key: 'reorder', label: 'Minimum stock', render: (row) => `${row.reorder} units` }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => setTrackingId(row.id)}><Eye size={15} />Track</button><PermissionGate permission="products.edit"><button aria-label="Edit product" className="rounded-lg border p-2 hover:bg-slate-50" onClick={() => open(row)}><Pencil size={15} /></button></PermissionGate><PermissionGate permission="products.delete"><button aria-label="Delete product" className="rounded-lg border p-2 text-red-500" onClick={() => setRemoving(row)}><Trash2 size={15} /></button></PermissionGate></div> }]} />
      <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><button className="btn-secondary px-3 py-1.5" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="btn-secondary px-3 py-1.5" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div></div>
    </div>
    <Modal open={Boolean(importPreview)} onClose={() => setImportPreview(null)} title="Preview product import" footer={<><button className="btn-secondary" onClick={() => setImportPreview(null)}>Cancel</button><button className="btn-primary" onClick={confirmImport}>Import {importPreview?.records.length || 0} products</button></>}>
      {importPreview && <div>
        <p className="mb-4 text-sm text-slate-500">{importPreview.fileName} / Review the parsed product records before importing them.</p>
        <DataTable
          rows={importPreview.records}
          mobileTitle={(row) => row.name}
          columns={[
            { key: 'name', label: 'Product' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Selling price', render: (row) => money(row.price, currency) },
            { key: 'cost', label: 'Purchase cost', render: (row) => money(row.cost, currency) },
            { key: 'stock', label: 'Opening stock' },
            { key: 'reorder', label: 'Minimum stock' },
            { key: 'barcode', label: 'Barcode', render: (row) => row.barcode || '-' },
          ]}
        />
      </div>}
    </Modal>
    <Modal open={Boolean(trackingProduct)} onClose={() => setTrackingId(null)} title={`Track product: ${trackingProduct?.name || ''}`} footer={<button className="btn-primary" onClick={() => setTrackingId(null)}>Close</button>}>
      {trackingProduct && <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-3"><p className="text-xs text-slate-500">Paid units sold</p><p className="mt-1 text-xl font-bold">{trackingProduct.soldUnits}</p></div>
          <div className="rounded-xl border p-3"><p className="text-xs text-slate-500">Remaining stock</p><p className="mt-1 text-xl font-bold">{trackingProduct.stock}</p></div>
          <div className="rounded-xl border p-3"><p className="text-xs text-slate-500">Reserved units</p><p className="mt-1 text-xl font-bold">{trackingProduct.pendingUnits}</p></div>
          <div className="rounded-xl border p-3"><p className="text-xs text-slate-500">Minimum stock</p><p className="mt-1 text-xl font-bold">{trackingProduct.reorder}</p></div>
        </div>
        <section>
          <h3 className="mb-1 font-semibold">Invoice activity</h3>
          <p className="mb-3 text-xs text-slate-500">Only paid invoice quantities count as sold. Awaiting payment quantities remain reserved until Finance confirms payment.</p>
          <DataTable
            rows={trackingInvoices}
            empty={{ title: 'No invoice activity', message: 'This product has not appeared on an invoice.' }}
            mobileTitle={(row) => row.invoice}
            columns={[
              { key: 'invoice', label: 'Invoice' },
              { key: 'date', label: 'Date', render: (row) => dateTime(row.date) },
              { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Paid' ? 'success' : row.status === 'Awaiting Payment' ? 'warning' : 'neutral'}>{row.status}</Badge> },
              { key: 'qty', label: 'Quantity' },
              { key: 'lineTotal', label: 'Value', render: (row) => money(row.lineTotal, currency) },
            ]}
          />
        </section>
        <section>
          <h3 className="mb-3 font-semibold">Stock receipt history</h3>
          <DataTable
            rows={trackingMovements}
            empty={{ title: 'No receipt history', message: 'There are no recorded stock receipts for this product.' }}
            mobileTitle={(row) => row.type}
            columns={[
              { key: 'date', label: 'Date', render: (row) => dateTime(row.date) },
              { key: 'type', label: 'Movement', render: (row) => <Badge>{row.type}</Badge> },
              { key: 'quantity', label: 'Quantity' },
              { key: 'supplier', label: 'Supplier' },
              { key: 'cost', label: 'Cost', render: (row) => money(row.cost, currency) },
            ]}
          />
        </section>
      </div>}
    </Modal>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? 'Edit product' : 'New product'} footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" form="product-form">Save product</button></>}>
      <form id="product-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <FormInput label="Product name" value={editing?.name || ''} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
        <FormInput label="Product code" value={editing?.sku || 'Generated automatically'} disabled />
        <FormInput label="Barcode (optional)" value={editing?.barcode || ''} onChange={(event) => setEditing({ ...editing, barcode: event.target.value })} />
        <FormInput label="Category" list="product-categories" value={editing?.category || ''} onChange={(event) => setEditing({ ...editing, category: event.target.value })} required />
        <datalist id="product-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
        <FormInput label={financePriceLocked ? 'Selling price (Finance read-only)' : 'Selling price'} min="0" type="number" value={editing?.price ?? ''} onChange={(event) => setEditing({ ...editing, price: event.target.value })} disabled={financePriceLocked} required />
        <FormInput label={editing?.id ? 'Latest cost' : 'Purchase cost'} min="0" type="number" value={editing?.cost ?? ''} onChange={(event) => setEditing({ ...editing, cost: event.target.value })} disabled={Boolean(editing?.id)} required />
        <FormInput label={editing?.id ? 'Current stock' : 'Opening stock'} min="0" type="number" value={editing?.stock ?? ''} onChange={(event) => setEditing({ ...editing, stock: event.target.value })} disabled={Boolean(editing?.id)} required />
        <FormInput label="Minimum stock level" min="0" type="number" value={editing?.reorder ?? ''} onChange={(event) => setEditing({ ...editing, reorder: event.target.value })} required />
        <p className="text-xs text-slate-500 sm:col-span-2">{financePriceLocked ? 'Finance users may view the selling price but cannot increase or decrease it.' : 'Purchase cost cannot exceed selling price. After creation, receive stock through Inventory to update quantities and the latest recorded cost.'}</p>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(removing)} title="Delete product" message={`Delete ${removing?.name}? This removes it only from the selected branch.`} onClose={() => setRemoving(null)} onConfirm={() => { deleteRecord('products', removing.id, 'Product deleted', 'Products'); setRemoving(null) }} />
  </>
}
