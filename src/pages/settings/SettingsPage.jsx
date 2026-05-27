import { Download, RotateCcw, Save } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import BusinessTypeSelect from '../../components/BusinessTypeSelect'
import { Brand, ConfirmDialog, FormInput, PageHeader, Select, Tabs } from '../../components/UI'

const sections = ['General', 'Appearance', 'POS Settings', 'System']

export default function SettingsPage() {
  const { activeCompany, data, updateCompany, resetDemo, notify } = useApp()
  const settings = data.settings.find((row) => row.companyId === activeCompany.id)
  const [tab, setTab] = useState('General'), [reset, setReset] = useState(false)
  const [form, setForm] = useState({ ...activeCompany, ...settings })
  const change = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  const uploadLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((previous) => ({ ...previous, logo: reader.result }))
    reader.readAsDataURL(file)
  }
  const save = (event) => {
    event.preventDefault()
    const tax = form.tax === '' || form.tax == null ? null : Number(form.tax)
    updateCompany({ ...form, tax })
  }
  const backup = () => {
    const content = JSON.stringify(data, null, 2)
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    anchor.download = `${activeCompany.name.replaceAll(' ', '-')}-backup.json`
    anchor.click()
    notify('Backup exported.')
  }
  return <><PageHeader title="Settings" description="Company profile, appearance, sales rules and system maintenance." /><div className="mb-6"><Tabs tabs={sections} selected={tab} onChange={setTab} /></div><form className="card max-w-4xl" onSubmit={save}>{tab === 'General' && <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Company name" value={form.name} onChange={change('name')} /><BusinessTypeSelect value={form.businessType} onChange={change('businessType')} /><FormInput label="Email" value={form.email} onChange={change('email')} /><FormInput label="Phone" value={form.phone} onChange={change('phone')} /><FormInput label="Address (optional)" value={form.address} onChange={change('address')} /><FormInput label="TIN / Registration (optional)" value={form.tin} onChange={change('tin')} /><Select label="Currency" value={form.currency} onChange={change('currency')}><option>TZS</option><option>USD</option><option>KES</option></Select><Select label="Timezone" value={form.timezone} onChange={change('timezone')}><option>Africa/Dar_es_Salaam</option><option>UTC</option></Select></div>}{tab === 'Appearance' && <div className="grid max-w-md gap-4"><div className="rounded-xl border p-4"><p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Company logo</p><Brand company={form} /><label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200"><span className="mb-1.5 block">Upload new logo</span><input className="input" type="file" accept="image/*" onChange={uploadLogo} /></label>{form.logo && <button type="button" className="btn-secondary mt-3 text-red-600" onClick={() => setForm((previous) => ({ ...previous, logo: '' }))}>Remove logo</button>}</div><Select label="Interface theme" value={form.theme} onChange={change('theme')}><option value="light">Light mode</option><option value="dark">Dark mode</option></Select><Select label="Language" value={form.language} onChange={change('language')}><option>English</option><option>Swahili</option></Select></div>}{tab === 'POS Settings' && <div className="grid gap-4 sm:grid-cols-2"><FormInput label="Tax percentage (optional)" type="number" min="0" max="100" value={form.tax ?? ''} onChange={change('tax')} /><FormInput label="Receipt footer message" value={form.receiptFooter} onChange={change('receiptFooter')} /></div>}{tab === 'System' && <div><p className="mb-5 text-sm text-slate-500">Manage portable system data or restore the original sample records.</p><div className="flex flex-wrap gap-3"><button type="button" className="btn-secondary" onClick={backup}><Download size={17} />Export backup</button><button type="button" className="btn-secondary text-red-600" onClick={() => setReset(true)}><RotateCcw size={17} />Reset sample data</button></div></div>}{tab !== 'System' && <div className="mt-7"><button className="btn-primary"><Save size={17} />Save settings</button></div>}</form><ConfirmDialog open={reset} title="Reset sample data" message="This will replace all saved changes with the original sample records." onClose={() => setReset(false)} onConfirm={() => { resetDemo(); setReset(false) }} /></>
}
