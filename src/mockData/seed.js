import { ACCOUNTANT_PERMISSIONS, ALL_PERMISSIONS, CASHIER_PERMISSIONS, INVENTORY_PERMISSIONS, MANAGER_PERMISSIONS, ROLES } from '../constants/permissions'

const now = '2026-05-27T09:30:00.000Z'
const c1 = 'cmp-axis', c2 = 'cmp-savanna'
const b1 = 'br-axis-hq', b2 = 'br-axis-kariakoo', b3 = 'br-savanna-hq'

const scoped = (companyId, branchId, rows) => rows.map((row) => ({ ...row, companyId, branchId }))

export const createSeedData = () => ({
  companies: [
    { id: c1, companyId: c1, name: 'Axis Retail Group', businessType: 'Retail & Wholesale', phone: '+255 754 310 900', email: 'operations@axisretail.co.tz', address: 'Samora Avenue, Dar es Salaam', country: 'Tanzania', currency: 'TZS', tin: '143-994-100', website: 'axisretail.co.tz', receiptFooter: 'Thank you for shopping with Axis.', status: 'Active', owner: 'Emmanuel Charles', registeredAt: '2025-11-14', logo: '' },
    { id: c2, companyId: c2, name: 'Savanna Office Supplies', businessType: 'Stationery & Office Supplies', phone: '+255 746 330 881', email: 'hello@savanna.co.tz', address: 'Nyerere Road, Dodoma', country: 'Tanzania', currency: 'TZS', tin: '133-224-001', website: 'savanna.co.tz', receiptFooter: 'Reliable supplies, every day.', status: 'Active', owner: 'Asha Mussa', registeredAt: '2026-02-03', logo: '' },
  ],
  branches: [
    { id: b1, companyId: c1, name: 'Head Office', code: 'BR-0001', address: 'Samora Avenue', phone: '+255 754 310 900', managerId: 'acc-emmanuel', manager: 'Emmanuel Charles', status: 'Active' },
    { id: b2, companyId: c1, name: 'Kariakoo Branch', code: 'BR-0002', address: 'Msimbazi Street', phone: '+255 754 310 911', managerId: 'acc-neema', manager: 'Neema Joseph', status: 'Active' },
    { id: b3, companyId: c2, name: 'Dodoma Central', code: 'BR-0001', address: 'Nyerere Road', phone: '+255 746 330 881', managerId: 'acc-emmanuel', manager: 'Emmanuel Charles', status: 'Active' },
  ],
  accounts: [
    { id: 'acc-system', fullName: 'Platform Administrator', email: 'admin@salesmanagement.app', password: 'Admin123!', avatar: '', status: 'Active', systemAdmin: true },
    { id: 'acc-emmanuel', fullName: 'Emmanuel Charles', email: 'emmanuel@axis.co.tz', password: 'Demo123!', avatar: '', status: 'Active' },
    { id: 'acc-neema', fullName: 'Neema Joseph', email: 'cashier@axis.co.tz', password: 'Demo123!', avatar: '', status: 'Active' },
    { id: 'acc-founder', fullName: 'New Business Owner', email: 'founder@new.co.tz', password: 'Start123!', avatar: '', status: 'Active' },
  ],
  users: [
    { id: 'usr-system', accountId: 'acc-system', companyId: 'platform', branchIds: [], role: 'System Admin', permissions: ['*'], status: 'Active' },
    { id: 'usr-em-axis', accountId: 'acc-emmanuel', companyId: c1, branchIds: [b1, b2], role: 'Company Admin', permissions: ALL_PERMISSIONS, status: 'Active' },
    { id: 'usr-em-sav', accountId: 'acc-emmanuel', companyId: c2, branchIds: [b3], role: 'Cashier', permissions: CASHIER_PERMISSIONS, status: 'Active' },
    { id: 'usr-neema', accountId: 'acc-neema', companyId: c1, branchIds: [b2], role: 'Cashier', permissions: CASHIER_PERMISSIONS, status: 'Active' },
  ],
  roles: [c1, c2].flatMap((companyId) => ROLES.map((name) => ({ id: `${companyId}-${name.toLowerCase().replaceAll(' ', '-')}`, companyId, name }))),
  products: [
    ...scoped(c1, b1, [
      { id: 'p1', name: 'Premium Rice 5kg', sku: 'PRD-00001', barcode: '6201001', category: 'Groceries', price: 18500, cost: 14300, stock: 48, reorder: 15 },
      { id: 'p2', name: 'Sunflower Oil 3L', sku: 'PRD-00002', barcode: '6201002', category: 'Groceries', price: 16200, cost: 12200, stock: 9, reorder: 12 },
      { id: 'p3', name: 'Laundry Powder 2kg', sku: 'PRD-00003', barcode: '6201003', category: 'Home Care', price: 9800, cost: 7100, stock: 32, reorder: 10 },
      { id: 'p4', name: 'Mineral Water Pack', sku: 'PRD-00004', barcode: '6201004', category: 'Beverages', price: 7200, cost: 5000, stock: 6, reorder: 18 },
      { id: 'p9', name: 'Smartphone 128GB', sku: 'PRD-00005', barcode: '6201005', category: 'Phones', price: 520000, cost: 430000, stock: 8, reorder: 3 },
      { id: 'p10', name: 'USB-C Fast Charger', sku: 'PRD-00006', barcode: '', category: 'Phone Accessories', price: 45000, cost: 27000, stock: 30, reorder: 8 },
    ]),
    ...scoped(c1, b2, [
      { id: 'p5', name: 'Premium Rice 5kg', sku: 'PRD-00007', barcode: '6202001', category: 'Groceries', price: 18700, cost: 14300, stock: 24, reorder: 12 },
      { id: 'p6', name: 'Wireless Mouse', sku: 'PRD-00008', barcode: '', category: 'Computer Accessories', price: 38000, cost: 24000, stock: 15, reorder: 5 },
    ]),
    ...scoped(c2, b3, [
      { id: 'p7', name: 'A4 Paper Box', sku: 'PRD-00001', barcode: '7301001', category: 'Paper', price: 68000, cost: 52000, stock: 17, reorder: 6 },
      { id: 'p8', name: 'Ink Cartridge', sku: 'PRD-00002', barcode: '7301002', category: 'Printing', price: 95000, cost: 71000, stock: 4, reorder: 5 },
    ]),
  ],
  customers: [
    ...scoped(c1, b1, [{ id: 'cu1', name: 'Mlimani Cafe', phone: '+255 713 222 001', email: 'orders@mlimani.tz', spent: 814000 }, { id: 'cu2', name: 'Walk-in Customer', phone: '-', email: '-', spent: 2400000 }]),
    ...scoped(c1, b2, [{ id: 'cu3', name: 'Kariakoo Guest', phone: '+255 716 400 112', email: '-', spent: 346000 }]),
    ...scoped(c2, b3, [{ id: 'cu4', name: 'Dodoma Legal Partners', phone: '+255 743 100 100', email: 'office@dlp.tz', spent: 1260000 }]),
  ],
  suppliers: [
    ...scoped(c1, b1, [{ id: 'su1', name: 'Tanzania Distribution Ltd', phone: '+255 712 909 800', category: 'Groceries', orders: 22 }]),
    ...scoped(c1, b2, [{ id: 'su2', name: 'Coastal Wholesale', phone: '+255 717 443 881', category: 'Mixed goods', orders: 10 }]),
    ...scoped(c2, b3, [{ id: 'su3', name: 'Office World EA', phone: '+255 788 199 510', category: 'Stationery', orders: 13 }]),
  ],
  sales: [
    ...scoped(c1, b1, [
      { id: 'sale1', invoice: 'INV-00431', date: '2026-05-27T08:13:00.000Z', customer: 'Walk-in Customer', total: 109400, payment: 'Cash', status: 'Paid', items: [{ productId: 'p1', name: 'Premium Rice 5kg', qty: 2, price: 18500 }, { productId: 'p2', name: 'Sunflower Oil 3L', qty: 4, price: 16200 }] },
      { id: 'sale2', invoice: 'INV-00430', date: '2026-05-26T12:30:00.000Z', customer: 'Mlimani Cafe', total: 244800, payment: 'Mobile Money', status: 'Paid', items: [{ productId: 'p2', name: 'Sunflower Oil 3L', qty: 12, price: 16200 }] },
    ]),
    ...scoped(c1, b2, [{ id: 'sale3', invoice: 'INV-00228', date: '2026-05-27T07:44:00.000Z', customer: 'Kariakoo Guest', total: 71400, payment: 'Card', status: 'Paid', items: [{ productId: 'p5', name: 'Premium Rice 5kg', qty: 3, price: 18700 }] }]),
    ...scoped(c2, b3, [{ id: 'sale4', invoice: 'INV-00091', date: '2026-05-27T09:00:00.000Z', customer: 'Dodoma Legal Partners', total: 326000, payment: 'Bank Transfer', status: 'Paid', items: [{ productId: 'p7', name: 'A4 Paper Box', qty: 2, price: 68000 }, { productId: 'p8', name: 'Ink Cartridge', qty: 2, price: 95000 }] }]),
  ],
  inventory: [
    ...scoped(c1, b1, [{ id: 'iv1', date: now, productId: 'p1', product: 'Premium Rice 5kg', type: 'Stock In', quantity: 30, supplierId: 'su1', supplier: 'Tanzania Distribution Ltd', unitCost: 14300, cost: 429000, user: 'Emmanuel Charles' }]),
    ...scoped(c1, b2, [{ id: 'iv2', date: now, productId: 'p6', product: 'Wireless Mouse', type: 'Stock In', quantity: 15, supplierId: 'su2', supplier: 'Coastal Wholesale', unitCost: 24000, cost: 360000, user: 'Neema Joseph' }]),
    ...scoped(c2, b3, [{ id: 'iv3', date: now, productId: 'p7', product: 'A4 Paper Box', type: 'Stock In', quantity: 20, supplierId: 'su3', supplier: 'Office World EA', unitCost: 52000, cost: 1040000, user: 'Emmanuel Charles' }]),
  ],
  logs: [
    ...scoped(c1, b1, [{ id: 'log1', date: now, user: 'Emmanuel Charles', role: 'Company Admin', action: 'Inventory updated', module: 'Inventory', status: 'Success' }]),
    ...scoped(c2, b3, [{ id: 'log2', date: now, user: 'Emmanuel Charles', role: 'Cashier', action: 'Sale completed', module: 'POS', status: 'Success' }]),
  ],
  settings: [
    { id: 'set1', companyId: c1, currency: 'TZS', language: 'English', timezone: 'Africa/Dar_es_Salaam', theme: 'light', tax: 18 },
    { id: 'set2', companyId: c2, currency: 'TZS', language: 'English', timezone: 'Africa/Dar_es_Salaam', theme: 'light', tax: 18 },
  ],
})

export const roleDefaults = {
  'Company Admin': ALL_PERMISSIONS,
  'Branch Manager': MANAGER_PERMISSIONS,
  'Inventory Manager': INVENTORY_PERMISSIONS,
  Accountant: ACCOUNTANT_PERMISSIONS,
  Cashier: CASHIER_PERMISSIONS,
  'Viewer/User': ['dashboard.view', 'products.view', 'reports.view'],
}
