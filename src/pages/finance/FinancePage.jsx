import { ArrowLeftCircle, Banknote, CheckCircle2, Clock3, Download, Eye, Printer } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ReceiptPreview from '../../components/ReceiptPreview'
import { Badge, DataTable, FormInput, Modal, PageHeader, PermissionGate, Select, StatCard, Tabs } from '../../components/UI'
import { exportInvoicePdf, printInvoice } from '../../services/exportService'
import { dateTime, money } from '../../utils/format'

const financeTabs = ['Awaiting payment', 'Confirmed', 'Returned']

export default function FinancePage() {
  const { scoped, activeCompany, activeBranch, account, data, confirmPayment, returnPaymentToPOS } = useApp()
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const invoices = scoped('sales')
  const pending = invoices.filter((invoice) => invoice.status === 'Awaiting Payment')
  const paid = invoices.filter((invoice) => invoice.status === 'Paid')
  const returned = invoices.filter((invoice) => ['Returned to POS', 'Replaced'].includes(invoice.status))
  const [tab, setTab] = useState('Awaiting payment')
  const [viewing, setViewing] = useState(null)
  const [receiving, setReceiving] = useState(null)
  const [returning, setReturning] = useState(null)
  const pendingTotal = pending.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)
  const paidTotal = paid.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)

  const beginReceive = (invoice) => setReceiving({
    invoice,
    payment: invoice.payment || 'Cash',
    receivedAmount: invoice.total,
    reference: '',
  })
  const receive = (event) => {
    event.preventDefault()
    if (confirmPayment(receiving.invoice.id, receiving)) {
      setReceiving(null)
      setTab('Confirmed')
    }
  }
  const sendBack = (event) => {
    event.preventDefault()
    if (returnPaymentToPOS(returning.invoice.id, returning.reason)) {
      setReturning(null)
      setTab('Returned')
    }
  }
  const downloadPdf = (invoice) => exportInvoicePdf({
    company: { ...activeCompany, currency },
    branch: activeBranch,
    invoice,
  })
  const preview = (invoice) => <ReceiptPreview
    printId="finance-viewed-invoice"
    company={{ ...activeCompany, currency }}
    branch={activeBranch}
    invoice={invoice.invoice}
    status={invoice.status}
    date={invoice.paidAt || invoice.date}
    customer={invoice.customer}
    customerPhone={invoice.customerPhone}
    items={invoice.items}
    subtotal={invoice.subtotal ?? Number(invoice.total) + Number(invoice.discount || 0) - Number(invoice.tax || 0)}
    discount={invoice.discount}
    tax={invoice.tax}
    total={invoice.total}
    payment={invoice.payment}
    receivedBy={invoice.receivedBy}
    paymentReference={invoice.paymentReference}
  />

  return <>
    <PageHeader title="Finance & payments" description={`Accountant payment confirmation for ${activeCompany.name} / ${activeBranch.name}. POS updates immediately when payments are confirmed or returned.`} />
    <div className="sticky top-16 z-20 -mx-2 mb-5 bg-slate-50 px-2 py-2 dark:bg-slate-950 lg:static lg:mx-0 lg:bg-transparent lg:p-0 dark:lg:bg-transparent">
      <Tabs tabs={financeTabs} selected={tab} onChange={setTab} />
    </div>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:hidden">
      <div className="card p-3"><p className="text-xs text-slate-500">Waiting</p><p className="mt-1 text-lg font-bold">{pending.length}</p><p className="truncate text-xs text-amber-700">{money(pendingTotal, currency)}</p></div>
      <div className="card p-3"><p className="text-xs text-slate-500">Confirmed</p><p className="mt-1 text-lg font-bold">{paid.length}</p><p className="truncate text-xs text-emerald-700">{money(paidTotal, currency)}</p></div>
    </div>
    <div className="mb-6 hidden gap-4 sm:grid sm:grid-cols-3">
      <StatCard label="Awaiting payment" value={pending.length} detail={money(pendingTotal, currency)} icon={Clock3} tone="amber" />
      <StatCard label="Confirmed payments" value={paid.length} detail={money(paidTotal, currency)} icon={CheckCircle2} tone="green" />
      <StatCard label="Received by" value={account.fullName} detail="Finance operator" icon={Banknote} />
    </div>

    {tab === 'Awaiting payment' && <section className="card">
      <h2 className="font-semibold">Payment queue</h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">Confirm money received to deduct stock, or return an unpaid invoice to POS for correction or cancellation.</p>
      <DataTable
        rows={pending}
        empty={{ title: 'No payments waiting', message: 'New POS invoices awaiting payment will appear here.' }}
        mobileTitle={(row) => row.invoice}
        columns={[
          { key: 'invoice', label: 'Invoice' },
          { key: 'date', label: 'Initiated', render: (row) => dateTime(row.date) },
          { key: 'customer', label: 'Customer' },
          { key: 'payment', label: 'Method' },
          { key: 'total', label: 'Amount due', render: (row) => <b>{money(row.total, currency)}</b> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant="warning">{row.status}</Badge> },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => <div className="flex flex-wrap gap-2">
              <button className="btn-secondary px-3 py-1.5" onClick={() => setViewing(row)}><Eye size={15} />Invoice</button>
              <PermissionGate permission="finance.receive"><button className="btn-primary px-3 py-1.5" onClick={() => beginReceive(row)}><Banknote size={15} />Receive</button></PermissionGate>
              <PermissionGate permission="finance.return"><button className="btn-secondary px-3 py-1.5 text-red-600" onClick={() => setReturning({ invoice: row, reason: '' })}><ArrowLeftCircle size={15} />Return to POS</button></PermissionGate>
            </div>,
          },
        ]}
      />
    </section>}

    {tab === 'Confirmed' && <section className="card">
      <h2 className="mb-5 font-semibold">Confirmed payments</h2>
      <DataTable
        rows={paid}
        empty={{ title: 'No confirmed payments', message: 'Payments appear here after confirmation.' }}
        mobileTitle={(row) => row.invoice}
        columns={[
          { key: 'invoice', label: 'Invoice' },
          { key: 'paidAt', label: 'Paid date', render: (row) => dateTime(row.paidAt || row.date) },
          { key: 'payment', label: 'Method' },
          { key: 'total', label: 'Amount', render: (row) => money(row.total, currency) },
          { key: 'receivedBy', label: 'Received by', render: (row) => row.receivedBy || '-' },
          { key: 'action', label: '', render: (row) => <button className="btn-secondary px-3 py-1.5" onClick={() => setViewing(row)}><Eye size={15} />Invoice</button> },
        ]}
      />
    </section>}

    {tab === 'Returned' && <section className="card">
      <h2 className="font-semibold">Returned to POS</h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">Returned invoices no longer reserve stock and remain available for audit tracking.</p>
      <DataTable
        rows={returned}
        empty={{ title: 'No returned invoices', message: 'Invoices sent back to POS will be recorded here.' }}
        mobileTitle={(row) => row.invoice}
        columns={[
          { key: 'invoice', label: 'Invoice' },
          { key: 'returnedAt', label: 'Returned', render: (row) => row.returnedAt ? dateTime(row.returnedAt) : '-' },
          { key: 'returnReason', label: 'Reason', render: (row) => row.returnReason || '-' },
          { key: 'status', label: 'Status', render: (row) => <Badge variant="neutral">{row.status}</Badge> },
          { key: 'action', label: '', render: (row) => <button className="btn-secondary px-3 py-1.5" onClick={() => setViewing(row)}><Eye size={15} />Invoice</button> },
        ]}
      />
    </section>}

    <Modal open={Boolean(viewing)} title={`Invoice ${viewing?.invoice || ''}`} onClose={() => setViewing(null)} footer={<><button className="btn-secondary" onClick={() => printInvoice('finance-viewed-invoice')}><Printer size={16} />Print invoice</button><button className="btn-secondary" onClick={() => downloadPdf(viewing)}><Download size={16} />Download PDF</button><button className="btn-primary" onClick={() => setViewing(null)}>Close</button></>}>
      {viewing && preview(viewing)}
    </Modal>
    <Modal open={Boolean(receiving)} title={`Receive payment - ${receiving?.invoice.invoice || ''}`} onClose={() => setReceiving(null)} footer={<><button className="btn-secondary" onClick={() => setReceiving(null)}>Cancel</button><button className="btn-primary" form="receive-payment-form"><CheckCircle2 size={16} />Confirm payment</button></>}>
      {receiving && <form id="receive-payment-form" className="space-y-4" onSubmit={receive}>
        <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-950">
          <p className="text-xs uppercase text-brand-700">Amount due</p>
          <p className="mt-1 text-2xl font-bold">{money(receiving.invoice.total, currency)}</p>
          <p className="mt-1 text-xs">Confirmation changes this invoice to paid and deducts the sold quantities from inventory.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Payment method" value={receiving.payment} onChange={(event) => setReceiving({ ...receiving, payment: event.target.value })}><option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option></Select>
          <FormInput label="Amount received" required min={receiving.invoice.total} type="number" value={receiving.receivedAmount} onChange={(event) => setReceiving({ ...receiving, receivedAmount: event.target.value })} />
          <FormInput className="sm:col-span-2" label="Payment reference (optional)" value={receiving.reference} onChange={(event) => setReceiving({ ...receiving, reference: event.target.value })} />
        </div>
      </form>}
    </Modal>
    <Modal open={Boolean(returning)} title={`Return to POS - ${returning?.invoice.invoice || ''}`} onClose={() => setReturning(null)} footer={<><button className="btn-secondary" onClick={() => setReturning(null)}>Cancel</button><button className="btn-primary bg-red-600 hover:bg-red-700" form="return-to-pos-form"><ArrowLeftCircle size={16} />Send back to POS</button></>}>
      {returning && <form id="return-to-pos-form" className="space-y-4" onSubmit={sendBack}>
        <p className="text-sm text-slate-600">Use this when payment was not received. The invoice will return to the POS queue and its reserved quantities become available again.</p>
        <FormInput as="textarea" rows="3" label="Reason for return" placeholder="Example: Customer did not complete payment" value={returning.reason} onChange={(event) => setReturning({ ...returning, reason: event.target.value })} />
      </form>}
    </Modal>
  </>
}
