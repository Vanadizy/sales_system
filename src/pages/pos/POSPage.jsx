import { Minus, Plus, Printer, ScanBarcode, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import ReceiptPreview from '../../components/ReceiptPreview'
import { FormInput, PageHeader, PermissionGate, Select } from '../../components/UI'
import { money } from '../../utils/format'

export default function POSPage() {
  const { scoped, activeCompany, activeBranch, data, completeSale, notify } = useApp()
  const products = scoped('products'), settings = data.settings.find((row) => row.companyId === activeCompany.id)
  const [query, setQuery] = useState(''), [barcode, setBarcode] = useState(''), [cart, setCart] = useState([])
  const [discountRate, setDiscountRate] = useState(0), [payment, setPayment] = useState('Cash')
  const visible = products.filter((row) => `${row.name} ${row.sku}`.toLowerCase().includes(query.toLowerCase()))
  const add = (product) => setCart((rows) => {
    const existing = rows.find((row) => row.productId === product.id)
    if (existing) return rows.map((row) => row.productId === product.id ? { ...row, qty: Math.min(row.qty + 1, product.stock) } : row)
    return [...rows, { productId: product.id, name: product.name, price: product.price, qty: 1, stock: product.stock }]
  })
  const quantity = (id, delta) => setCart((rows) => rows.map((row) => row.productId === id ? { ...row, qty: Math.max(1, Math.min(row.qty + delta, row.stock)) } : row))
  const scan = (event) => {
    event.preventDefault()
    if (!barcode.trim()) return notify('Enter a barcode to scan.', 'warning')
    const item = products.find((product) => product.barcode && product.barcode === barcode.trim())
    item ? add(item) : notify('Barcode not found.', 'warning')
    setBarcode('')
  }
  const subtotal = useMemo(() => cart.reduce((total, row) => total + row.price * row.qty, 0), [cart])
  const discount = subtotal * Number(discountRate) / 100
  const tax = (subtotal - discount) * (settings?.tax || 0) / 100
  const total = subtotal - discount + tax
  const save = () => {
    if (!cart.length) return notify('Add products before saving a sale.', 'warning')
    completeSale({ customer: 'Walk-in Customer', total, payment, discount, tax, items: cart })
    setCart([]); setDiscountRate(0)
  }
  return <><PageHeader title="Point of Sale" description={`${activeBranch.name} counter / instant stock deduction on completion`} /><div className="grid gap-6 xl:grid-cols-[1fr_410px]"><section><div className="card mb-5 grid gap-3 sm:grid-cols-2"><label className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" placeholder="Search products or product code" value={query} onChange={(event) => setQuery(event.target.value)} /></label><form className="relative" onSubmit={scan}><ScanBarcode className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" placeholder="Scan barcode if available" value={barcode} onChange={(event) => setBarcode(event.target.value)} /></form></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((product) => <button className="card text-left transition hover:border-brand-500" onClick={() => add(product)} key={product.id} disabled={!product.stock}><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><ShoppingCart size={20} /></div><p className="font-semibold">{product.name}</p><p className="text-xs text-slate-500">{product.sku} / {product.stock} available</p><p className="mt-3 text-sm font-bold text-brand-700">{money(product.price, settings?.currency)}</p></button>)}</div></section><aside className="space-y-4"><div className="card"><h2 className="mb-4 text-lg font-semibold">Current cart</h2><div className="mb-5 max-h-56 space-y-3 overflow-y-auto">{cart.map((line) => <div className="flex items-center justify-between gap-2" key={line.productId}><div className="min-w-0"><p className="truncate text-sm font-medium">{line.name}</p><p className="text-xs text-slate-500">{money(line.price, settings?.currency)}</p></div><div className="flex items-center gap-2"><button className="rounded-lg border p-1" onClick={() => quantity(line.productId, -1)}><Minus size={14} /></button><span className="w-5 text-center text-sm">{line.qty}</span><button className="rounded-lg border p-1" onClick={() => quantity(line.productId, 1)}><Plus size={14} /></button><button className="ml-1 text-red-500" onClick={() => setCart(cart.filter((row) => row.productId !== line.productId))}><Trash2 size={16} /></button></div></div>)}{!cart.length && <p className="py-5 text-center text-sm text-slate-500">Cart is empty.</p>}</div><div className="grid gap-3 sm:grid-cols-2"><PermissionGate permission="pos.discount"><FormInput label="Discount (%)" min="0" max="100" type="number" value={discountRate} onChange={(event) => setDiscountRate(event.target.value)} /></PermissionGate><Select label="Payment method" value={payment} onChange={(event) => setPayment(event.target.value)}><option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option></Select></div></div><ReceiptPreview company={{ ...activeCompany, currency: settings?.currency }} branch={activeBranch} items={cart} subtotal={subtotal} discount={discount} tax={tax} total={total} payment={payment} /><div className="flex gap-3"><button className="btn-secondary flex-1" onClick={() => window.print()}><Printer size={17} />Print</button><button className="btn-primary flex-1" onClick={save}>Complete sale</button></div></aside></div></>
}
