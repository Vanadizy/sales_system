import { Banknote, CheckCircle2, Clock3, Eye, Printer } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ReceiptPreview from '../../components/ReceiptPreview'
import { Badge, DataTable, FormInput, Modal, PageHeader, PermissionGate, Select, StatCard } from '../../components/UI'
import { dateTime, money } from '../../utils/format'

export default function FinancePage() {
  const { scoped, activeCompany, activeBranch, account, data, confirmPayment } = useApp()
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const invoices = scoped('sales')
  const pending = invoices.filter((invoice) => invoice.status === 'Awaiting Payment')
  const paid = invoices.filter((invoice) => invoice.status === 'Paid')
  const [viewing, setViewing] = useState(null)
  const [receiving, setReceiving] = useState(null)
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
    if (confirmPayment(receiving.invoice.id, receiving)) setReceiving(null)
  }
  const preview = (invoice) => <ReceiptPreview
    company={{ ...activeCompany, currency }}
    branch={activeBranch}
    invoice={invoice.invoice}
    status={invoice.status}
    date={invoice.paidAt || invoice.date}
    customer={invoice.customer}
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
    <PageHeader title="Finance & payments" description={`Accountant payment confirmation for ${activeCompany.name} / ${activeBranch.name}. Stock is deducted only after payment confirmation.`} />
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <StatCard label="Awaiting payment" value={pending.length} detail={money(pendingTotal, currency)} icon={Clock3} tone="amber" />
      <StatCard label="Confirmed payments" value={paid.length} detail={money(paidTotal, currency)} icon={CheckCircle2} tone="green" />
      <StatCard label="Received by" value={account.fullName} detail="Finance operator" icon={Banknote} />
    </div>
    <section className="card">
      <h2 className="font-semibold">Payment queue</h2>
      <p className="mb-5 mt-1 text-sm text-slate-500">Invoices initiated at Point of Sale wait here until the customer payment is received and confirmed.</p>
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
          { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => setViewing(row)}><Eye size={15} />Invoice</button><PermissionGate permission="finance.receive"><button className="btn-primary px-3 py-1.5" onClick={() => beginReceive(row)}><Banknote size={15} />Receive</button></PermissionGate></div> },
        ]}
      />
    </section>
    <section className="card mt-6">
      <h2 className="mb-5 font-semibold">Recently confirmed payments</h2>
      <DataTable
        rows={paid.slice(0, 10)}
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
    </section>
    <Modal open={Boolean(viewing)} title={`Invoice ${viewing?.invoice || ''}`} onClose={() => setViewing(null)} footer={<><button className="btn-secondary" onClick={() => window.print()}><Printer size={16} />Print invoice</button><button className="btn-primary" onClick={() => setViewing(null)}>Close</button></>}>
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
  </>
}
