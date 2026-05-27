import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Badge, DataTable, FormInput, Modal, PageHeader, Select } from '../../components/UI'

export default function BranchesPage() {
  const { activeCompany, data, companyBranches, addBranch } = useApp()
  const [form, setForm] = useState(null)
  const managers = data.users
    .filter((user) => user.companyId === activeCompany.id && user.status === 'Active')
    .map((user) => ({ ...user, account: data.accounts.find((account) => account.id === user.accountId) }))
    .filter((user) => user.account)
  const open = () => setForm({ name: '', address: '', phone: '', managerMembershipId: managers[0]?.id || '', status: 'Active' })
  const submit = (event) => {
    event.preventDefault()
    addBranch(form)
    setForm(null)
  }

  return <>
    <PageHeader title="Branches" description={`Manage operational locations under ${activeCompany.name}.`} action={<button className="btn-primary" onClick={open}><Plus size={17} />Create branch</button>} />
    <section className="card"><DataTable rows={companyBranches()} mobileTitle={(row) => row.name} columns={[{ key: 'name', label: 'Branch' }, { key: 'code', label: 'Branch code' }, { key: 'address', label: 'Location' }, { key: 'phone', label: 'Phone' }, { key: 'manager', label: 'Manager' }, { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> }]} /></section>
    <Modal title="Create branch" open={Boolean(form)} onClose={() => setForm(null)} footer={<><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button form="branch-form" className="btn-primary">Save branch</button></>}>
      <form className="grid gap-4 sm:grid-cols-2" id="branch-form" onSubmit={submit}>
        <FormInput label="Branch name" required value={form?.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <FormInput label="Branch code" value="Generated automatically" disabled />
        <FormInput label="Address / location" required value={form?.address || ''} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        <FormInput label="Phone" required value={form?.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Select label="Branch manager" required value={form?.managerMembershipId || ''} onChange={(event) => setForm({ ...form, managerMembershipId: event.target.value })}>{managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.account.fullName} ({manager.role})</option>)}</Select>
        <Select label="Status" value={form?.status || 'Active'} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Active</option><option>Inactive</option></Select>
      </form>
    </Modal>
  </>
}
