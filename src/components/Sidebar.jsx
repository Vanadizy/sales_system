import { Banknote, BarChart3, Boxes, Building2, ClipboardList, LayoutDashboard, Package, Receipt, Settings, ShieldCheck, ShoppingCart, Store, Truck, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Brand } from './UI'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { to: '/pos', label: 'Point of Sale', icon: ShoppingCart, permission: 'pos.use' },
  { to: '/finance', label: 'Finance & Payments', icon: Banknote, permission: 'finance.view' },
  { to: '/products', label: 'Products', icon: Package, permission: 'products.view' },
  { to: '/inventory', label: 'Inventory', icon: Boxes, permission: 'inventory.view' },
  { to: '/customers', label: 'Customers', icon: Users, permission: 'customers.view' },
  { to: '/suppliers', label: 'Suppliers', icon: Truck, permission: 'suppliers.view' },
  { to: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports.view' },
  { to: '/users', label: 'Users & Access', icon: ShieldCheck, permission: 'users.view' },
  { to: '/branches', label: 'Branches', icon: Store, permission: 'settings.manage' },
  { to: '/logs', label: 'Activity Logs', icon: ClipboardList, permission: 'logs.view' },
  { to: '/settings', label: 'Settings', icon: Settings, permission: 'settings.manage' },
]

export default function Sidebar({ open, onClose }) {
  const { activeCompany, can, isSystemAdmin } = useApp()
  return <>
    {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={onClose} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-white transition-transform dark:bg-slate-900 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between border-b p-5"><Brand company={activeCompany} /><button className="lg:hidden" onClick={onClose}><X /></button></div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {isSystemAdmin && <NavLink to="/system-admin" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-100' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Building2 size={19} />Platform Administration</NavLink>}
        {!isSystemAdmin && items.filter((item) => can(item.permission) && activeCompany).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-100' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon size={19} />{label}</NavLink>)}
      </nav>
      <div className="m-4 rounded-2xl bg-brand-950 p-4 text-white"><div className="flex items-center gap-2 text-sm font-semibold"><Receipt size={17} />Sales Management System</div><p className="mt-2 text-xs text-blue-200">Secure company and branch workspace.</p></div>
    </aside>
  </>
}
