import { Building2, MapPin, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import BusinessTypeSelect from '../../components/BusinessTypeSelect'
import { Brand, FormInput, Select } from '../../components/UI'

export function StartPage() {
  const { account, isSystemAdmin, memberships, activeCompany, activeBranch, session } = useApp()
  if (!account) return <Navigate to="/login" replace />
  if (isSystemAdmin) return <Navigate to="/system-admin" replace />
  if (activeCompany && activeBranch) return <Navigate to={session.lastVisitedRoute || '/dashboard'} replace />
  if (!memberships.length) return <Navigate to="/company-setup" replace />
  return <Navigate to="/select-company" replace />
}

export function CompanySelection() {
  const { availableCompanies, switchCompany, activeCompany, isSystemAdmin } = useApp()
  const navigate = useNavigate()
  useEffect(() => {
    if (availableCompanies.length === 1 && !activeCompany) {
      const branch = switchCompany(availableCompanies[0].id)
      navigate(branch ? '/dashboard' : '/select-branch', { replace: true })
    }
  }, [availableCompanies, activeCompany, navigate, switchCompany])
  if (isSystemAdmin) return <Navigate to="/system-admin" replace />
  return <Selection title="Select company" subtitle="Choose the tenant workspace you want to operate."><div className="grid gap-4 md:grid-cols-2">{availableCompanies.map((company) => <button className="card flex items-center gap-4 text-left transition hover:border-brand-500" key={company.id} onClick={() => { const branch = switchCompany(company.id); navigate(branch ? '/dashboard' : '/select-branch') }}><Brand company={company} compact /><div><h2 className="font-semibold">{company.name}</h2><p className="text-sm text-slate-500">{company.businessType}</p></div></button>)}</div></Selection>
}

export function BranchSelection() {
  const { activeCompany, activeBranch, availableBranches, isSystemAdmin, switchBranch } = useApp()
  const navigate = useNavigate()
  useEffect(() => {
    if (activeCompany && !activeBranch && availableBranches.length === 1) {
      switchBranch(availableBranches[0].id)
      navigate('/dashboard', { replace: true })
    }
  }, [availableBranches, activeCompany, activeBranch, navigate, switchBranch])
  if (isSystemAdmin) return <Navigate to="/system-admin" replace />
  if (!activeCompany) return <Navigate to="/select-company" replace />
  return <Selection title="Select branch" subtitle={`Operating under ${activeCompany.name}. Data remains branch isolated.`}><div className="grid gap-4 md:grid-cols-2">{availableBranches.map((branch) => <button className="card flex items-center gap-4 text-left transition hover:border-brand-500" key={branch.id} onClick={() => { switchBranch(branch.id); navigate('/dashboard') }}><span className="rounded-xl bg-brand-50 p-3 text-brand-600"><MapPin /></span><div><h2 className="font-semibold">{branch.name}</h2><p className="text-sm text-slate-500">{branch.code} / {branch.address}</p></div></button>)}</div></Selection>
}

function Selection({ title, subtitle, children }) {
  return <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950"><div className="mx-auto max-w-4xl"><div className="mb-16 pt-4"><Brand /></div><div className="mb-8"><h1 className="text-3xl font-bold">{title}</h1><p className="mt-2 text-slate-500">{subtitle}</p></div>{children}</div></div>
}

export function CompanySetup() {
  const { account, memberships, createCompany, isSystemAdmin } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', businessType: 'General Business / All Products', phone: '', email: account?.email || '', address: '', country: 'Tanzania', currency: 'TZS', tin: '', website: '', receiptFooter: 'Thank you for your business.', logo: '' })
  if (isSystemAdmin) return <Navigate to="/system-admin" replace />
  if (memberships.length) return <Navigate to="/select-company" replace />
  const change = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  const uploadLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((previous) => ({ ...previous, logo: reader.result }))
    reader.readAsDataURL(file)
  }
  const submit = (event) => { event.preventDefault(); createCompany(form); navigate('/dashboard') }
  return <div className="min-h-screen bg-slate-50 p-5 dark:bg-slate-950"><div className="mx-auto max-w-4xl"><div className="mb-7 flex items-center justify-between"><Brand /><span className="pill bg-brand-50 text-brand-700"><Plus size={13} />New company</span></div><form className="card" onSubmit={submit}><div className="mb-6"><h1 className="text-2xl font-bold">Set up your company</h1><p className="mt-1 text-sm text-slate-500">Create your organization profile and main branch to begin trading.</p></div><div className="grid gap-4 sm:grid-cols-2"><FormInput label="Company name" value={form.name} onChange={change('name')} required /><BusinessTypeSelect value={form.businessType} onChange={change('businessType')} /><FormInput label="Phone number" value={form.phone} onChange={change('phone')} required /><FormInput label="Email" type="email" value={form.email} onChange={change('email')} required /><FormInput label="Address (optional)" value={form.address} onChange={change('address')} /><FormInput label="Country" value={form.country} onChange={change('country')} /><Select label="Currency" value={form.currency} onChange={change('currency')}><option>TZS</option><option>USD</option><option>KES</option></Select><FormInput label="TIN / Registration number (optional)" value={form.tin} onChange={change('tin')} /><FormInput label="Website" value={form.website} onChange={change('website')} /><label className="block text-sm font-medium text-slate-700 dark:text-slate-200"><span className="mb-1.5 block">Company logo</span><input className="input" type="file" accept="image/*" onChange={uploadLogo} /></label><FormInput className="sm:col-span-2" label="Receipt footer message" value={form.receiptFooter} onChange={change('receiptFooter')} /></div><div className="mt-7 flex justify-end"><button className="btn-primary">Create company and continue</button></div></form></div></div>
}
