import { Download, Eye, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import ReceiptPreview from '../../components/ReceiptPreview'
import { Badge, DataTable, FormInput, Modal, PageHeader, PermissionGate, Tabs } from '../../components/UI'
import { exportExcel, exportPdf } from '../../services/exportService'
import { dateTime, money } from '../../utils/format'

const reportTypes = ['Daily sales', 'Weekly sales', 'Monthly sales', 'Yearly sales', 'Inventory', 'Stock movement', 'Low stock', 'Customers', 'Suppliers', 'User activity']
const paidDate = (sale) => sale.paidAt || sale.date
const today = () => new Date().toISOString().slice(0, 10)

export default function ReportsPage() {
  const { scoped, activeCompany, activeBranch, account, data, appendLog } = useApp()
  const [selected, setSelected] = useState('Daily sales')
  const [selectedDate, setSelectedDate] = useState(today())
  const [invoice, setInvoice] = useState(null)
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const report = useMemo(() => {
    const sales = scoped('sales').filter((row) => row.status === 'Paid')
    const products = scoped('products')
    if (selected.includes('sales')) {
      const period = selectedDate.slice(0, selected === 'Daily sales' ? 10 : selected === 'Monthly sales' ? 7 : 4)
      const records = selected === 'Daily sales'
        ? sales.filter((row) => paidDate(row)?.startsWith(period))
        : selected === 'Weekly sales'
          ? sales.filter((row) => new Date(paidDate(row)) >= new Date(new Date(selectedDate).getTime() - (6 * 86400000)) && new Date(paidDate(row)) <= new Date(`${selectedDate}T23:59:59`))
          : sales.filter((row) => paidDate(row)?.startsWith(period))
      return {
        columns: ['Invoice', 'Payment date', 'Customer', 'Payment', 'Status', 'Total'],
        records,
        table: [
          { key: 'invoice', label: 'Invoice', render: (row) => <button className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline" onClick={() => setInvoice(row)}>{row.invoice}<Eye size={14} /></button> },
          { key: 'date', label: 'Payment date', render: (row) => dateTime(paidDate(row)) },
          { key: 'customer', label: 'Customer' },
          { key: 'payment', label: 'Payment' },
          { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
          { key: 'total', label: 'Total', render: (row) => money(row.total, currency) },
        ],
        exportRows: records.map((row) => ({ Invoice: row.invoice, 'Payment date': dateTime(paidDate(row)), Customer: row.customer, Payment: row.payment, Status: row.status, Total: row.total })),
      }
    }
    if (selected === 'Inventory' || selected === 'Low stock') {
      const records = selected === 'Low stock' ? products.filter((row) => row.stock <= row.reorder) : products
      return { columns: ['Product', 'Product code', 'Category', 'Stock', 'Reorder'], records, table: [{ key: 'name', label: 'Product' }, { key: 'sku', label: 'Product code' }, { key: 'category', label: 'Category' }, { key: 'stock', label: 'Stock', render: (row) => <Badge variant={row.stock <= row.reorder ? 'warning' : 'success'}>{row.stock}</Badge> }, { key: 'reorder', label: 'Reorder' }], exportRows: records.map((row) => ({ Product: row.name, 'Product code': row.sku, Category: row.category, Stock: row.stock, Reorder: row.reorder })) }
    }
    if (selected === 'Stock movement') return simple(scoped('inventory'), [['date', 'Date'], ['product', 'Product'], ['type', 'Movement'], ['quantity', 'Quantity'], ['supplier', 'Supplier'], ['cost', 'Cost']])
    if (selected === 'Customers') return simple(scoped('customers'), [['name', 'Customer'], ['phone', 'Phone'], ['email', 'Email'], ['spent', 'Total spent']])
    if (selected === 'Suppliers') return simple(scoped('suppliers'), [['name', 'Supplier'], ['phone', 'Phone'], ['category', 'Category'], ['orders', 'Orders']])
    return simple(scoped('logs'), [['date', 'Date'], ['user', 'User'], ['action', 'Action'], ['module', 'Module'], ['status', 'Status']])
  }, [selected, selectedDate, currency, scoped])
  const pdf = () => { exportPdf({ company: activeCompany, branch: activeBranch, account, title: selected, columns: report.columns, rows: report.exportRows.map((row) => Object.values(row)) }); appendLog('Report exported to PDF', 'Reports') }
  const excel = () => { exportExcel({ title: selected, rows: report.exportRows, company: activeCompany, branch: activeBranch }); appendLog('Report exported to Excel', 'Reports') }

  return <>
    <PageHeader title="Reports" description={`Paid transaction reports scoped to ${activeCompany.name} / ${activeBranch.name}.`} action={<div className="flex gap-2"><PermissionGate permission="reports.pdf"><button className="btn-secondary" onClick={pdf}><FileText size={17} />PDF</button></PermissionGate><PermissionGate permission="reports.excel"><button className="btn-primary" onClick={excel}><FileSpreadsheet size={17} />Excel</button></PermissionGate></div>} />
    <div className="mb-5"><Tabs tabs={reportTypes} selected={selected} onChange={setSelected} /></div>
    {selected.includes('sales') && <div className="card mb-5 max-w-sm"><FormInput label={selected === 'Daily sales' ? 'Select sales day' : selected === 'Weekly sales' ? 'Week ending date' : selected === 'Monthly sales' ? 'Select a date in month' : 'Select a date in year'} type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>}
    <section className="card">
      <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">{selected} report</h2><p className="text-sm text-slate-500">{report.records.length} paid or scoped records available{selected.includes('sales') ? ' / click an invoice to see each item sold' : ''}</p></div><Download className="text-slate-400" /></div>
      <DataTable rows={report.records} columns={report.table} mobileTitle={(row) => row.name || row.invoice || row.action} />
    </section>
    <Modal open={Boolean(invoice)} title={`Invoice details - ${invoice?.invoice || ''}`} onClose={() => setInvoice(null)} footer={<><button className="btn-secondary" onClick={() => window.print()}><Printer size={16} />Print invoice</button><button className="btn-primary" onClick={() => setInvoice(null)}>Close</button></>}>
      {invoice && <ReceiptPreview company={{ ...activeCompany, currency }} branch={activeBranch} invoice={invoice.invoice} status={invoice.status} date={paidDate(invoice)} customer={invoice.customer} items={invoice.items} subtotal={invoice.subtotal ?? invoice.items.reduce((sum, item) => sum + item.qty * item.price, 0)} discount={invoice.discount} tax={invoice.tax} total={invoice.total} payment={invoice.payment} receivedBy={invoice.receivedBy} paymentReference={invoice.paymentReference} />}
    </Modal>
  </>
}

function simple(records, columns) {
  return { columns: columns.map(([, label]) => label), records, table: columns.map(([key, label]) => ({ key, label })), exportRows: records.map((record) => Object.fromEntries(columns.map(([key, label]) => [label, record[key]]))) }
}
