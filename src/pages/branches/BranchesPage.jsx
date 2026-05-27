import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Badge, ConfirmDialog, DataTable, FormInput, Modal, PageHeader, Select } from '../../components/UI'

export default function BranchesPage() {
  const { activeCompany, data, companyBranches, addBranch, updateBranch, deleteBranch } = useApp()
  const [form, setForm] = useState(null)
  const [removing, setRemoving] = useState(null)
  const managers = data.users
    .filter((user) => user.companyId === activeCompany.id && user.status === 'Active')
    .map((user) => ({ ...user, account: data.accounts.find((account) => account.id === user.accountId) }))
    .filter((user) => user.account)
  const open = () => setForm({ name: '', address: '', phone: '', managerMembershipId: managers[0]?.id || '', status: 'Active' })
  const edit = (branch) => {
    const manager = managers.find((user) => user.accountId === branch.managerId)
    setForm({ ...branch, managerMembershipId: manager?.id || managers[0]?.id || '' })
  }
  const submit = (event) => {
    event.preventDefault()
    const saved = form.id ? updateBranch(form.id, form) : addBranch(form)
    if (saved) setForm(null)
  }

  return <>
    <PageHeader title="Branches" description={`Manage operational locations under ${activeCompany.name}.`} action={<button className="btn-primary" disabled={!managers.length} onClick={open}><Plus size={17} />Create branch</button>} />
    <section className="card">
      <p className="mb-5 text-xs text-slate-500">Branch codes remain automatic. Branches with products, receipts, sales, customers or suppliers should be made inactive rather than deleted.</p>
      <DataTable rows={companyBranches()} mobileTitle={(row) => row.name} columns={[{ key: 'name', label: 'Branch' }, { key: 'code', label: 'Branch code' }, { key: 'address', label: 'Location' }, { key: 'phone', label: 'Phone' }, { key: 'manager', label: 'Manager' }, { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> }, { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><button aria-label="Edit branch" className="rounded-lg border p-2 hover:bg-slate-50" onClick={() => edit(row)}><Pencil size={15} /></button><button aria-label="Delete branch" className="rounded-lg border p-2 text-red-500" onClick={() => setRemoving(row)}><Trash2 size={15} /></button></div> }]} />
    </section>
    <Modal title={form?.id ? 'Edit branch' : 'Create branch'} open={Boolean(form)} onClose={() => setForm(null)} footer={<><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button form="branch-form" className="btn-primary">Save branch</button></>}>
      <form className="grid gap-4 sm:grid-cols-2" id="branch-form" onSubmit={submit}>
        <FormInput label="Branch name" required value={form?.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <FormInput label="Branch code" value={form?.code || 'Generated automatically'} disabled />
        <FormInput label="Address / location (optional)" value={form?.address || ''} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        <FormInput label="Phone" required value={form?.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Select label="Branch manager" required value={form?.managerMembershipId || ''} onChange={(event) => setForm({ ...form, managerMembershipId: event.target.value })}>{managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.account.fullName} ({manager.role})</option>)}</Select>
        <Select label="Status" value={form?.status || 'Active'} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Active</option><option>Inactive</option></Select>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(removing)} title="Delete branch" message={`Delete ${removing?.name}? Only an empty branch that is not currently selected can be removed.`} onClose={() => setRemoving(null)} onConfirm={() => { deleteBranch(removing.id); setRemoving(null) }} />
  </>
}
