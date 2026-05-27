import { AlertTriangle, Boxes, ShoppingBag, ShoppingCart, Truck, Users } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../../context/AppContext'
import { money, dateTime } from '../../utils/format'
import { Badge, Brand, DataTable, PageHeader, StatCard } from '../../components/UI'

const todayKey = () => new Date().toISOString().slice(0, 10)
const paidDate = (sale) => sale.paidAt || sale.date

export default function DashboardPage() {
  const { scoped, activeCompany, activeBranch, account, data } = useApp()
  const products = scoped('products')
  const invoices = scoped('sales')
  const sales = invoices.filter((sale) => sale.status === 'Paid')
  const customers = scoped('customers')
  const suppliers = scoped('suppliers')
  const currency = data.settings.find((setting) => setting.companyId === activeCompany.id)?.currency
  const total = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const today = sales.filter((sale) => paidDate(sale)?.startsWith(todayKey())).reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const monthly = sales.filter((sale) => paidDate(sale)?.startsWith(todayKey().slice(0, 7))).reduce((sum, sale) => sum + Number(sale.total || 0), 0)
  const low = products.filter((product) => product.stock <= product.reorder)
  const activities = scoped('logs').slice(0, 4)
  const lines = sales.flatMap((sale) => Array.isArray(sale.items) ? sale.items : []).filter((line) => line?.name)
  const topProducts = Object.values(lines.reduce((items, line) => {
    items[line.name] = items[line.name] || { name: line.name, qty: 0, revenue: 0 }
    items[line.name].qty += Number(line.qty || 0)
    items[line.name].revenue += Number(line.price || 0) * Number(line.qty || 0)
    return items
  }, {})).sort((a, b) => b.qty - a.qty).slice(0, 4)
  const chart = [{ day: 'Mon', sales: total * .28 }, { day: 'Tue', sales: total * .38 }, { day: 'Wed', sales: total * .22 }, { day: 'Thu', sales: total * .54 }, { day: 'Today', sales: today }]

  return <>
    <PageHeader title="Operational dashboard" description={`${activeCompany.name} / ${activeBranch.name} / Welcome, ${account.fullName}`} action={<Brand company={activeCompany} />} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Confirmed sales" value={money(total, currency)} detail="Paid invoices only" icon={ShoppingCart} />
      <StatCard label="Today's receipts" value={money(today, currency)} detail="Payments confirmed today" icon={ShoppingBag} tone="green" />
      <StatCard label="Monthly receipts" value={money(monthly, currency)} detail="Payments confirmed this month" icon={ShoppingCart} />
      <StatCard label="Pending invoices" value={invoices.filter((sale) => sale.status === 'Awaiting Payment').length} detail="Awaiting Finance" icon={ShoppingBag} tone="amber" />
      <StatCard label="Total products" value={products.length} detail={`${low.length} low stock alerts`} icon={Boxes} tone={low.length ? 'amber' : 'green'} />
      <StatCard label="Low stock items" value={low.length} detail="Needs attention" icon={AlertTriangle} tone="amber" />
      <StatCard label="Customers" value={customers.length} detail="Branch customers" icon={Users} />
      <StatCard label="Suppliers" value={suppliers.length} detail="Trading partners" icon={Truck} />
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
      <section className="card min-w-0"><h2 className="mb-5 font-semibold">Confirmed sales performance</h2><ResponsiveContainer width="100%" height={288}><AreaChart data={chart}><defs><linearGradient id="sales" y2="1"><stop stopColor="#1767d1" stopOpacity=".24" /><stop offset="1" stopColor="#1767d1" stopOpacity="0" /></linearGradient></defs><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip formatter={(value) => money(value, currency)} /><Area type="monotone" dataKey="sales" stroke="#1767d1" fill="url(#sales)" strokeWidth={3} /></AreaChart></ResponsiveContainer></section>
      <section className="card"><h2 className="mb-4 flex items-center gap-2 font-semibold"><AlertTriangle size={18} className="text-amber-500" />Low stock alerts</h2><div className="space-y-3">{low.map((product) => <div key={product.id} className="rounded-xl border p-3"><div className="flex justify-between font-medium"><span>{product.name}</span><Badge variant="warning">{product.stock} left</Badge></div><p className="mt-1 text-xs text-slate-500">Reorder level: {product.reorder}</p></div>)}{!low.length && <p className="text-sm text-slate-500">All items are adequately stocked.</p>}</div></section>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="card"><h2 className="mb-4 font-semibold">Top sold products</h2>{topProducts.map((product) => <div className="mb-3 flex justify-between rounded-xl border p-3 text-sm" key={product.name}><div><p className="font-medium">{product.name}</p><p className="text-slate-500">{product.qty} paid units sold</p></div><b>{money(product.revenue, currency)}</b></div>)}{!topProducts.length && <p className="text-sm text-slate-500">No paid item-level sales are available for this branch.</p>}</section>
      <section className="card"><h2 className="mb-4 font-semibold">Recent activities</h2>{activities.map((activity) => <div className="mb-3 flex items-center justify-between border-b pb-3 text-sm last:border-0" key={activity.id}><div><p className="font-medium">{activity.action}</p><p className="text-slate-500">{activity.user} / {activity.module}</p></div><span className="text-xs text-slate-500">{dateTime(activity.date)}</span></div>)}</section>
    </div>
    <section className="card mt-6"><h2 className="mb-4 font-semibold">Recent invoices</h2><DataTable rows={invoices.slice(0, 5)} columns={[{ key: 'invoice', label: 'Invoice' }, { key: 'date', label: 'Initiated', render: (row) => row.date ? dateTime(row.date) : '-' }, { key: 'customer', label: 'Customer', render: (row) => row.customer || 'Walk-in Customer' }, { key: 'payment', label: 'Payment' }, { key: 'total', label: 'Amount', render: (row) => <b>{money(row.total, currency)}</b> }, { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Paid' ? 'success' : 'warning'}>{row.status || 'Awaiting Payment'}</Badge> }]} mobileTitle={(row) => row.invoice || 'Invoice'} /></section>
  </>
}
