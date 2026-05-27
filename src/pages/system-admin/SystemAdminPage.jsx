import { Building2, Download, Store, Users } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { exportExcel } from '../../services/exportService'
import { Badge, DataTable, PageHeader, StatCard } from '../../components/UI'

export default function SystemAdminPage() {
  const { data, account, toggleCompany, notify } = useApp()
  const [query, setQuery] = useState('')
  const rows = data.companies.filter((company) => `${company.name} ${company.businessType}`.toLowerCase().includes(query.toLowerCase())).map((company) => ({
    id: company.id,
    name: company.name,
    businessType: company.businessType,
    registeredAt: company.registeredAt,
    status: company.status,
    branches: data.branches.filter((branch) => branch.companyId === company.id).length,
    users: data.users.filter((user) => user.companyId === company.id).length,
  }))
  const active = data.companies.filter((company) => company.status === 'Active').length
  const download = () => {
    exportExcel({ title: 'Registered Companies', rows: rows.map(({ name, businessType, registeredAt, branches, users, status }) => ({ Name: name, Type: businessType, Registered: registeredAt, Branches: branches, Users: users, Status: status })), company: { name: 'Sales Management System' }, branch: { code: 'platform' } })
    notify('Company register exported.')
  }
  return <><PageHeader title="System administrator" description={`Platform overview / Welcome, ${account.fullName}`} action={<button className="btn-primary" onClick={download}><Download size={17} />Export companies</button>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total companies" value={data.companies.length} detail="Registered tenants" icon={Building2} /><StatCard label="Active companies" value={active} detail={`${data.companies.length - active} inactive`} icon={Building2} tone="green" /><StatCard label="Total branches" value={data.branches.length} detail="Aggregate count" icon={Store} /><StatCard label="Total users" value={data.users.filter((u) => u.companyId !== 'platform').length} detail="Aggregate memberships" icon={Users} /></div><section className="card mt-6"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-semibold">Registered companies</h2><p className="mt-1 text-sm text-slate-500">General registration details only.</p></div><input className="input max-w-xs" placeholder="Search companies" value={query} onChange={(event) => setQuery(event.target.value)} /></div><DataTable rows={rows} mobileTitle={(row) => row.name} columns={[{ key: 'name', label: 'Company' }, { key: 'businessType', label: 'Business type' }, { key: 'registeredAt', label: 'Registered' }, { key: 'branches', label: 'Branches' }, { key: 'users', label: 'Users' }, { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> }, { key: 'actions', label: 'Action', render: (row) => <button className="btn-secondary px-3 py-1.5" onClick={() => toggleCompany(row.id)}>{row.status === 'Active' ? 'Deactivate' : 'Activate'}</button> }]} /></section></>
}
