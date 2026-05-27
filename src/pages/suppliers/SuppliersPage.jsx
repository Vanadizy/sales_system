import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ConfirmDialog, DataTable, FormInput, Modal, PageHeader, PermissionGate } from '../../components/UI'
import { comparableText } from '../../utils/format'

const blank = { name: '', phone: '', category: 'General', orders: 0 }

export default function SuppliersPage() {
  const { scoped, addSupplier, updateSupplier, deleteRecord, notify } = useApp()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)
  const suppliers = scoped('suppliers').filter((supplier) =>
    `${supplier.name} ${supplier.phone} ${supplier.category}`.toLowerCase().includes(query.toLowerCase()))
  const movements = scoped('inventory')

  const save = (event) => {
    event.preventDefault()
    const saved = editing.id ? updateSupplier(editing.id, editing) : addSupplier(editing)
    if (saved) setEditing(null)
  }

  return <>
    <PageHeader
      title="Suppliers"
      description="Maintain registered suppliers used for inventory receipts and purchase cost history."
      action={<PermissionGate permission="suppliers.add"><button className="btn-primary" onClick={() => setEditing({ ...blank })}><Plus size={17} />Add supplier</button></PermissionGate>}
    />
    <div className="card">
      <label className="relative mb-5 block max-w-sm"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="input pl-10" placeholder="Search suppliers" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <p className="mb-5 text-xs text-slate-500">Supplier names must be unique in this branch. Inventory entries select these registered names to keep receiving history consistent.</p>
      <DataTable
        rows={suppliers}
        mobileTitle={(row) => row.name}
        columns={[
          { key: 'name', label: 'Supplier' },
          { key: 'phone', label: 'Phone' },
          { key: 'category', label: 'Supplied category' },
          { key: 'orders', label: 'Receipts posted' },
          { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><PermissionGate permission="suppliers.edit"><button aria-label="Edit supplier" className="rounded-lg border p-2 hover:bg-slate-50" onClick={() => setEditing({ ...row })}><Pencil size={15} /></button></PermissionGate><PermissionGate permission="suppliers.delete"><button aria-label="Delete supplier" className="rounded-lg border p-2 text-red-500" onClick={() => setRemoving(row)}><Trash2 size={15} /></button></PermissionGate></div> },
        ]}
      />
    </div>
    <Modal open={Boolean(editing)} title={editing?.id ? 'Edit supplier' : 'Add supplier'} onClose={() => setEditing(null)} footer={<><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" form="supplier-form">Save supplier</button></>}>
      <form id="supplier-form" className="grid gap-4 sm:grid-cols-2" onSubmit={save}>
        <FormInput label="Supplier name" required value={editing?.name || ''} onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
        <FormInput label="Phone" required value={editing?.phone || ''} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} />
        <FormInput label="Supplied category" required value={editing?.category || ''} onChange={(event) => setEditing({ ...editing, category: event.target.value })} />
        <FormInput label="Receipts posted" value={editing?.orders ?? 0} disabled />
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(removing)} title="Delete supplier" message={`Remove ${removing?.name} from this branch?`} onClose={() => setRemoving(null)} onConfirm={() => {
      if (movements.some((row) => row.supplierId === removing.id || (!row.supplierId && comparableText(row.supplier) === comparableText(removing.name)))) {
        notify('A supplier with posted receipts cannot be deleted.', 'warning')
      } else {
        deleteRecord('suppliers', removing.id, 'Supplier deleted', 'Suppliers')
      }
      setRemoving(null)
    }} />
  </>
}
