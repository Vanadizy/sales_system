import { ArrowDownToLine, FileUp, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { readSpreadsheetRows, spreadsheetNumber, spreadsheetValue } from '../../services/importService'
import { Badge, DataTable, FormInput, Modal, PageHeader, PermissionGate, Select } from '../../components/UI'
import { comparableText, dateTime, grossMargin, money } from '../../utils/format'

export default function InventoryPage() {
  const { scoped, data, activeCompany, receiveInventory, importInventory, notify } = useApp()
  const products = scoped('products')
  const suppliers = scoped('suppliers')
  const movements = scoped('inventory')
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const importRef = useRef(null)
  const [form, setForm] = useState(null)
  const selectedProduct = products.find((row) => row.id === form?.productId)

  const submit = (event) => {
    event.preventDefault()
    if (receiveInventory({ ...form, date: new Date().toISOString() })) setForm(null)
  }

  const importFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const rows = await readSpreadsheetRows(file)
      const errors = []
      const receipts = rows.map((row, index) => {
        const productCode = String(spreadsheetValue(row, 'product code', 'sku')).trim().toLowerCase()
        const productName = comparableText(spreadsheetValue(row, 'product name', 'product', 'name'))
        const barcode = String(spreadsheetValue(row, 'barcode')).trim()
        const identifierMatches = [
          productCode ? products.filter((item) => String(item.sku).toLowerCase() === productCode) : null,
          barcode ? products.filter((item) => item.barcode && item.barcode === barcode) : null,
          productName ? products.filter((item) => comparableText(item.name) === productName) : null,
        ].filter(Boolean)
        const product = identifierMatches.length
          && identifierMatches.every((matches) => matches.length === 1 && matches[0].id === identifierMatches[0][0]?.id)
          ? identifierMatches[0][0]
          : null
        const supplierName = comparableText(spreadsheetValue(row, 'supplier', 'supplier name'))
        const supplierMatches = suppliers.filter((item) => supplierName && comparableText(item.name) === supplierName)
        const supplier = supplierMatches.length === 1 ? supplierMatches[0] : null
        const quantity = spreadsheetNumber(row, 'quantity', 'quantity received', 'stock in')
        const unitCost = spreadsheetNumber(row, 'unit cost', 'cost', 'purchase cost')
        if (!product || !supplier || quantity == null || Number.isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity) || (unitCost != null && (Number.isNaN(unitCost) || unitCost < 0))) {
          errors.push(`row ${index + 2}`)
          return null
        }
        const sourceDate = spreadsheetValue(row, 'date', 'received date')
        const parsedDate = sourceDate ? new Date(sourceDate) : new Date()
        return {
          productId: product.id,
          supplierId: supplier.id,
          date: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
          quantity,
          unitCost: unitCost ?? product.cost ?? 0,
        }
      }).filter(Boolean)
      if (!receipts.length || errors.length) {
        notify(`Inventory import failed. Check exact product, supplier, quantity and cost values in ${errors.join(', ') || 'the spreadsheet'}.`, 'warning')
        return
      }
      importInventory(receipts)
    } catch {
      notify('Unable to read the inventory spreadsheet.', 'warning')
    } finally {
      event.target.value = ''
    }
  }

  return <>
    <PageHeader
      title="Inventory"
      description="Post supplier receipts against registered products. Each receipt updates the product's latest cost."
      action={<PermissionGate permission="inventory.add"><div className="flex flex-wrap gap-2"><input ref={importRef} className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={importFile} /><button className="btn-secondary" onClick={() => importRef.current?.click()}><FileUp size={17} />Import Excel</button><button className="btn-primary" disabled={!products.length || !suppliers.length} onClick={() => setForm({ productId: products[0]?.id || '', quantity: '', unitCost: products[0]?.cost || '', supplierId: suppliers[0]?.id || '' })}><Plus size={17} />Receive stock</button></div></PermissionGate>}
    />
    {!suppliers.length && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Add at least one supplier before posting a stock receipt.</div>}
    <div className="grid gap-5 lg:grid-cols-3">{products.slice(0, 3).map((product) => <div className="card flex items-center justify-between" key={product.id}><div><p className="text-sm text-slate-500">{product.name}</p><p className="mt-1 text-2xl font-bold">{product.stock}</p><p className="mt-1 text-xs text-slate-500">Latest cost {money(product.cost, currency)} / Margin {grossMargin(product.price, product.cost).toFixed(1)}%</p></div><Badge variant={product.stock <= product.reorder ? 'warning' : 'success'}>{product.stock <= product.reorder ? 'Reorder' : 'Healthy'}</Badge></div>)}</div>
    <div className="card mt-6"><h2 className="mb-2 font-semibold">Inventory history</h2><p className="mb-4 text-xs text-slate-500">Excel import columns: Product Code, Quantity, Unit Cost, Supplier and Date. Exact Product Name or Barcode may be used instead of Product Code; Supplier must match an existing supplier.</p><DataTable rows={movements} mobileTitle={(row) => row.product} columns={[{ key: 'product', label: 'Product' }, { key: 'date', label: 'Date', render: (row) => dateTime(row.date) }, { key: 'type', label: 'Movement', render: (row) => <Badge>{row.type}</Badge> }, { key: 'quantity', label: 'Quantity' }, { key: 'supplier', label: 'Supplier' }, { key: 'unitCost', label: 'Unit cost', render: (row) => money(row.unitCost ?? row.cost / row.quantity, currency) }, { key: 'cost', label: 'Total cost', render: (row) => money(row.cost, currency) }, { key: 'user', label: 'Recorded by' }]} /></div>
    <Modal title="Receive inventory" open={Boolean(form)} onClose={() => setForm(null)} footer={<><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" form="inventory-form"><ArrowDownToLine size={16} />Post receipt</button></>}>
      <form id="inventory-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Select label="Product" value={form?.productId} onChange={(event) => { const product = products.find((row) => row.id === event.target.value); setForm({ ...form, productId: event.target.value, unitCost: product?.cost ?? '' }) }}>{products.map((product) => <option value={product.id} key={product.id}>{product.name} ({product.sku})</option>)}</Select>
        <Select label="Supplier" value={form?.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })}>{suppliers.map((supplier) => <option value={supplier.id} key={supplier.id}>{supplier.name}</option>)}</Select>
        <FormInput label="Quantity received" required min="1" type="number" value={form?.quantity || ''} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        <FormInput label="Unit cost" required min="0" type="number" value={form?.unitCost ?? ''} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} />
        {selectedProduct && <p className="text-xs text-slate-500 sm:col-span-2">Selling price: {money(selectedProduct.price, currency)}. Current latest cost: {money(selectedProduct.cost, currency)}. The posted unit cost becomes the latest product cost and cannot exceed the selling price.</p>}
      </form>
    </Modal>
  </>
}
