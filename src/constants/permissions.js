export const PERMISSIONS = {
  Dashboard: [{ id: 'dashboard.view', label: 'View Dashboard' }],
  POS: [
    { id: 'pos.use', label: 'Use POS' },
    { id: 'pos.discount', label: 'Apply Discount' },
    { id: 'pos.cancel', label: 'Cancel Sale' },
  ],
  Finance: [
    { id: 'finance.view', label: 'View Payment Queue' },
    { id: 'finance.receive', label: 'Receive and Confirm Payments' },
    { id: 'finance.return', label: 'Return Unpaid Invoices to POS' },
  ],
  Products: [
    { id: 'products.view', label: 'View Products' },
    { id: 'products.add', label: 'Add Product' },
    { id: 'products.edit', label: 'Edit Product' },
    { id: 'products.delete', label: 'Delete Product' },
  ],
  Inventory: [
    { id: 'inventory.view', label: 'View Inventory' },
    { id: 'inventory.add', label: 'Add Inventory' },
    { id: 'inventory.edit', label: 'Edit Inventory' },
  ],
  Customers: [
    { id: 'customers.view', label: 'View Customers' },
    { id: 'customers.add', label: 'Add Customer' },
    { id: 'customers.edit', label: 'Edit Customer' },
    { id: 'customers.delete', label: 'Delete Customer' },
  ],
  Suppliers: [
    { id: 'suppliers.view', label: 'View Suppliers' },
    { id: 'suppliers.add', label: 'Add Supplier' },
    { id: 'suppliers.edit', label: 'Edit Supplier' },
    { id: 'suppliers.delete', label: 'Delete Supplier' },
  ],
  Reports: [
    { id: 'reports.view', label: 'View Reports' },
    { id: 'reports.pdf', label: 'Export PDF' },
    { id: 'reports.excel', label: 'Export Excel' },
  ],
  Users: [
    { id: 'users.view', label: 'View Users' },
    { id: 'users.add', label: 'Add Users' },
    { id: 'users.edit', label: 'Edit Users' },
    { id: 'users.disable', label: 'Disable Users' },
  ],
  Settings: [{ id: 'settings.manage', label: 'Manage Settings' }],
  Logs: [{ id: 'logs.view', label: 'View Logs' }],
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flat().map(({ id }) => id)
export const MANAGER_PERMISSIONS = ALL_PERMISSIONS.filter((p) => !p.startsWith('users.') && p !== 'settings.manage')
export const CASHIER_PERMISSIONS = ['dashboard.view', 'pos.use', 'pos.discount', 'products.view', 'customers.view', 'customers.add']
export const INVENTORY_PERMISSIONS = ['dashboard.view', 'products.view', 'products.add', 'products.edit', 'inventory.view', 'inventory.add', 'inventory.edit', 'suppliers.view']
export const ACCOUNTANT_PERMISSIONS = ['dashboard.view', 'finance.view', 'finance.receive', 'finance.return', 'reports.view', 'reports.pdf', 'reports.excel', 'logs.view']

export const ROLES = ['System Admin', 'Company Admin', 'Branch Manager', 'Inventory Manager', 'Accountant', 'Cashier', 'Viewer/User']
