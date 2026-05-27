import { ArrowDownToLine, FileUp, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { readSpreadsheetRows, spreadsheetNumber, spreadsheetValue } from '../../services/importService'
import { Badge, DataTable, FormInput, Modal, PageHeader, PermissionGate, Select, Tabs } from '../../components/UI'
import { comparableText, dateTime, grossMargin, money } from '../../utils/format'

const inventoryTabs = ['Stock levels', 'Stock movements']

export default function InventoryPage() {
  const { scoped, data, activeCompany, receiveInventory, importInventory, notify } = useApp()
  const products = scoped('products')
  const suppliers = scoped('suppliers')
  const movements = scoped('inventory')
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const importRef = useRef(null)
  const [form, setForm] = useState(null)
  const [tab, setTab] = useState('Stock levels')
  const [importPreview, setImportPreview] = useState(null)
  const selectedProduct = products.find((row) => row.id === form?.productId)
  const lowStock = products.filter((product) => product.stock <= product.reorder)

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
        const barcode = String(spreadsheetValue(row, 'barcode', 'barcode optional')).trim()
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
          errors.push(`row ${row.__rowNumber || index + 2}`)
          return null
        }
        const sourceDate = spreadsheetValue(row, 'date', 'received date')
        const parsedDate = sourceDate ? new Date(sourceDate) : new Date()
        const receiptCost = unitCost ?? product.cost ?? 0
        return {
          id: `preview-receipt-${index}`,
          productId: product.id,
          productName: product.name,
          productCode: product.sku,
          supplierId: supplier.id,
          supplierName: supplier.name,
          date: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
          quantity,
          unitCost: receiptCost,
          totalCost: receiptCost * quantity,
        }
      }).filter(Boolean)
      if (!receipts.length || errors.length) {
        notify(`Inventory import failed. Check exact product, supplier, quantity and cost values in ${errors.join(', ') || 'the spreadsheet'}.`, 'warning')
        return
      }
      setImportPreview({ fileName: file.name, receipts })
    } catch {
      notify('Unable to read the inventory spreadsheet.', 'warning')
    } finally {
      event.target.value = ''
    }
  }
  const confirmImport = () => {
    const entries = importPreview.receipts.map((receipt) => ({
      productId: receipt.productId,
      supplierId: receipt.supplierId,
      date: receipt.date,
      quantity: receipt.quantity,
      unitCost: receipt.unitCost,
    }))
    if (importInventory(entries)) {
      setImportPreview(null)
      setTab('Stock movements')
    }
  }

  return <>
    <PageHeader
      title="Inventory"
      description="Post supplier receipts against registered products. Each receipt updates the product's latest cost."
      action={<PermissionGate permission="inventory.add"><div className="flex flex-wrap gap-2"><input ref={importRef} className="hidden" type="file" accept=".xlsx,.xls,.csv" onChange={importFile} /><button className="btn-secondary" onClick={() => importRef.current?.click()}><FileUp size={17} />Import Excel</button><button className="btn-primary" disabled={!products.length || !suppliers.length} onClick={() => setForm({ productId: products[0]?.id || '', quantity: '', unitCost: products[0]?.cost || '', supplierId: suppliers[0]?.id || '' })}><Plus size={17} />Receive stock</button></div></PermissionGate>}
    />
    {!suppliers.length && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Add at least one supplier before posting a stock receipt.</div>}
    <div className="mb-5"><Tabs tabs={inventoryTabs} selected={tab} onChange={setTab} /></div>
    {tab === 'Stock levels' && <div className="card">
      <div className="mb-5"><h2 className="font-semibold">Stock levels and minimum stock</h2><p className="mt-1 text-sm text-slate-500">{products.length} products tracked / {lowStock.length} at or below minimum stock.</p></div>
      <DataTable
        rows={products}
        mobileTitle={(row) => row.name}
        columns={[
          { key: 'name', label: 'Product' },
          { key: 'sku', label: 'Product code' },
          { key: 'stock', label: 'Current stock', render: (row) => `${row.stock} units` },
          { key: 'reorder', label: 'Minimum stock', render: (row) => `${row.reorder} units` },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={row.stock <= row.reorder ? 'warning' : 'success'}>{row.stock <= row.reorder ? 'Reorder' : 'Healthy'}</Badge> },
          { key: 'cost', label: 'Latest cost', render: (row) => money(row.cost, currency) },
          { key: 'margin', label: 'Margin', render: (row) => `${grossMargin(row.price, row.cost).toFixed(1)}%` },
        ]}
      />
    </div>}
    {tab === 'Stock movements' && <div className="card"><h2 className="mb-2 font-semibold">Inventory history</h2><p className="mb-4 text-xs text-slate-500">Excel import columns: Product Code, Quantity, Unit Cost, Supplier and Date. Exact Product Name or Barcode may be used instead of Product Code; Supplier must match an existing supplier.</p><DataTable rows={movements} mobileTitle={(row) => row.product} columns={[{ key: 'product', label: 'Product' }, { key: 'date', label: 'Date', render: (row) => dateTime(row.date) }, { key: 'type', label: 'Movement', render: (row) => <Badge>{row.type}</Badge> }, { key: 'quantity', label: 'Quantity' }, { key: 'supplier', label: 'Supplier' }, { key: 'unitCost', label: 'Unit cost', render: (row) => money(row.unitCost ?? row.cost / row.quantity, currency) }, { key: 'cost', label: 'Total cost', render: (row) => money(row.cost, currency) }, { key: 'user', label: 'Recorded by' }]} /></div>}
    <Modal open={Boolean(importPreview)} onClose={() => setImportPreview(null)} title="Preview inventory import" footer={<><button className="btn-secondary" onClick={() => setImportPreview(null)}>Cancel</button><button className="btn-primary" onClick={confirmImport}>Import {importPreview?.receipts.length || 0} receipts</button></>}>
      {importPreview && <div>
        <p className="mb-4 text-sm text-slate-500">{importPreview.fileName} / Review the stock receipts before importing them and updating product balances.</p>
        <DataTable
          rows={importPreview.receipts}
          mobileTitle={(row) => row.productName}
          columns={[
            { key: 'productName', label: 'Product' },
            { key: 'productCode', label: 'Product code' },
            { key: 'supplierName', label: 'Supplier' },
            { key: 'date', label: 'Date', render: (row) => dateTime(row.date) },
            { key: 'quantity', label: 'Quantity' },
            { key: 'unitCost', label: 'Unit cost', render: (row) => money(row.unitCost, currency) },
            { key: 'totalCost', label: 'Total cost', render: (row) => money(row.totalCost, currency) },
          ]}
        />
      </div>}
    </Modal>
    <Modal title="Receive inventory" open={Boolean(form)} onClose={() => setForm(null)} footer={<><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" form="inventory-form"><ArrowDownToLine size={16} />Post receipt</button></>}>
      <form id="inventory-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Select label="Product" value={form?.productId} onChange={(event) => { const product = products.find((row) => row.id === event.target.value); setForm({ ...form, productId: event.target.value, unitCost: product?.cost ?? '' }) }}>{products.map((product) => <option value={product.id} key={product.id}>{product.name} ({product.sku})</option>)}</Select>
        <Select label="Supplier" value={form?.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })}>{suppliers.map((supplier) => <option value={supplier.id} key={supplier.id}>{supplier.name}</option>)}</Select>
        <FormInput label="Quantity received" required min="1" type="number" value={form?.quantity || ''} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        <FormInput label="Unit cost" required min="0" type="number" value={form?.unitCost ?? ''} onChange={(event) => setForm({ ...form, unitCost: event.target.value })} />
        {selectedProduct && <p className="text-xs text-slate-500 sm:col-span-2">Current stock: {selectedProduct.stock} units. Minimum stock: {selectedProduct.reorder} units. Selling price: {money(selectedProduct.price, currency)}. Current latest cost: {money(selectedProduct.cost, currency)}. The posted unit cost becomes the latest product cost and cannot exceed the selling price.</p>}
      </form>
    </Modal>
  </>
}
