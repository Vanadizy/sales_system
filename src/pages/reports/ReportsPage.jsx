import { Download, Eye, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import ReceiptPreview from '../../components/ReceiptPreview'
import { Badge, DataTable, FormInput, Modal, PageHeader, PermissionGate, Tabs } from '../../components/UI'
import { exportInvoiceExcel, exportInvoicePdf, printInvoice } from '../../services/exportService'
import { dateTime, money } from '../../utils/format'

const reportTypes = ['Daily sales', 'Weekly sales', 'Monthly sales', 'Yearly sales', 'Inventory', 'Stock movement', 'Low stock', 'Customers', 'Suppliers', 'User activity']
const paidDate = (sale) => sale.paidAt || sale.date
const today = () => new Date().toISOString().slice(0, 10)

export default function ReportsPage() {
  const { scoped, activeCompany, activeBranch, data, appendLog } = useApp()
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
          { key: 'view', label: 'View', render: (row) => <button className="btn-secondary px-3 py-1.5" onClick={() => setInvoice(row)}><Eye size={14} />View</button> },
          { key: 'invoice', label: 'Invoice' },
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
  const invoicePdf = (row) => {
    exportInvoicePdf({ company: { ...activeCompany, currency }, branch: activeBranch, invoice: row })
    appendLog(`Invoice PDF exported: ${row.invoice}`, 'Reports')
  }
  const invoiceExcel = (row) => {
    exportInvoiceExcel({ company: activeCompany, branch: activeBranch, invoice: row })
    appendLog(`Invoice Excel exported: ${row.invoice}`, 'Reports')
  }
  const columns = selected.includes('sales')
    ? [...report.table, {
      key: 'downloads',
      label: 'Downloads',
      render: (row) => <div className="flex gap-2">
        <PermissionGate permission="reports.pdf"><button className="btn-secondary px-3 py-1.5" onClick={() => invoicePdf(row)}><FileText size={14} />PDF</button></PermissionGate>
        <PermissionGate permission="reports.excel"><button className="btn-secondary px-3 py-1.5" onClick={() => invoiceExcel(row)}><FileSpreadsheet size={14} />Excel</button></PermissionGate>
      </div>,
    }]
    : report.table

  return <>
    <PageHeader title="Reports" description={`Paid transaction reports scoped to ${activeCompany.name} / ${activeBranch.name}. Open an invoice to print or download it.`} />
    <div className="mb-5"><Tabs tabs={reportTypes} selected={selected} onChange={setSelected} /></div>
    {selected.includes('sales') && <div className="card mb-5 max-w-sm"><FormInput label={selected === 'Daily sales' ? 'Select sales day' : selected === 'Weekly sales' ? 'Week ending date' : selected === 'Monthly sales' ? 'Select a date in month' : 'Select a date in year'} type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div>}
    <section className="card">
      <div className="mb-5"><h2 className="font-semibold">{selected} report</h2><p className="text-sm text-slate-500">{report.records.length} paid or scoped records available{selected.includes('sales') ? ' / open an invoice to see each item sold' : ''}</p></div>
      <DataTable rows={report.records} columns={columns} showFirstOnMobile={selected.includes('sales')} mobileTitle={(row) => row.name || row.invoice || row.action} />
    </section>
    <Modal open={Boolean(invoice)} title={`Invoice details - ${invoice?.invoice || ''}`} onClose={() => setInvoice(null)} footer={<><PermissionGate permission="reports.excel"><button className="btn-secondary" onClick={() => invoiceExcel(invoice)}><FileSpreadsheet size={16} />Excel</button></PermissionGate><PermissionGate permission="reports.pdf"><button className="btn-secondary" onClick={() => printInvoice('reports-viewed-invoice')}><Printer size={16} />Print invoice</button><button className="btn-secondary" onClick={() => invoicePdf(invoice)}><Download size={16} />Download PDF</button></PermissionGate><button className="btn-primary" onClick={() => setInvoice(null)}>Close</button></>}>
      {invoice && <ReceiptPreview printId="reports-viewed-invoice" company={{ ...activeCompany, currency }} branch={activeBranch} invoice={invoice.invoice} status={invoice.status} date={paidDate(invoice)} customer={invoice.customer} customerPhone={invoice.customerPhone} items={invoice.items} subtotal={invoice.subtotal ?? invoice.items.reduce((sum, item) => sum + item.qty * item.price, 0)} discount={invoice.discount} tax={invoice.tax} total={invoice.total} payment={invoice.payment} receivedBy={invoice.receivedBy} paymentReference={invoice.paymentReference} />}
    </Modal>
  </>
}

function simple(records, columns) {
  return { columns: columns.map(([, label]) => label), records, table: columns.map(([key, label]) => ({ key, label })), exportRows: records.map((record) => Object.fromEntries(columns.map(([key, label]) => [label, record[key]]))) }
}
