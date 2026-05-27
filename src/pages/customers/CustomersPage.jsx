import EntityManager from '../../components/EntityManager'

export default function CustomersPage() {
  return <EntityManager collection="customers" title="Customers" singular="Customer" description="Customer directory and cumulative branch purchase history." fields={[{ key: 'name', label: 'Customer name' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'spent', label: 'Purchase history value', number: true, money: true, default: 0 }]} />
}
