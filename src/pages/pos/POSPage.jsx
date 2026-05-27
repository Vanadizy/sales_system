import { Clock3, Minus, Plus, Printer, ScanBarcode, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import ReceiptPreview from '../../components/ReceiptPreview'
import { FormInput, Modal, PageHeader, PermissionGate, Select } from '../../components/UI'
import { money } from '../../utils/format'

export default function POSPage() {
  const { scoped, activeCompany, activeBranch, data, availableForSale, initiatePayment, notify } = useApp()
  const products = scoped('products'), settings = data.settings.find((row) => row.companyId === activeCompany.id)
  const [query, setQuery] = useState(''), [barcode, setBarcode] = useState(''), [cart, setCart] = useState([])
  const [discountRate, setDiscountRate] = useState(0), [payment, setPayment] = useState('Cash')
  const [initiated, setInitiated] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const visible = products
    .map((product) => ({ ...product, available: availableForSale(product.id) }))
    .filter((row) => `${row.name} ${row.sku}`.toLowerCase().includes(query.toLowerCase()))
  const add = (product) => setCart((rows) => {
    const existing = rows.find((row) => row.productId === product.id)
    if (existing) return rows.map((row) => row.productId === product.id ? { ...row, qty: Math.min(row.qty + 1, product.available), available: product.available } : row)
    return [...rows, { productId: product.id, name: product.name, price: product.price, qty: 1, available: product.available }]
  })
  const quantity = (id, delta) => setCart((rows) => rows.map((row) => row.productId === id ? { ...row, qty: Math.max(1, Math.min(row.qty + delta, row.available)) } : row))
  const scan = (event) => {
    event.preventDefault()
    if (!barcode.trim()) return notify('Enter a barcode to scan.', 'warning')
    const product = products.find((item) => item.barcode && item.barcode === barcode.trim())
    const item = product ? { ...product, available: availableForSale(product.id) } : null
    item ? add(item) : notify('Barcode not found.', 'warning')
    setBarcode('')
  }
  const subtotal = useMemo(() => cart.reduce((total, row) => total + row.price * row.qty, 0), [cart])
  const discount = subtotal * Number(discountRate) / 100
  const tax = (subtotal - discount) * (settings?.tax || 0) / 100
  const total = subtotal - discount + tax
  const save = () => {
    if (!cart.length) return notify('Add products before initiating a payment.', 'warning')
    const invoice = initiatePayment({
      customer: 'Walk-in Customer',
      subtotal,
      total,
      payment,
      discount,
      tax,
      items: cart.map((item) => ({ productId: item.productId, name: item.name, price: item.price, qty: item.qty })),
    })
    if (!invoice) return
    setInitiated(invoice)
    setShowInvoice(true)
    setCart([])
    setDiscountRate(0)
  }
  return <><PageHeader title="Point of Sale" description={`${activeBranch.name} counter / initiate invoices for Finance payment confirmation`} />{initiated && <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 shrink-0" size={18} /><div><p className="font-semibold">{initiated.invoice} is awaiting payment confirmation.</p><p className="mt-1">Finance must record receipt of {money(initiated.total, settings?.currency)} before stock is deducted and the transaction is counted as paid sales.</p></div></div><button className="btn-secondary shrink-0 px-3 py-1.5" onClick={() => setShowInvoice(true)}>View invoice</button></div>}<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_430px]"><section className="order-2 min-w-0 xl:order-1"><div className="card mb-5 grid gap-3 sm:grid-cols-2"><label className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" placeholder="Search products or product code" value={query} onChange={(event) => setQuery(event.target.value)} /></label><form className="relative" onSubmit={scan}><ScanBarcode className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" placeholder="Scan barcode if available" value={barcode} onChange={(event) => setBarcode(event.target.value)} /></form></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((product) => <button className="card text-left transition hover:border-brand-500" onClick={() => add(product)} key={product.id} disabled={!product.available}><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><ShoppingCart size={20} /></div><p className="font-semibold">{product.name}</p><p className="text-xs text-slate-500">{product.sku} / {product.available} available{product.stock !== product.available ? ' after pending invoices' : ''}</p><p className="mt-3 text-sm font-bold text-brand-700">{money(product.price, settings?.currency)}</p></button>)}</div></section><aside className="order-1 space-y-4 xl:order-2 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"><div className="card"><h2 className="mb-4 text-lg font-semibold">Current cart</h2><div className="mb-5 max-h-64 space-y-3 overflow-y-auto">{cart.map((line) => <div className="flex items-center justify-between gap-2" key={line.productId}><div className="min-w-0"><p className="truncate text-sm font-medium">{line.name}</p><p className="text-xs text-slate-500">{money(line.price, settings?.currency)}</p></div><div className="flex items-center gap-2"><button className="rounded-lg border p-1" onClick={() => quantity(line.productId, -1)}><Minus size={14} /></button><span className="w-5 text-center text-sm">{line.qty}</span><button className="rounded-lg border p-1" onClick={() => quantity(line.productId, 1)}><Plus size={14} /></button><button className="ml-1 text-red-500" onClick={() => setCart(cart.filter((row) => row.productId !== line.productId))}><Trash2 size={16} /></button></div></div>)}{!cart.length && <p className="py-5 text-center text-sm text-slate-500">Cart is empty.</p>}</div><div className="grid gap-3 sm:grid-cols-2"><PermissionGate permission="pos.discount"><FormInput label="Discount (%)" min="0" max="100" type="number" value={discountRate} onChange={(event) => setDiscountRate(event.target.value)} /></PermissionGate><Select label="Requested payment method" value={payment} onChange={(event) => setPayment(event.target.value)}><option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option></Select></div></div><ReceiptPreview company={{ ...activeCompany, currency: settings?.currency }} branch={activeBranch} items={cart} subtotal={subtotal} discount={discount} tax={tax} total={total} payment={payment} status="Draft" /><div className="flex gap-3"><button className="btn-secondary flex-1" onClick={() => window.print()}><Printer size={17} />Print draft</button><button className="btn-primary flex-1" onClick={save}>Initiate payment</button></div></aside></div><Modal open={Boolean(showInvoice && initiated)} title={`Invoice ${initiated?.invoice || ''}`} onClose={() => setShowInvoice(false)} footer={<><button className="btn-secondary" onClick={() => window.print()}><Printer size={16} />Print invoice</button><button className="btn-primary" onClick={() => setShowInvoice(false)}>Close</button></>} >{initiated && <ReceiptPreview company={{ ...activeCompany, currency: settings?.currency }} branch={activeBranch} invoice={initiated.invoice} status={initiated.status} date={initiated.date} customer={initiated.customer} items={initiated.items} subtotal={initiated.subtotal} discount={initiated.discount} tax={initiated.tax} total={initiated.total} payment={initiated.payment} />}</Modal></>
}
