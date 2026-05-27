import { dateTime, money } from '../utils/format'
import { Brand } from './UI'

const statusStyle = {
  Draft: 'bg-slate-100 text-slate-600',
  'Awaiting Payment': 'bg-amber-100 text-amber-800',
  Paid: 'bg-emerald-100 text-emerald-800',
}

export default function ReceiptPreview({
  company,
  branch,
  items = [],
  subtotal = 0,
  discount = 0,
  tax = 0,
  total = 0,
  payment,
  invoice = 'Draft invoice',
  status = 'Draft',
  date,
  customer = 'Walk-in Customer',
  receivedBy,
  paymentReference,
}) {
  return <div className="rounded-2xl border bg-white p-5 text-slate-900 dark:bg-slate-50">
    <div className="flex items-start justify-between gap-3 border-b pb-4">
      <div>
        <Brand company={company} compact />
        <p className="mt-3 text-base font-bold">{company?.name}</p>
        <p className="text-xs text-slate-500">{company?.address || ''}</p>
        <p className="text-xs text-slate-500">{branch?.name} {branch?.code ? `/ ${branch.code}` : ''}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold tracking-wide">INVOICE</p>
        <p className="text-sm font-semibold text-brand-700">{invoice}</p>
        {date && <p className="mt-1 text-xs text-slate-500">{dateTime(date)}</p>}
        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status] || statusStyle.Draft}`}>{status}</span>
      </div>
    </div>
    <div className="my-4 rounded-xl bg-slate-50 p-3 text-xs">
      <span className="text-slate-500">Billed to</span>
      <p className="mt-1 font-semibold">{customer}</p>
    </div>
    <div className="overflow-hidden rounded-xl border text-xs">
      <div className="grid grid-cols-[minmax(0,1fr)_42px_82px] gap-2 bg-slate-100 px-3 py-2 font-semibold text-slate-600">
        <span>Item</span><span className="text-center">Qty</span><span className="text-right">Amount</span>
      </div>
      {items.length ? items.map((item) => <div className="grid grid-cols-[minmax(0,1fr)_42px_82px] gap-2 border-t px-3 py-2" key={item.productId}>
        <div className="min-w-0"><p className="truncate font-medium">{item.name}</p><p className="text-slate-500">{money(item.price, company?.currency)} each</p></div>
        <span className="text-center">{item.qty}</span>
        <span className="text-right font-medium">{money(item.price * item.qty, company?.currency)}</span>
      </div>) : <p className="py-5 text-center text-xs text-slate-400">Products appear here before payment is initiated.</p>}
    </div>
    <div className="ml-auto mt-4 max-w-60 space-y-2 text-sm">
      <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{money(subtotal, company?.currency)}</span></div>
      {discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>- {money(discount, company?.currency)}</span></div>}
      {tax > 0 && <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{money(tax, company?.currency)}</span></div>}
      <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total due</span><span>{money(total, company?.currency)}</span></div>
    </div>
    <div className="mt-5 border-t pt-4 text-xs text-slate-500">
      <p>Payment method: <span className="font-medium text-slate-700">{payment || '-'}</span></p>
      {paymentReference && <p>Reference: <span className="font-medium text-slate-700">{paymentReference}</span></p>}
      {receivedBy && <p>Payment received by: <span className="font-medium text-slate-700">{receivedBy}</span></p>}
      <p className="mt-2 text-center">{company?.receiptFooter}</p>
    </div>
  </div>
}
