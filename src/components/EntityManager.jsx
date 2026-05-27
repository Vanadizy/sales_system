import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { money } from '../utils/format'
import { ConfirmDialog, DataTable, FormInput, Modal, PageHeader, PermissionGate } from './UI'

export default function EntityManager({ collection, title, description, singular, fields }) {
  const { scoped, activeCompany, data, addRecord, updateRecord, deleteRecord } = useApp()
  const currency = data.settings.find((row) => row.companyId === activeCompany.id)?.currency
  const [query, setQuery] = useState(''), [editing, setEditing] = useState(null), [removing, setRemoving] = useState(null)
  const records = scoped(collection).filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
  const newRow = Object.fromEntries(fields.map((field) => [field.key, field.default || '']))
  const save = (event) => {
    event.preventDefault()
    const values = { ...editing }
    fields.filter((field) => field.number).forEach((field) => { values[field.key] = Number(values[field.key]) })
    editing.id ? updateRecord(collection, editing.id, values, `${singular} edited`, title) : addRecord(collection, values, `${singular} added`, title)
    setEditing(null)
  }
  const columns = fields.map((field) => ({ key: field.key, label: field.label, render: field.money ? (row) => money(row[field.key], currency) : undefined })).concat({ key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><PermissionGate permission={`${collection}.edit`}><button className="rounded-lg border p-2" onClick={() => setEditing({ ...row })}><Pencil size={15} /></button></PermissionGate><PermissionGate permission={`${collection}.delete`}><button className="rounded-lg border p-2 text-red-500" onClick={() => setRemoving(row)}><Trash2 size={15} /></button></PermissionGate></div> })
  return <><PageHeader title={title} description={description} action={<PermissionGate permission={`${collection}.add`}><button className="btn-primary" onClick={() => setEditing(newRow)}><Plus size={17} />Add {singular.toLowerCase()}</button></PermissionGate>} /><div className="card"><label className="relative mb-5 block max-w-sm"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="input pl-10" placeholder={`Search ${title.toLowerCase()}`} value={query} onChange={(event) => setQuery(event.target.value)} /></label><DataTable rows={records} columns={columns} mobileTitle={(row) => row.name} /></div><Modal open={Boolean(editing)} title={`${editing?.id ? 'Edit' : 'Add'} ${singular.toLowerCase()}`} onClose={() => setEditing(null)} footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" form="entity-form">Save</button></>}><form id="entity-form" className="grid gap-4 sm:grid-cols-2" onSubmit={save}>{fields.map((field) => <FormInput key={field.key} label={field.label} type={field.number ? 'number' : field.type || 'text'} required={field.required !== false} value={editing?.[field.key] ?? ''} onChange={(event) => setEditing({ ...editing, [field.key]: event.target.value })} />)}</form></Modal><ConfirmDialog open={Boolean(removing)} title={`Delete ${singular.toLowerCase()}`} message={`Remove ${removing?.name} from this branch?`} onClose={() => setRemoving(null)} onConfirm={() => { deleteRecord(collection, removing.id, `${singular} deleted`, title); setRemoving(null) }} /></>
}
