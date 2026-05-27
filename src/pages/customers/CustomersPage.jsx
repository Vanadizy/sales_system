import EntityManager from '../../components/EntityManager'

export default function CustomersPage() {
  return <EntityManager collection="customers" title="Customers" singular="Customer" description="Customer directory and cumulative branch purchase history." fields={[{ key: 'name', label: 'Customer name' }, { key: 'phone', label: 'Phone (optional)', required: false }, { key: 'email', label: 'Email (optional)', type: 'email', required: false }, { key: 'spent', label: 'Purchase history value', number: true, money: true, default: 0 }]} />
}
