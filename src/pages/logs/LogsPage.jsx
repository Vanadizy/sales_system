import { Search } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Badge, DataTable, PageHeader } from '../../components/UI'
import { dateTime } from '../../utils/format'

export default function LogsPage() {
  const { scoped, activeCompany, activeBranch } = useApp()
  const [query, setQuery] = useState('')
  const rows = scoped('logs').filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
  return <><PageHeader title="Activity logs" description={`Auditable actions for ${activeCompany.name} / ${activeBranch.name}.`} /><div className="card"><label className="relative mb-5 block max-w-sm"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="input pl-10" placeholder="Filter activities" value={query} onChange={(event) => setQuery(event.target.value)} /></label><DataTable rows={rows} mobileTitle={(row) => row.action} columns={[{ key: 'date', label: 'Date / time', render: (row) => dateTime(row.date) }, { key: 'user', label: 'User' }, { key: 'role', label: 'Role' }, { key: 'action', label: 'Action' }, { key: 'module', label: 'Module' }, { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> }]} /></div></>
}
