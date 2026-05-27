import { FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { readSpreadsheetRows, spreadsheetNumber, spreadsheetValue } from '../../services/importService'
import { Badge, ConfirmDialog, DataTable, FormInput, Modal, PageHeader, PermissionGate } from '../../components/UI'
import { grossMargin, money } from '../../utils/format'

const blank = { name: '', barcode: '', category: 'General', price: '', cost: '', stock: '', reorder: '' }
const categories = ['General', 'Groceries', 'Beverages', 'Home Care', 'Stationery', 'Phones', 'Phone Accessories', 'Computer Accessories', 'Computers', 'Electronics', 'Appliances', 'Clothing', 'Beauty', 'Hardware', 'Services']

export default function ProductsPage() {
  const { scoped, data, activeCompany, addProduct, updateProduct, importProducts, deleteRecord, notify } = useApp()
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const importRef = useRef(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)
  const products = scoped('products').filter((row) => `${row.name} ${row.sku} ${row.category}`.toLowerCase().includes(query.toLowerCase()))
  const pageSize = 6
  const pages = Math.max(1, Math.ceil(products.length / pageSize))
  const displayed = products.slice((page - 1) * pageSize, page * pageSize)
  const open = (product = blank) => setEditing({ ...product })

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
          errors.push(`row ${index + 2}`)
          return null
        }
        return {
          name,
          category: String(spreadsheetValue(row, 'category', 'product category')).trim() || 'General',
          barcode: String(spreadsheetValue(row, 'barcode')).trim(),
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
      if (importProducts(records)) setPage(1)
    } catch {
      notify('Unable to read the product spreadsheet.', 'warning')
    } finally {
      event.target.value = ''
    }
  }

  return <>
    <PageHeader
      title="Products & stock"
      description="Manage all products, including phones, accessories, computers, electronics and general merchandise."
      action={<PermissionGate permission="products.add"><div className="flex flex-wrap gap-2"><input ref={importRef} className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={importFile} /><button className="btn-secondary" onClick={() => importRef.current?.click()}><FileUp size={17} />Import Excel</button><button className="btn-primary" onClick={() => open()}><Plus size={17} />Add product</button></div></PermissionGate>}
    />
    <div className="card">
      <label className="relative mb-5 block max-w-sm"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="input pl-10" placeholder="Search catalogue" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></label>
      <p className="mb-5 text-xs text-slate-500">Excel import columns: Name, Category, Selling Price, Purchase Cost, Opening Stock, Reorder Level, Barcode (optional). Product names must be unique in this branch and product codes are generated automatically.</p>
      <DataTable rows={displayed} mobileTitle={(row) => row.name} columns={[{ key: 'name', label: 'Product' }, { key: 'sku', label: 'Product code' }, { key: 'category', label: 'Category' }, { key: 'price', label: 'Selling price', render: (row) => money(row.price, currency) }, { key: 'cost', label: 'Latest cost', render: (row) => money(row.cost, currency) }, { key: 'margin', label: 'Margin', render: (row) => <Badge variant={grossMargin(row.price, row.cost) > 0 ? 'success' : 'warning'}>{grossMargin(row.price, row.cost).toFixed(1)}%</Badge> }, { key: 'stock', label: 'Stock', render: (row) => <Badge variant={row.stock <= row.reorder ? 'warning' : 'success'}>{row.stock} units</Badge> }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><PermissionGate permission="products.edit"><button aria-label="Edit product" className="rounded-lg border p-2 hover:bg-slate-50" onClick={() => open(row)}><Pencil size={15} /></button></PermissionGate><PermissionGate permission="products.delete"><button aria-label="Delete product" className="rounded-lg border p-2 text-red-500" onClick={() => setRemoving(row)}><Trash2 size={15} /></button></PermissionGate></div> }]} />
      <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><button className="btn-secondary px-3 py-1.5" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="btn-secondary px-3 py-1.5" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div></div>
    </div>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? 'Edit product' : 'New product'} footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" form="product-form">Save product</button></>}>
      <form id="product-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <FormInput label="Product name" value={editing?.name || ''} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
        <FormInput label="Product code" value={editing?.sku || 'Generated automatically'} disabled />
        <FormInput label="Barcode (optional)" value={editing?.barcode || ''} onChange={(event) => setEditing({ ...editing, barcode: event.target.value })} />
        <FormInput label="Category" list="product-categories" value={editing?.category || ''} onChange={(event) => setEditing({ ...editing, category: event.target.value })} required />
        <datalist id="product-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
        <FormInput label="Selling price" min="0" type="number" value={editing?.price ?? ''} onChange={(event) => setEditing({ ...editing, price: event.target.value })} required />
        <FormInput label={editing?.id ? 'Latest cost' : 'Purchase cost'} min="0" type="number" value={editing?.cost ?? ''} onChange={(event) => setEditing({ ...editing, cost: event.target.value })} disabled={Boolean(editing?.id)} required />
        <FormInput label={editing?.id ? 'Current stock' : 'Opening stock'} min="0" type="number" value={editing?.stock ?? ''} onChange={(event) => setEditing({ ...editing, stock: event.target.value })} disabled={Boolean(editing?.id)} required />
        <FormInput label="Reorder level" min="0" type="number" value={editing?.reorder ?? ''} onChange={(event) => setEditing({ ...editing, reorder: event.target.value })} required />
        <p className="text-xs text-slate-500 sm:col-span-2">Purchase cost cannot exceed selling price. After creation, receive stock through Inventory to update quantities and the latest recorded cost.</p>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(removing)} title="Delete product" message={`Delete ${removing?.name}? This removes it only from the selected branch.`} onClose={() => setRemoving(null)} onConfirm={() => { deleteRecord('products', removing.id, 'Product deleted', 'Products'); setRemoving(null) }} />
  </>
}
