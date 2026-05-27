import { ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Brand, FormInput } from '../../components/UI'

const demos = [
  ['System administrator', 'admin@salesmanagement.app', 'Admin123!'],
  ['Multi-company admin/cashier', 'emmanuel@axis.co.tz', 'Demo123!'],
  ['Branch cashier', 'cashier@axis.co.tz', 'Demo123!'],
  ['Finance / accountant', 'finance@axis.co.tz', 'Finance123!'],
  ['New company setup', 'founder@new.co.tz', 'Start123!'],
]

export default function LoginPage() {
  const { account, login, session } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'emmanuel@axis.co.tz', password: 'Demo123!' })
  const [error, setError] = useState('')
  if (account) return <Navigate to={session.activeCompanyId && session.activeBranchId ? session.lastVisitedRoute : '/start'} replace />
  const submit = (event) => {
    event.preventDefault()
    const result = login(form.email, form.password)
    if (!result.ok) return setError(result.message)
    navigate('/start')
  }
  return <div className="grid min-h-screen bg-white dark:bg-slate-950 lg:grid-cols-[1.05fr_.95fr]"><section className="hidden bg-brand-950 p-14 text-white lg:flex lg:flex-col lg:justify-between"><Brand /><div><p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm text-blue-100">Sales Management System</p><h1 className="max-w-xl text-5xl font-bold leading-tight">Manage sales, inventory and every branch in one place.</h1><p className="mt-5 max-w-lg text-lg text-blue-100">Track products, transactions, inventory, teams and reports with company-level control.</p></div><div className="grid grid-cols-3 gap-4 text-sm"><div><p className="text-2xl font-bold">Multi</p><p className="text-blue-200">Branch operations</p></div><div><p className="text-2xl font-bold">RBAC</p><p className="text-blue-200">Permission control</p></div><div><p className="text-2xl font-bold">Live</p><p className="text-blue-200">Stock updates</p></div></div></section><main className="flex items-center justify-center p-6 sm:p-12"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><Brand /></div><div className="mb-8"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950"><Lock /></div><h2 className="text-3xl font-bold">Sign in</h2><p className="mt-2 text-slate-500">Access your assigned company workspace.</p></div><form className="space-y-4" onSubmit={submit}><FormInput label="Email address" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /><FormInput label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="btn-primary w-full" type="submit">Continue <ArrowRight size={17} /></button></form><p className="mt-6 text-center text-sm text-slate-500">Don't have an account? <Link className="font-semibold text-brand-600 hover:text-brand-700" to="/register">Create business account</Link></p><div className="mt-8 rounded-2xl border bg-slate-50 p-4 dark:bg-slate-900"><p className="mb-3 flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={16} />Quick access</p>{demos.map(([label, email, password]) => <button key={email} onClick={() => setForm({ email, password })} className="mb-2 flex w-full justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-white dark:hover:bg-slate-800"><span>{label}</span><span className="text-slate-500">{email}</span></button>)}</div></div></main></div>
}
