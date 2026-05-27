import { Download, Eye, History, Minus, Plus, Printer, RotateCcw, ScanBarcode, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import ReceiptPreview from '../../components/ReceiptPreview'
import { Badge, DataTable, FormInput, Modal, PageHeader, PermissionGate, Select, Tabs } from '../../components/UI'
import { exportInvoicePdf, printInvoice } from '../../services/exportService'
import { dateTime, money } from '../../utils/format'

const posTabs = ['Sell', 'Payments', 'Returned', 'Sales history']
const statusVariant = (status) => status === 'Paid' ? 'success' : status === 'Awaiting Payment' ? 'warning' : 'neutral'

export default function POSPage() {
  const { scoped, activeCompany, activeBranch, data, availableForSale, initiatePayment, notify } = useApp()
  const products = scoped('products')
  const invoices = scoped('sales')
  const settings = data.settings.find((row) => row.companyId === activeCompany.id)
  const currency = settings?.currency
  const pending = invoices.filter((invoice) => invoice.status === 'Awaiting Payment')
  const returned = invoices.filter((invoice) => invoice.status === 'Returned to POS')
  const paid = invoices.filter((invoice) => invoice.status === 'Paid')
  const payments = invoices.filter((invoice) => ['Awaiting Payment', 'Paid'].includes(invoice.status))
  const [tab, setTab] = useState('Sell')
  const [query, setQuery] = useState('')
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState([])
  const [discountRate, setDiscountRate] = useState(0)
  const [payment, setPayment] = useState('Cash')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentPreview, setPaymentPreview] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [invoiceQuery, setInvoiceQuery] = useState('')
  const [returnedSource, setReturnedSource] = useState(null)

  const visible = products
    .map((product) => ({ ...product, available: availableForSale(product.id) }))
    .filter((row) => `${row.name} ${row.sku}`.toLowerCase().includes(query.toLowerCase()))
  const searchedInvoices = invoices.filter((invoice) =>
    `${invoice.invoice} ${invoice.customer || ''} ${invoice.customerPhone || ''} ${invoice.status}`.toLowerCase().includes(invoiceQuery.toLowerCase()))
  const paymentRows = invoiceQuery.trim() ? searchedInvoices : payments
  const soldLines = paid.flatMap((sale) => sale.items.map((item) => ({
    id: `${sale.id}-${item.productId}`,
    invoice: sale.invoice,
    paidAt: sale.paidAt || sale.date,
    name: item.name,
    qty: item.qty,
    lineTotal: item.price * item.qty,
    remaining: products.find((product) => product.id === item.productId)?.stock ?? '-',
  })))
  const pendingTotal = pending.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)

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

  const preparePayment = () => {
    if (!cart.length) return notify('Add products before initiating a payment.', 'warning')
    setPaymentPreview({
      customer: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      subtotal,
      total,
      payment,
      discount,
      tax,
      returnedSaleId: returnedSource?.id,
      items: cart.map((item) => ({ productId: item.productId, name: item.name, price: item.price, qty: item.qty })),
    })
  }
  const confirmInitiation = () => {
    const invoice = initiatePayment(paymentPreview)
    if (!invoice) return
    setPaymentPreview(null)
    setCart([])
    setDiscountRate(0)
    setCustomerName('')
    setCustomerPhone('')
    setReturnedSource(null)
    setTab('Payments')
  }
  const loadReturnedInvoice = (invoice) => {
    const lines = invoice.items.map((item) => ({ ...item, available: availableForSale(item.productId) }))
    const unavailable = lines.find((item) => Number(item.qty) > Number(item.available))
    if (unavailable) return notify(`Available stock is insufficient to reload ${unavailable.name}.`, 'warning')
    setCart(lines)
    setDiscountRate(invoice.subtotal ? (Number(invoice.discount || 0) * 100) / Number(invoice.subtotal) : 0)
    setPayment(invoice.payment || 'Cash')
    setCustomerName(invoice.customer === 'Walk-in Customer' ? '' : invoice.customer || '')
    setCustomerPhone(invoice.customerPhone || '')
    setReturnedSource(invoice)
    setTab('Sell')
    notify(`${invoice.invoice} loaded into the cart for correction and new payment initiation.`)
  }
  const invoicePdf = (invoice) => exportInvoicePdf({
    company: { ...activeCompany, currency },
    branch: activeBranch,
    invoice,
  })
  const preview = (invoice, printId) => <ReceiptPreview
    printId={printId}
    company={{ ...activeCompany, currency }}
    branch={activeBranch}
    invoice={invoice.invoice}
    status={invoice.status}
    date={invoice.paidAt || invoice.date}
    customer={invoice.customer}
    customerPhone={invoice.customerPhone}
    items={invoice.items}
    subtotal={invoice.subtotal}
    discount={invoice.discount}
    tax={invoice.tax}
    total={invoice.total}
    payment={invoice.payment}
    receivedBy={invoice.receivedBy}
    paymentReference={invoice.paymentReference}
  />

  return <>
    <PageHeader title="Point of Sale" description={`${activeBranch.name} counter / initiate invoices and monitor Finance confirmation`} />
    <div className="sticky top-16 z-20 -mx-2 mb-5 bg-slate-50 px-2 py-2 dark:bg-slate-950 lg:static lg:mx-0 lg:bg-transparent lg:p-0 dark:lg:bg-transparent">
      <Tabs tabs={posTabs} selected={tab} onChange={setTab} />
    </div>

    {tab === 'Sell' && <>
      <div className="mb-4 flex gap-2 xl:hidden">
        <a className="btn-secondary flex-1" href="#pos-cart"><ShoppingCart size={16} />Cart ({cart.reduce((sum, row) => sum + row.qty, 0)})</a>
        <a className="btn-secondary flex-1" href="#pos-products"><Search size={16} />Products</a>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section id="pos-products" className="order-2 min-w-0 scroll-mt-32 xl:order-1">
          <div className="card mb-5 grid gap-3 sm:grid-cols-2">
            <label className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" placeholder="Search products or product code" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <form className="relative" onSubmit={scan}><ScanBarcode className="absolute left-3 top-3 text-slate-400" size={18} /><input className="input pl-10" placeholder="Scan barcode if available" value={barcode} onChange={(event) => setBarcode(event.target.value)} /></form>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => <button className="card text-left transition hover:border-brand-500 disabled:opacity-60" onClick={() => add(product)} key={product.id} disabled={!product.available}>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><ShoppingCart size={20} /></div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-slate-500">{product.sku} / {product.available} available{product.stock !== product.available ? ' after pending invoices' : ''}</p>
              <p className="mt-3 text-sm font-bold text-brand-700">{money(product.price, currency)}</p>
            </button>)}
          </div>
        </section>
        <aside id="pos-cart" className="order-1 scroll-mt-32 space-y-4 xl:order-2 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <div className="card">
            <h2 className="text-lg font-semibold">{returnedSource ? `Rework ${returnedSource.invoice}` : 'Current cart'}</h2>
            {returnedSource && <p className="mb-4 mt-1 text-xs text-red-600">{returnedSource.returnReason || 'Payment was not received.'}</p>}
            {!returnedSource && <div className="mb-4" />}
            <div className="mb-5 max-h-64 space-y-3 overflow-y-auto">
              {cart.map((line) => <div className="flex items-center justify-between gap-2" key={line.productId}>
                <div className="min-w-0"><p className="truncate text-sm font-medium">{line.name}</p><p className="text-xs text-slate-500">{money(line.price, currency)}</p></div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border p-1" onClick={() => quantity(line.productId, -1)}><Minus size={14} /></button>
                  <span className="w-5 text-center text-sm">{line.qty}</span>
                  <button className="rounded-lg border p-1" onClick={() => quantity(line.productId, 1)}><Plus size={14} /></button>
                  <button className="ml-1 text-red-500" onClick={() => setCart(cart.filter((row) => row.productId !== line.productId))}><Trash2 size={16} /></button>
                </div>
              </div>)}
              {!cart.length && <p className="py-5 text-center text-sm text-slate-500">Cart is empty.</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormInput label="Customer name (optional)" placeholder="Walk-in customer if blank" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
              <FormInput label="Customer phone (optional)" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
              <PermissionGate permission="pos.discount"><FormInput label="Discount (%)" min="0" max="100" type="number" value={discountRate} onChange={(event) => setDiscountRate(event.target.value)} /></PermissionGate>
              <Select label="Requested payment method" value={payment} onChange={(event) => setPayment(event.target.value)}><option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option></Select>
            </div>
            <div className="mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(subtotal, currency)}</span></div>
              {discount > 0 && <div className="flex justify-between text-slate-500"><span>Discount</span><span>- {money(discount, currency)}</span></div>}
              {tax > 0 && <div className="flex justify-between text-slate-500"><span>Tax</span><span>{money(tax, currency)}</span></div>}
              <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{money(total, currency)}</span></div>
            </div>
            <button className="btn-primary mt-5 w-full" onClick={preparePayment}>Initiate payment</button>
          </div>
        </aside>
      </div>
    </>}

    {tab === 'Payments' && <>
      <section className="card">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><h2 className="font-semibold">Payment tracking</h2><p className="mt-1 text-sm text-slate-500">{pending.length} awaiting Finance / {money(pendingTotal, currency)} reserved / {paid.length} paid. Search to find any returned invoice.</p></div>
          <FormInput className="w-full md:max-w-xs" label="Find invoice" placeholder="Invoice number, customer or status" value={invoiceQuery} onChange={(event) => setInvoiceQuery(event.target.value)} />
        </div>
        <DataTable
          rows={paymentRows.slice(0, 20)}
          empty={{ title: invoiceQuery ? 'Invoice not found' : 'No payment invoices', message: invoiceQuery ? 'Try another invoice number or status.' : 'Initiated and paid invoices appear here immediately.' }}
          mobileTitle={(row) => row.invoice}
          columns={[
            { key: 'invoice', label: 'Invoice' },
            { key: 'date', label: 'Initiated', render: (row) => dateTime(row.date) },
            { key: 'customer', label: 'Customer', render: (row) => <div><p>{row.customer || 'Walk-in Customer'}</p>{row.customerPhone && <p className="text-xs text-slate-500">{row.customerPhone}</p>}</div> },
            { key: 'total', label: 'Total', render: (row) => money(row.total, currency) },
            { key: 'status', label: 'Payment status', render: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> },
            { key: 'actions', label: '', render: (row) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => setViewing(row)}><Eye size={15} />View</button><button className="btn-secondary px-3 py-1.5" onClick={() => invoicePdf(row)}><Download size={15} />PDF</button></div> },
          ]}
        />
      </section>
    </>}

    {tab === 'Returned' && <section className="card">
      <h2 className="font-semibold">Returned from Finance</h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">Correct unpaid invoices returned by the accountant. Reloading creates a traceable replacement invoice.</p>
      <DataTable
        rows={returned}
        empty={{ title: 'No invoices returned', message: 'Unpaid invoices returned from Finance appear here immediately.' }}
        mobileTitle={(row) => row.invoice}
        columns={[
          { key: 'invoice', label: 'Invoice' },
          { key: 'returnedAt', label: 'Returned', render: (row) => dateTime(row.returnedAt) },
          { key: 'returnReason', label: 'Reason' },
          { key: 'total', label: 'Total', render: (row) => money(row.total, currency) },
          { key: 'actions', label: '', render: (row) => <button className="btn-primary px-3 py-1.5" onClick={() => loadReturnedInvoice(row)}><RotateCcw size={15} />Load to cart</button> },
        ]}
      />
    </section>}

    {tab === 'Sales history' && <section className="card">
      <div className="mb-5 flex items-center gap-2"><History className="text-brand-600" size={19} /><div><h2 className="font-semibold">Sold product and remaining stock history</h2><p className="text-sm text-slate-500">Only paid sales are included. Remaining stock reflects the current product balance.</p></div></div>
      <DataTable
        rows={soldLines.slice(0, 20)}
        mobileTitle={(row) => row.name}
        columns={[
          { key: 'invoice', label: 'Invoice' },
          { key: 'paidAt', label: 'Paid date', render: (row) => dateTime(row.paidAt) },
          { key: 'name', label: 'Product' },
          { key: 'qty', label: 'Quantity sold' },
          { key: 'remaining', label: 'Remaining stock' },
          { key: 'lineTotal', label: 'Line total', render: (row) => money(row.lineTotal, currency) },
        ]}
      />
    </section>}

    <Modal open={Boolean(paymentPreview)} title="Confirm invoice before sending to Finance" onClose={() => setPaymentPreview(null)} footer={<><button className="btn-secondary" onClick={() => setPaymentPreview(null)}>Cancel</button><button className="btn-primary" onClick={confirmInitiation}>Confirm and initiate payment</button></>}>
      {paymentPreview && <ReceiptPreview company={{ ...activeCompany, currency }} branch={activeBranch} invoice="Pending confirmation" status="Draft" date={new Date().toISOString()} customer={paymentPreview.customer} customerPhone={paymentPreview.customerPhone} items={paymentPreview.items} subtotal={paymentPreview.subtotal} discount={paymentPreview.discount} tax={paymentPreview.tax} total={paymentPreview.total} payment={paymentPreview.payment} />}
    </Modal>
    <Modal open={Boolean(viewing)} title={`Invoice ${viewing?.invoice || ''}`} onClose={() => setViewing(null)} footer={<><button className="btn-secondary" onClick={() => printInvoice('pos-viewed-invoice')}><Printer size={16} />Print invoice</button><button className="btn-secondary" onClick={() => invoicePdf(viewing)}><Download size={16} />Download PDF</button><button className="btn-primary" onClick={() => setViewing(null)}>Close</button></>}>
      {viewing && preview(viewing, 'pos-viewed-invoice')}
    </Modal>
  </>
}
