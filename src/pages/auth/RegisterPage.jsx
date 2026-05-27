import { ArrowLeft, ArrowRight, Building2, Check, KeyRound, MapPin, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import BusinessTypeSelect from '../../components/BusinessTypeSelect'
import { Brand, FormInput, Select } from '../../components/UI'
import { useApp } from '../../context/AppContext'

const steps = [
  { name: 'Owner profile', icon: UserRound },
  { name: 'Login details', icon: KeyRound },
  { name: 'Company setup', icon: Building2 },
  { name: 'First branch', icon: MapPin },
]

const initialForm = {
  owner: { fullName: '', phone: '', avatar: '', email: '', password: '', confirmPassword: '' },
  company: { name: '', businessType: 'General Business / All Products', phone: '', email: '', address: '', country: 'Tanzania', currency: 'TZS', tin: '', website: '', receiptFooter: 'Thank you for your business.', logo: '' },
  branch: { name: 'Main Branch', address: '', phone: '' },
}

export default function RegisterPage() {
  const { account, session, registerBusiness } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  if (account) return <Navigate to={session.activeCompanyId && session.activeBranchId ? '/dashboard' : '/start'} replace />

  const update = (section, key) => (event) => setForm((previous) => ({ ...previous, [section]: { ...previous[section], [key]: event.target.value } }))
  const upload = (section, key) => (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((previous) => ({ ...previous, [section]: { ...previous[section], [key]: reader.result } }))
    reader.readAsDataURL(file)
  }
  const advance = (event) => {
    event.preventDefault()
    setError('')
    if (step === 1 && form.owner.password !== form.owner.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }
    const result = registerBusiness({
      owner: form.owner,
      company: form.company,
      branch: form.branch,
    })
    if (!result.ok) {
      setStep(1)
      setError(result.message)
      return
    }
    navigate('/dashboard')
  }

  return <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-7">
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex items-center justify-between"><Brand /><Link className="btn-secondary" to="/login"><ArrowLeft size={16} />Back to login</Link></header>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Create account</p>
          <h1 className="mt-2 text-xl font-bold">Get started</h1>
          <p className="mt-2 text-sm text-slate-500">Set up an owner account, company, and operating branch.</p>
          <ol className="mt-7 space-y-4">{steps.map(({ name, icon: Icon }, index) => <li className="flex items-center gap-3" key={name}><span className={`flex h-9 w-9 items-center justify-center rounded-full ${index <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>{index < step ? <Check size={17} /> : <Icon size={17} />}</span><div><p className={`text-sm font-medium ${index === step ? 'text-brand-700 dark:text-brand-100' : ''}`}>{name}</p><p className="text-xs text-slate-500">Step {index + 1}</p></div></li>)}</ol>
        </aside>
        <form className="card" onSubmit={advance}>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step {step + 1} of {steps.length}</p>
          <h2 className="mt-2 text-2xl font-bold">{steps[step].name}</h2>
          <p className="mb-7 mt-1 text-sm text-slate-500">{descriptions[step]}</p>
          {step === 0 && <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Full name" value={form.owner.fullName} onChange={update('owner', 'fullName')} required /><FormInput label="Phone number" value={form.owner.phone} onChange={update('owner', 'phone')} required /><label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2"><span className="mb-1.5 block">Profile image (optional)</span><input className="input" type="file" accept="image/*" onChange={upload('owner', 'avatar')} /></label></div>}
          {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><FormInput className="sm:col-span-2" label="Login email address" type="email" value={form.owner.email} onChange={update('owner', 'email')} required /><FormInput label="Password" type="password" minLength="8" value={form.owner.password} onChange={update('owner', 'password')} required /><FormInput label="Confirm password" type="password" minLength="8" value={form.owner.confirmPassword} onChange={update('owner', 'confirmPassword')} required /><p className="sm:col-span-2 text-xs text-slate-500">Use at least 8 characters to protect your account.</p></div>}
          {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Company name" value={form.company.name} onChange={update('company', 'name')} required /><BusinessTypeSelect value={form.company.businessType} onChange={update('company', 'businessType')} /><FormInput label="Company phone" value={form.company.phone} onChange={update('company', 'phone')} required /><FormInput label="Company email" type="email" value={form.company.email} onChange={update('company', 'email')} required /><FormInput label="Address (optional)" value={form.company.address} onChange={update('company', 'address')} /><FormInput label="Country" value={form.company.country} onChange={update('company', 'country')} required /><Select label="Currency" value={form.company.currency} onChange={update('company', 'currency')}><option>TZS</option><option>USD</option><option>KES</option></Select><FormInput label="TIN / Registration number (optional)" value={form.company.tin} onChange={update('company', 'tin')} /><FormInput label="Website" value={form.company.website} onChange={update('company', 'website')} /><label className="block text-sm font-medium text-slate-700 dark:text-slate-200"><span className="mb-1.5 block">Company logo (optional)</span><input className="input" type="file" accept="image/*" onChange={upload('company', 'logo')} /></label><FormInput className="sm:col-span-2" label="Receipt footer message" value={form.company.receiptFooter} onChange={update('company', 'receiptFooter')} /></div>}
          {step === 3 && <div><div className="grid gap-4 sm:grid-cols-2"><FormInput label="Branch name" value={form.branch.name} onChange={update('branch', 'name')} required /><FormInput label="Branch code" value="Generated automatically" disabled /><FormInput label="Address / location (optional)" value={form.branch.address} onChange={update('branch', 'address')} /><FormInput label="Phone" value={form.branch.phone} onChange={update('branch', 'phone')} required /></div><div className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-950 dark:bg-brand-950 dark:text-brand-100"><p className="font-semibold">Ready to create your workspace</p><p className="mt-1">{form.owner.fullName} will be Company Admin and branch manager for {form.company.name} / {form.branch.name}.</p></div></div>}
          {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="mt-8 flex justify-between gap-3"><button className="btn-secondary" type="button" disabled={step === 0} onClick={() => { setError(''); setStep(step - 1) }}><ArrowLeft size={16} />Previous</button><button className="btn-primary" type="submit">{step === steps.length - 1 ? 'Create account' : 'Continue'}<ArrowRight size={16} /></button></div>
        </form>
      </div>
    </div>
  </div>
}

const descriptions = [
  'Enter details for the business owner who will administer this workspace.',
  'Create the credentials used to securely return to your workspace.',
  'Provide the information that appears in receipts, reports, and the workspace identity.',
  'Create the first operating location. Additional branches can be added later.',
]
