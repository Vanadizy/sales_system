import { Pencil, Plus, UserRoundX } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { PERMISSIONS, ROLES } from '../../constants/permissions'
import { roleDefaults } from '../../mockData/seed'
import { Badge, CheckboxGroup, DataTable, FormInput, Modal, PageHeader, PermissionGate, Select } from '../../components/UI'

export default function UsersPage() {
  const { data, activeCompany, companyBranches, saveMembership, updateMembership, appendLog, notify } = useApp()
  const [editing, setEditing] = useState(null)
  const users = data.users.filter((row) => row.companyId === activeCompany.id).map((row) => ({ ...row, account: data.accounts.find((account) => account.id === row.accountId) }))
  const branches = companyBranches()
  const openNew = () => setEditing({ fullName: '', email: '', role: 'Cashier', branchIds: [branches[0]?.id], permissions: roleDefaults.Cashier })
  const edit = (row) => setEditing({ ...row, fullName: row.account.fullName, email: row.account.email })
  const setRole = (role) => setEditing({ ...editing, role, permissions: roleDefaults[role] || [] })
  const togglePermission = (id, checked) => setEditing({ ...editing, permissions: checked ? [...editing.permissions, id] : editing.permissions.filter((permission) => permission !== id) })
  const submit = (event) => {
    event.preventDefault()
    editing.id ? updateMembership(editing.id, { branchIds: editing.branchIds, role: editing.role, permissions: editing.permissions }) : saveMembership(editing)
    setEditing(null)
  }
  const toggleStatus = (row) => { updateMembership(row.id, { status: row.status === 'Active' ? 'Inactive' : 'Active' }); appendLog('User updated', 'Users'); notify('User status changed.') }
  return <><PageHeader title="Users & permissions" description="Assign company roles, permitted branches and module-level checkboxes." action={<PermissionGate permission="users.add"><button className="btn-primary" onClick={openNew}><Plus size={17} />Add user</button></PermissionGate>} /><div className="card"><DataTable rows={users} mobileTitle={(row) => row.account.fullName} columns={[{ key: 'name', label: 'User', render: (row) => <div><p className="font-medium">{row.account.fullName}</p><p className="text-xs text-slate-500">{row.account.email}</p></div> }, { key: 'role', label: 'Role' }, { key: 'branches', label: 'Branches', render: (row) => row.branchIds.map((id) => branches.find((branch) => branch.id === id)?.name).join(', ') }, { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge> }, { key: 'action', label: 'Actions', render: (row) => <div className="flex gap-2"><PermissionGate permission="users.edit"><button className="rounded-lg border p-2" onClick={() => edit(row)}><Pencil size={15} /></button></PermissionGate><PermissionGate permission="users.disable"><button className="rounded-lg border p-2 text-red-500" onClick={() => toggleStatus(row)}><UserRoundX size={15} /></button></PermissionGate></div> }]} /></div><Modal title={editing?.id ? 'Edit access profile' : 'Create user'} open={Boolean(editing)} onClose={() => setEditing(null)} footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" form="user-form">Save access</button></>}><form id="user-form" onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><FormInput label="Full name" value={editing?.fullName || ''} onChange={(event) => setEditing({ ...editing, fullName: event.target.value })} disabled={Boolean(editing?.id)} required /><FormInput label="Email" type="email" value={editing?.email || ''} onChange={(event) => setEditing({ ...editing, email: event.target.value })} disabled={Boolean(editing?.id)} required /><Select label="Role" value={editing?.role || ''} onChange={(event) => setRole(event.target.value)}>{ROLES.filter((role) => role !== 'System Admin').map((role) => <option key={role}>{role}</option>)}</Select></div><fieldset><legend className="mb-2 text-sm font-semibold">Assigned branches</legend><div className="flex flex-wrap gap-3">{branches.map((branch) => <label key={branch.id} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><input type="checkbox" checked={editing?.branchIds.includes(branch.id)} onChange={(event) => setEditing({ ...editing, branchIds: event.target.checked ? [...editing.branchIds, branch.id] : editing.branchIds.filter((id) => id !== branch.id) })} />{branch.name}</label>)}</div></fieldset><div><p className="mb-3 text-sm font-semibold">Permissions</p><CheckboxGroup sections={PERMISSIONS} selected={editing?.permissions || []} onChange={togglePermission} /></div></form></Modal></>
}
