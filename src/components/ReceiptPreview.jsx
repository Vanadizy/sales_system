import { dateTime, money } from '../utils/format'
import { Brand } from './UI'

const statusStyle = {
  Draft: 'bg-slate-100 text-slate-600',
  'Awaiting Payment': 'bg-amber-100 text-amber-800',
  Paid: 'bg-emerald-100 text-emerald-800',
  'Returned to POS': 'bg-red-100 text-red-700',
  Replaced: 'bg-slate-100 text-slate-600',
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
  customerPhone,
  receivedBy,
  paymentReference,
  printId,
}) {
  return <div id={printId} className="invoice-document rounded-2xl border bg-white p-5 text-slate-900 dark:bg-slate-50">
    <p className="mb-6 text-center text-xl font-bold tracking-wide">INVOICE</p>
    <div className="flex items-start justify-between gap-5">
      <div className="max-w-[48%]">
        <Brand company={company} compact />
        <p className="mt-3 text-base font-bold uppercase leading-tight">{company?.name}</p>
        <p className="mt-2 text-xs text-slate-500"><b>Address:</b> {company?.address || '-'}</p>
        <p className="text-xs text-slate-500">{company?.phone || ''}</p>
      </div>
      <div className="max-w-[50%] text-right text-xs">
        <p><b>Client:</b> {customer}</p>
        {customerPhone && <p className="mt-1"><b>Phone:</b> {customerPhone}</p>}
        <p className="mt-2"><b>Branch:</b> {branch?.name} {branch?.code ? `/ ${branch.code}` : ''}</p>
      </div>
    </div>
    <div className="mb-5 mt-5 h-0.5 bg-brand-500" />
    <div className="mb-5 flex items-start justify-between gap-3">
      <p className="text-xl font-bold text-slate-400">INVOICE</p>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-500">#{invoice}</p>
        {date && <p className="text-xs text-slate-400">Date: {dateTime(date)}</p>}
        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status] || statusStyle.Draft}`}>{status}</span>
      </div>
    </div>
    <div className="overflow-x-auto text-xs">
      <div className="grid min-w-[365px] grid-cols-[minmax(0,1fr)_38px_86px_94px] gap-2 border-y-2 border-brand-400 px-2 py-2.5 font-semibold text-slate-700">
        <span>DESCRIPTION</span><span className="text-center">QTY</span><span className="text-right">PRICE</span><span className="text-right">TOTAL</span>
      </div>
      {items.length ? items.map((item, index) => <div className="grid min-w-[365px] grid-cols-[minmax(0,1fr)_38px_86px_94px] gap-2 border-b px-2 py-3" key={`${item.productId}-${index}`}>
        <p className="truncate font-medium">#{String(index + 1).padStart(2, '0')} {item.name}</p>
        <span className="text-center">{item.qty}</span>
        <span className="text-right">{money(item.price, company?.currency)}</span>
        <span className="text-right font-medium">{money(item.price * item.qty, company?.currency)}</span>
      </div>) : <p className="py-5 text-center text-xs text-slate-400">Products appear here before payment is initiated.</p>}
    </div>
    <div className="ml-auto mt-4 max-w-60 space-y-2 text-sm">
      <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{money(subtotal, company?.currency)}</span></div>
      {discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span>- {money(discount, company?.currency)}</span></div>}
      {tax > 0 && <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{money(tax, company?.currency)}</span></div>}
      <div className="flex justify-between border-t-2 border-slate-700 pt-2 text-base font-bold"><span>TOTAL</span><span>{money(total, company?.currency)}</span></div>
    </div>
    <div className="mt-7 border-t border-slate-700 pt-4 text-xs text-slate-500">
      <p>Payment method: <span className="font-medium text-slate-700">{payment || '-'}</span></p>
      {paymentReference && <p>Reference: <span className="font-medium text-slate-700">{paymentReference}</span></p>}
      {receivedBy && <p>Payment received by: <span className="font-medium text-slate-700">{receivedBy}</span></p>}
      <p className="mt-3 text-center">{company?.receiptFooter || `Thank you for choosing ${company?.name}.`}</p>
      <p className="mt-2 text-center font-bold text-slate-800">{company?.name?.toUpperCase()}</p>
    </div>
  </div>
}
