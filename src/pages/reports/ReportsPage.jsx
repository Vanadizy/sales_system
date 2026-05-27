import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Badge, DataTable, PageHeader, PermissionGate, Tabs } from '../../components/UI'
import { exportExcel, exportPdf } from '../../services/exportService'
import { dateTime, money } from '../../utils/format'

const reportTypes = ['Daily sales', 'Weekly sales', 'Monthly sales', 'Yearly sales', 'Inventory', 'Stock movement', 'Low stock', 'Customers', 'Suppliers', 'User activity']

export default function ReportsPage() {
  const { scoped, activeCompany, activeBranch, account, data, appendLog } = useApp()
  const [selected, setSelected] = useState('Daily sales')
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const report = useMemo(() => {
    const sales = scoped('sales'), products = scoped('products')
    if (selected.includes('sales')) {
      const records = selected === 'Daily sales' ? sales.filter((row) => row.date.startsWith('2026-05-27')) : selected === 'Weekly sales' ? sales.filter((row) => row.date >= '2026-05-21') : selected === 'Monthly sales' ? sales.filter((row) => row.date.startsWith('2026-05')) : sales.filter((row) => row.date.startsWith('2026'))
      return { columns: ['Invoice', 'Date', 'Customer', 'Payment', 'Total'], records, table: [{ key: 'invoice', label: 'Invoice' }, { key: 'date', label: 'Date', render: (r) => dateTime(r.date) }, { key: 'customer', label: 'Customer' }, { key: 'payment', label: 'Payment' }, { key: 'total', label: 'Total', render: (r) => money(r.total, currency) }], exportRows: records.map((r) => ({ Invoice: r.invoice, Date: dateTime(r.date), Customer: r.customer, Payment: r.payment, Total: r.total })) }
    }
    if (selected === 'Inventory' || selected === 'Low stock') {
      const records = selected === 'Low stock' ? products.filter((r) => r.stock <= r.reorder) : products
      return { columns: ['Product', 'Product code', 'Category', 'Stock', 'Reorder'], records, table: [{ key: 'name', label: 'Product' }, { key: 'sku', label: 'Product code' }, { key: 'category', label: 'Category' }, { key: 'stock', label: 'Stock', render: (r) => <Badge variant={r.stock <= r.reorder ? 'warning' : 'success'}>{r.stock}</Badge> }, { key: 'reorder', label: 'Reorder' }], exportRows: records.map((r) => ({ Product: r.name, 'Product code': r.sku, Category: r.category, Stock: r.stock, Reorder: r.reorder })) }
    }
    if (selected === 'Stock movement') return simple(scoped('inventory'), [['date', 'Date'], ['product', 'Product'], ['type', 'Movement'], ['quantity', 'Quantity'], ['supplier', 'Supplier'], ['cost', 'Cost']])
    if (selected === 'Customers') return simple(scoped('customers'), [['name', 'Customer'], ['phone', 'Phone'], ['email', 'Email'], ['spent', 'Total spent']])
    if (selected === 'Suppliers') return simple(scoped('suppliers'), [['name', 'Supplier'], ['phone', 'Phone'], ['category', 'Category'], ['orders', 'Orders']])
    return simple(scoped('logs'), [['date', 'Date'], ['user', 'User'], ['action', 'Action'], ['module', 'Module'], ['status', 'Status']])
  }, [selected, currency, scoped])
  const pdf = () => { exportPdf({ company: activeCompany, branch: activeBranch, account, title: selected, columns: report.columns, rows: report.exportRows.map((row) => Object.values(row)) }); appendLog('Report exported to PDF', 'Reports') }
  const excel = () => { exportExcel({ title: selected, rows: report.exportRows, company: activeCompany, branch: activeBranch }); appendLog('Report exported to Excel', 'Reports') }
  return <><PageHeader title="Reports" description={`Professional reports scoped to ${activeCompany.name} / ${activeBranch.name}.`} action={<div className="flex gap-2"><PermissionGate permission="reports.pdf"><button className="btn-secondary" onClick={pdf}><FileText size={17} />PDF</button></PermissionGate><PermissionGate permission="reports.excel"><button className="btn-primary" onClick={excel}><FileSpreadsheet size={17} />Excel</button></PermissionGate></div>} /><div className="mb-5"><Tabs tabs={reportTypes} selected={selected} onChange={setSelected} /></div><section className="card"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">{selected} report</h2><p className="text-sm text-slate-500">{report.records.length} scoped records available</p></div><Download className="text-slate-400" /></div><DataTable rows={report.records} columns={report.table} mobileTitle={(row) => row.name || row.invoice || row.action} /></section></>
}

function simple(records, columns) {
  return { columns: columns.map(([, label]) => label), records, table: columns.map(([key, label]) => ({ key, label })), exportRows: records.map((record) => Object.fromEntries(columns.map(([key, label]) => [label, record[key]]))) }
}
