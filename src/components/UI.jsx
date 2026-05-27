import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { initials } from '../utils/format'
import { useApp } from '../context/AppContext'

export function Brand({ company, compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
        {company?.logo ? <img className="h-full w-full rounded-xl object-cover" src={company.logo} alt="" /> : initials(company?.name || 'Sales Management System')}
      </div>
      {!compact && <div><div className="text-sm font-bold">{company?.name || 'Sales Management System'}</div><div className="text-xs text-slate-500">{company ? 'Sales workspace' : 'Business operations'}</div></div>}
    </div>
  )
}

export function Avatar({ name }) {
  return <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-100">{initials(name)}</span>
}

export function PageHeader({ title, description, action }) {
  return <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p></div>{action}</header>
}

export function StatCard({ label, value, icon: Icon, detail, tone = 'blue' }) {
  const tones = { blue: 'bg-brand-50 text-brand-600 dark:bg-brand-950', green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950', amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950', red: 'bg-red-50 text-red-600 dark:bg-red-950' }
  return <div className="card"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><div className={`rounded-xl p-3 ${tones[tone]}`}><Icon size={21} /></div></div></div>
}

export function FormInput({ label, as = 'input', className = '', ...props }) {
  const Element = as
  return <label className={`block text-sm font-medium text-slate-700 dark:text-slate-200 ${className}`}><span className="mb-1.5 block">{label}</span><Element className="input" {...props} /></label>
}

export function Select({ label, children, ...props }) {
  return <label className="block text-sm font-medium text-slate-700 dark:text-slate-200"><span className="mb-1.5 block">{label}</span><select className="input" {...props}>{children}</select></label>
}

export function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900"><div className="flex items-center justify-between border-b p-5"><h2 className="text-lg font-semibold">{title}</h2><button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close" onClick={onClose}><X size={18} /></button></div><div className="p-5">{children}</div>{footer && <div className="flex justify-end gap-3 border-t p-5">{footer}</div>}</div></div>
}

export function ConfirmDialog({ open, title = 'Confirm action', message, onConfirm, onClose }) {
  return <Modal open={open} title={title} onClose={onClose} footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary bg-red-600 hover:bg-red-700" onClick={onConfirm}>Confirm</button></>}><p className="text-sm text-slate-600 dark:text-slate-300">{message}</p></Modal>
}

export function EmptyState({ title = 'No records found', message = 'Create a record or change your filters.' }) {
  return <div className="py-14 text-center"><div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800"><Info /></div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{message}</p></div>
}

export function DataTable({ columns, rows, empty, mobileTitle, showFirstOnMobile = false }) {
  if (!rows.length) return <EmptyState {...empty} />
  return <>
    <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-slate-500">{columns.map((col) => <th className="px-4 py-3 font-semibold" key={col.key}>{col.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">{columns.map((col) => <td className="px-4 py-3" key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>)}</tr>)}</tbody></table></div>
    <div className="grid gap-3 md:hidden">{rows.map((row) => <div className="rounded-xl border p-4" key={row.id}><p className="mb-3 font-semibold">{mobileTitle ? mobileTitle(row) : row.name}</p>{columns.slice(showFirstOnMobile ? 0 : 1).map((col) => <div className="mb-2 flex justify-between gap-4 text-sm" key={col.key}><span className="text-slate-500">{col.label}</span><span className="text-right">{col.render ? col.render(row) : row[col.key]}</span></div>)}</div>)}</div>
  </>
}

export function Badge({ children, variant = 'success' }) {
  const styles = { success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
  return <span className={`pill ${styles[variant]}`}>{children}</span>
}

export function PermissionGate({ permission, children }) {
  const { can } = useApp()
  return can(permission) ? children : null
}

export function CheckboxGroup({ sections, selected, onChange }) {
  return <div className="grid gap-4 sm:grid-cols-2">{Object.entries(sections).map(([group, permissions]) => <fieldset key={group} className="rounded-xl border p-3"><legend className="px-1 text-sm font-semibold">{group}</legend>{permissions.map((permission) => <label className="mt-2 flex items-center gap-2 text-sm" key={permission.id}><input type="checkbox" className="h-4 w-4 rounded accent-brand-600" checked={selected.includes(permission.id)} onChange={(event) => onChange(permission.id, event.target.checked)} />{permission.label}</label>)}</fieldset>)}</div>
}

export function Tabs({ tabs, selected, onChange }) {
  return <div role="tablist" className="flex snap-x gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">{tabs.map((tab) => <button role="tab" aria-selected={selected === tab} key={tab} onClick={() => onChange(tab)} className={`shrink-0 snap-start whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${selected === tab ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-100' : 'text-slate-500'}`}>{tab}</button>)}</div>
}

export function Toasts() {
  const { toasts } = useApp()
  return <div className="fixed right-5 top-5 z-[60] grid gap-2">{toasts.map((toast) => <div key={toast.id} className="flex min-w-64 max-w-sm items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg dark:bg-slate-900">{toast.type === 'warning' ? <AlertTriangle className="text-amber-500" size={18} /> : <CheckCircle2 className="text-emerald-500" size={18} />}{toast.message}</div>)}</div>
}

export function LoadingSpinner() {
  return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" /></div>
}
