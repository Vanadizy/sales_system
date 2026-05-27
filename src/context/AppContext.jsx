import { createContext, useContext, useEffect, useState } from 'react'
import { createSeedData, roleDefaults } from '../mockData/seed'
import { cleanText, comparableText, newId, nextCode } from '../utils/format'

const STORE_KEY = 'axispos.prototype.v1'
const SESSION_KEY = 'axispos.session.v1'
const AppContext = createContext(null)
const addPermissions = (permissions = [], additions = []) => [...new Set([...permissions, ...additions])]

const read = (key, fallback) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

const upgradeStoredData = (stored) => {
  const accounts = stored.accounts.map((row) => row.systemAdmin && row.email === 'admin@axispos.app'
    ? { ...row, email: 'admin@salesmanagement.app' }
    : row)
  const users = stored.users.map((row) => ['Company Admin', 'Branch Manager', 'Accountant'].includes(row.role)
    ? { ...row, permissions: addPermissions(row.permissions, ['finance.view', 'finance.receive']) }
    : row)
  const hasSampleCompany = stored.companies.some((row) => row.id === 'cmp-axis')
  const financeAccount = accounts.find((row) => row.email === 'finance@axis.co.tz') || {
    id: 'acc-finance',
    fullName: 'Grace Mhando',
    email: 'finance@axis.co.tz',
    password: 'Finance123!',
    avatar: '',
    status: 'Active',
  }

  if (hasSampleCompany && !accounts.some((row) => row.email === financeAccount.email)) {
    accounts.push(financeAccount)
  }
  if (
    hasSampleCompany
    && stored.branches.some((row) => row.id === 'br-axis-hq')
    && !users.some((row) => row.accountId === financeAccount.id && row.companyId === 'cmp-axis')
  ) {
    users.push({
      id: 'usr-finance',
      accountId: financeAccount.id,
      companyId: 'cmp-axis',
      branchIds: ['br-axis-hq'],
      role: 'Accountant',
      permissions: roleDefaults.Accountant,
      status: 'Active',
    })
  }

  return {
    ...stored,
    accounts,
    users,
    sales: stored.sales.map((row) => {
      if (row.id === 'sale1') return { ...row, subtotal: 101800, discount: 0, tax: 0, total: 101800, paidAt: row.paidAt || '2026-05-27T08:16:00.000Z', receivedBy: row.receivedBy || 'Grace Mhando' }
      if (row.id === 'sale2') return { ...row, subtotal: 194400, discount: 0, tax: 0, total: 194400, paidAt: row.paidAt || '2026-05-26T12:34:00.000Z', receivedBy: row.receivedBy || 'Grace Mhando' }
      if (row.id === 'sale3') return { ...row, subtotal: 56100, discount: 0, tax: 0, total: 56100, paidAt: row.paidAt || '2026-05-27T07:48:00.000Z', receivedBy: row.receivedBy || 'Neema Joseph' }
      if (row.id === 'sale4') return { ...row, subtotal: 326000, discount: 0, tax: 0, total: 326000, paidAt: row.paidAt || '2026-05-27T09:03:00.000Z', receivedBy: row.receivedBy || 'Emmanuel Charles' }
      return row
    }),
    inventory: stored.inventory.map((row) => {
      if (row.id === 'iv1') return { ...row, productId: 'p1', supplierId: 'su1', unitCost: 14300 }
      if (row.id === 'iv2') return { ...row, product: 'Wireless Mouse', productId: 'p6', supplierId: 'su2', unitCost: 24000, cost: 360000 }
      if (row.id === 'iv3') return { ...row, productId: 'p7', supplierId: 'su3', unitCost: 52000 }
      return row
    }),
  }
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => upgradeStoredData(read(STORE_KEY, createSeedData())))
  const [session, setSession] = useState(() => read(SESSION_KEY, { accountId: null, activeCompanyId: null, activeBranchId: null, lastVisitedRoute: '/dashboard' }))
  const [toasts, setToasts] = useState([])

  useEffect(() => localStorage.setItem(STORE_KEY, JSON.stringify(data)), [data])
  useEffect(() => localStorage.setItem(SESSION_KEY, JSON.stringify(session)), [session])

  const account = data.accounts.find((row) => row.id === session.accountId)
  const isSystemAdmin = Boolean(account?.systemAdmin)
  const memberships = isSystemAdmin ? [] : data.users.filter((row) => row.accountId === session.accountId && row.status === 'Active')
  const activeCompany = isSystemAdmin ? null : data.companies.find((row) => row.id === session.activeCompanyId)
  const activeBranch = isSystemAdmin ? null : data.branches.find((row) => row.id === session.activeBranchId)
  const membership = isSystemAdmin ? null : data.users.find((row) => row.accountId === session.accountId && row.companyId === session.activeCompanyId)
  const role = isSystemAdmin ? 'System Admin' : membership?.role

  const notify = (message, type = 'success') => {
    const id = newId('toast')
    setToasts((rows) => [...rows, { id, message, type }])
    window.setTimeout(() => setToasts((rows) => rows.filter((row) => row.id !== id)), 3200)
  }

  const companyBranches = (companyId = session.activeCompanyId) => data.branches.filter((row) => row.companyId === companyId)
  const availableCompanies = isSystemAdmin ? [] : data.companies.filter((company) => company.status === 'Active' && memberships.some((row) => row.companyId === company.id))
  const availableBranches = isSystemAdmin ? [] : companyBranches().filter((branch) => branch.status === 'Active' && membership?.branchIds.includes(branch.id))

  const can = (permission) => !isSystemAdmin && (membership?.permissions.includes('*') || membership?.permissions.includes(permission))
  const nextProductCode = (additional = []) => nextCode('PRD', [
    ...data.products.filter((row) => row.companyId === session.activeCompanyId).map((row) => row.sku),
    ...additional,
  ])
  const nextBranchCode = (companyId) => nextCode('BR', data.branches.filter((row) => row.companyId === companyId).map((row) => row.code), 4)

  const appendLog = (action, module, override = {}) => {
    const companyId = override.companyId || session.activeCompanyId
    const branchId = override.branchId || session.activeBranchId
    if (!companyId || !branchId) return
    setData((prev) => ({
      ...prev,
      logs: [{
        id: newId('log'), companyId, branchId, date: new Date().toISOString(),
        user: account?.fullName || 'System', role: role || 'System Admin', action, module, status: 'Success',
      }, ...prev.logs],
    }))
  }

  const login = (email, password) => {
    const found = data.accounts.find((row) => row.email.toLowerCase() === email.toLowerCase() && row.password === password && row.status === 'Active')
    if (!found) return { ok: false, message: 'Invalid credentials or inactive user.' }
    setSession({ accountId: found.id, activeCompanyId: null, activeBranchId: null, lastVisitedRoute: '/dashboard' })
    return { ok: true, account: found }
  }

  const registerBusiness = ({ owner, company: companyValues, branch: branchValues }) => {
    const email = owner.email.trim().toLowerCase()
    if (data.accounts.some((row) => row.email.toLowerCase() === email)) {
      return { ok: false, message: 'An account already exists with this email address.' }
    }
    const accountId = newId('acc'), companyId = newId('cmp'), branchId = newId('br')
    const registeredAt = new Date().toISOString().slice(0, 10)
    const createdAccount = { id: accountId, fullName: owner.fullName.trim(), email, phone: owner.phone.trim(), password: owner.password, avatar: owner.avatar || '', status: 'Active' }
    const company = { id: companyId, companyId, ...companyValues, email: companyValues.email.trim().toLowerCase(), status: 'Active', owner: createdAccount.fullName, registeredAt }
    const branch = { id: branchId, companyId, ...branchValues, code: 'BR-0001', managerId: accountId, manager: createdAccount.fullName, status: 'Active' }
    const membership = { id: newId('usr'), accountId, companyId, branchIds: [branchId], role: 'Company Admin', permissions: roleDefaults['Company Admin'], status: 'Active' }
    const log = { id: newId('log'), companyId, branchId, date: new Date().toISOString(), user: createdAccount.fullName, role: 'Company Admin', action: 'Company registered', module: 'Companies', status: 'Success' }
    setData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, createdAccount],
      companies: [...prev.companies, company],
      branches: [...prev.branches, branch],
      users: [...prev.users, membership],
      logs: [log, ...prev.logs],
      settings: [...prev.settings, { id: newId('set'), companyId, currency: companyValues.currency, language: 'English', timezone: 'Africa/Dar_es_Salaam', theme: 'light', tax: null }],
    }))
    setSession({ accountId, activeCompanyId: companyId, activeBranchId: branchId, lastVisitedRoute: '/dashboard' })
    notify('Business account created successfully.')
    return { ok: true }
  }

  const logout = () => {
    appendLog('Logout', 'Authentication')
    setSession({ accountId: null, activeCompanyId: null, activeBranchId: null, lastVisitedRoute: '/dashboard' })
  }

  const switchCompany = (companyId) => {
    if (isSystemAdmin) return false
    const target = data.companies.find((row) => row.id === companyId)
    const permitted = target?.status === 'Active' && memberships.some((row) => row.companyId === companyId)
    if (!permitted) return false
    const userMembership = data.users.find((row) => row.accountId === session.accountId && row.companyId === companyId)
    const branches = data.branches.filter((row) => row.companyId === companyId && userMembership?.branchIds.includes(row.id))
    const branchId = branches.length === 1 ? branches[0].id : null
    setSession((prev) => ({ ...prev, activeCompanyId: companyId, activeBranchId: branchId }))
    if (branchId) appendLog(session.activeCompanyId ? 'Company switched' : 'Login', session.activeCompanyId ? 'Companies' : 'Authentication', { companyId, branchId })
    return branchId
  }

  const switchBranch = (branchId) => {
    if (isSystemAdmin) return false
    const permitted = availableBranches.some((branch) => branch.id === branchId)
    if (!permitted) return false
    setSession((prev) => ({ ...prev, activeBranchId: branchId }))
    appendLog(session.activeBranchId ? 'Branch switched' : 'Login', session.activeBranchId ? 'Branches' : 'Authentication', { branchId })
    return true
  }

  const scoped = (collection, branchRequired = true) =>
    data[collection].filter((row) => row.companyId === session.activeCompanyId && (!branchRequired || row.branchId === session.activeBranchId))

  const addRecord = (collection, values, action, module) => {
    const record = { id: newId(collection.slice(0, 2)), companyId: session.activeCompanyId, branchId: session.activeBranchId, ...values }
    setData((prev) => ({ ...prev, [collection]: [record, ...prev[collection]] }))
    appendLog(action, module)
    notify(`${module} saved successfully.`)
    return record
  }

  const normalizeProduct = (values) => ({
    ...values,
    name: cleanText(values.name),
    category: cleanText(values.category) || 'General',
    barcode: cleanText(values.barcode),
    price: Number(values.price),
    cost: Number(values.cost),
    stock: Number(values.stock),
    reorder: Number(values.reorder),
  })
  const validateProduct = (product, excludeId = null, pending = []) => {
    if (!product.name) return 'Product name is required.'
    if (![product.price, product.cost, product.stock, product.reorder].every((value) => Number.isFinite(value) && value >= 0)) {
      return 'Selling price, cost, stock and reorder level must be valid non-negative numbers.'
    }
    if (!Number.isInteger(product.stock) || !Number.isInteger(product.reorder)) return 'Stock and reorder level must be whole numbers.'
    if (product.cost > product.price) return 'Purchase cost cannot exceed the selling price.'
    const candidates = [
      ...data.products.filter((row) => row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId && row.id !== excludeId),
      ...pending,
    ]
    if (candidates.some((row) => comparableText(row.name) === comparableText(product.name))) {
      return `A product named "${product.name}" already exists in this branch.`
    }
    if (product.barcode && candidates.some((row) => row.barcode && cleanText(row.barcode) === product.barcode)) {
      return `Barcode "${product.barcode}" is already assigned to another product in this branch.`
    }
    return null
  }
  const addProduct = (values) => {
    const product = normalizeProduct(values)
    const error = validateProduct(product)
    if (error) {
      notify(error, 'warning')
      return false
    }
    addRecord('products', { ...product, sku: nextProductCode() }, 'Product added', 'Products')
    return true
  }
  const updateProduct = (id, values) => {
    const current = data.products.find((row) => row.id === id && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId)
    const product = normalizeProduct({ ...values, cost: current?.cost ?? values.cost, stock: current?.stock ?? values.stock })
    const error = validateProduct(product, id)
    if (error) {
      notify(error, 'warning')
      return false
    }
    setData((prev) => ({
      ...prev,
      products: prev.products.map((row) => row.id === id && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId ? { ...row, ...product } : row),
      inventory: prev.inventory.map((row) =>
        row.companyId === session.activeCompanyId
        && row.branchId === session.activeBranchId
        && (row.productId === id || (!row.productId && comparableText(row.product) === comparableText(current?.name)))
          ? { ...row, productId: id, product: product.name }
          : row),
    }))
    appendLog('Product edited', 'Products')
    notify('Product updated.')
    return true
  }
  const importProducts = (values) => {
    const generated = []
    const records = []
    for (const valuesRow of values) {
      const product = normalizeProduct(valuesRow)
      const error = validateProduct(product, null, records)
      if (error) {
        notify(`Product import failed: ${error}`, 'warning')
        return false
      }
      const sku = nextProductCode(generated)
      generated.push(sku)
      records.push({ id: newId('pr'), companyId: session.activeCompanyId, branchId: session.activeBranchId, ...product, sku })
    }
    setData((prev) => ({ ...prev, products: [...records, ...prev.products] }))
    appendLog(`${records.length} products imported`, 'Products')
    notify(`${records.length} products imported successfully.`)
    return records
  }
  const updateRecord = (collection, id, values, action, module) => {
    setData((prev) => ({ ...prev, [collection]: prev[collection].map((row) => row.id === id && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId ? { ...row, ...values } : row) }))
    appendLog(action, module)
    notify(`${module} updated.`)
  }
  const normalizeSupplier = (values) => ({
    ...values,
    name: cleanText(values.name),
    phone: cleanText(values.phone),
    category: cleanText(values.category) || 'General',
    orders: Number(values.orders) || 0,
  })
  const validateSupplier = (supplier, excludeId = null) => {
    if (!supplier.name) return 'Supplier name is required.'
    if (!supplier.phone) return 'Supplier phone is required.'
    if (data.suppliers.some((row) =>
      row.companyId === session.activeCompanyId
      && row.branchId === session.activeBranchId
      && row.id !== excludeId
      && comparableText(row.name) === comparableText(supplier.name))) {
      return `A supplier named "${supplier.name}" already exists in this branch.`
    }
    return null
  }
  const addSupplier = (values) => {
    const supplier = normalizeSupplier(values)
    const error = validateSupplier(supplier)
    if (error) {
      notify(error, 'warning')
      return false
    }
    addRecord('suppliers', supplier, 'Supplier added', 'Suppliers')
    return true
  }
  const updateSupplier = (id, values) => {
    const supplier = normalizeSupplier(values)
    const error = validateSupplier(supplier, id)
    if (error) {
      notify(error, 'warning')
      return false
    }
    updateRecord('suppliers', id, supplier, 'Supplier edited', 'Suppliers')
    return true
  }
  const deleteRecord = (collection, id, action, module) => {
    setData((prev) => ({ ...prev, [collection]: prev[collection].filter((row) => !(row.id === id && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId)) }))
    appendLog(action, module)
    notify(`${module} deleted.`, 'warning')
  }

  const pendingQuantities = (branchId = session.activeBranchId) => data.sales
    .filter((sale) => sale.companyId === session.activeCompanyId && sale.branchId === branchId && sale.status === 'Awaiting Payment')
    .flatMap((sale) => sale.items || [])
    .reduce((totals, item) => {
      totals[item.productId] = (totals[item.productId] || 0) + Number(item.qty || 0)
      return totals
    }, {})
  const availableForSale = (productId) => {
    const product = data.products.find((row) => row.id === productId && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId)
    return product ? Math.max(0, Number(product.stock || 0) - Number(pendingQuantities()[productId] || 0)) : 0
  }
  const initiatePayment = (sale) => {
    if (!sale.items?.length) {
      notify('Add products before initiating a payment.', 'warning')
      return false
    }
    const unavailable = sale.items.find((item) => !Number.isInteger(Number(item.qty)) || Number(item.qty) <= 0 || Number(item.qty) > availableForSale(item.productId))
    if (unavailable) {
      notify(`Available quantity is no longer sufficient for ${unavailable.name}. Review the cart and try again.`, 'warning')
      return false
    }
    const invoice = nextCode('INV', data.sales.filter((row) => row.branchId === session.activeBranchId).map((row) => row.invoice))
    const record = {
      id: newId('sa'),
      companyId: session.activeCompanyId,
      branchId: session.activeBranchId,
      ...sale,
      invoice,
      date: new Date().toISOString(),
      status: 'Awaiting Payment',
      initiatedBy: account.fullName,
    }
    setData((prev) => ({ ...prev, sales: [record, ...prev.sales] }))
    appendLog(`Payment initiated: ${invoice}`, 'POS')
    notify(`${invoice} sent to Finance for payment confirmation.`)
    return record
  }
  const confirmPayment = (saleId, paymentDetails) => {
    const sale = data.sales.find((row) => row.id === saleId && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId)
    if (!sale || sale.status !== 'Awaiting Payment') {
      notify('Only awaiting-payment invoices can be confirmed.', 'warning')
      return false
    }
    const receivedAmount = Number(paymentDetails.receivedAmount)
    if (!Number.isFinite(receivedAmount) || receivedAmount < Number(sale.total)) {
      notify('Received amount must cover the total amount due.', 'warning')
      return false
    }
    const unavailable = sale.items.find((item) => {
      const product = data.products.find((row) => row.id === item.productId && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId)
      return !product || Number(product.stock) < Number(item.qty)
    })
    if (unavailable) {
      notify(`Payment cannot be confirmed because stock is insufficient for ${unavailable.name}.`, 'warning')
      return false
    }
    const paidAt = new Date().toISOString()
    setData((prev) => ({
      ...prev,
      sales: prev.sales.map((row) => row.id === saleId
        ? {
          ...row,
          status: 'Paid',
          payment: paymentDetails.payment || row.payment,
          paymentReference: cleanText(paymentDetails.reference),
          receivedAmount,
          changeDue: Math.max(0, receivedAmount - Number(row.total)),
          paidAt,
          receivedBy: account.fullName,
        }
        : row),
      products: prev.products.map((product) => {
        const line = sale.items.find((item) => item.productId === product.id)
        return line && product.branchId === session.activeBranchId ? { ...product, stock: product.stock - line.qty } : product
      }),
    }))
    appendLog(`Payment received: ${sale.invoice}`, 'Finance')
    notify(`Payment confirmed for ${sale.invoice}. Stock has been updated.`)
    return true
  }
  const prepareReceipt = (values) => {
    const product = data.products.find((row) => row.id === values.productId && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId)
    const supplier = data.suppliers.find((row) => row.id === values.supplierId && row.companyId === session.activeCompanyId && row.branchId === session.activeBranchId)
    const quantity = Number(values.quantity)
    const unitCost = Number(values.unitCost)
    if (!product) return { error: 'Select a product registered in this branch.' }
    if (!supplier) return { error: 'Select a supplier registered in this branch.' }
    if (!Number.isInteger(quantity) || quantity <= 0) return { error: 'Quantity received must be a whole number greater than zero.' }
    if (!Number.isFinite(unitCost) || unitCost < 0) return { error: 'Unit cost must be a valid non-negative number.' }
    if (unitCost > product.price) return { error: `Unit cost for ${product.name} cannot exceed its selling price.` }
    return {
      product,
      supplier,
      record: {
        id: newId('iv'),
        companyId: session.activeCompanyId,
        branchId: session.activeBranchId,
        productId: product.id,
        supplierId: supplier.id,
        date: values.date || new Date().toISOString(),
        product: product.name,
        type: 'Stock In',
        quantity,
        supplier: supplier.name,
        unitCost,
        cost: unitCost * quantity,
        user: account.fullName,
      },
    }
  }
  const receiveInventory = (values) => {
    const receipt = prepareReceipt(values)
    if (receipt.error) {
      notify(receipt.error, 'warning')
      return false
    }
    setData((prev) => ({
      ...prev,
      inventory: [receipt.record, ...prev.inventory],
      products: prev.products.map((product) => product.id === receipt.product.id
        ? { ...product, stock: product.stock + receipt.record.quantity, cost: receipt.record.unitCost }
        : product),
      suppliers: prev.suppliers.map((supplier) => supplier.id === receipt.supplier.id
        ? { ...supplier, orders: Number(supplier.orders || 0) + 1 }
        : supplier),
    }))
    appendLog('Stock receipt posted', 'Inventory')
    notify('Stock received. The latest product cost has been updated.')
    return true
  }
  const importInventory = (entries) => {
    const prepared = []
    for (const entry of entries) {
      const receipt = prepareReceipt(entry)
      if (receipt.error) {
        notify(`Inventory import failed: ${receipt.error}`, 'warning')
        return false
      }
      prepared.push(receipt)
    }
    const ordered = prepared.sort((left, right) => new Date(left.record.date) - new Date(right.record.date))
    const increments = {}
    const latestCosts = {}
    const supplierOrders = {}
    ordered.forEach(({ record }) => {
      increments[record.productId] = (increments[record.productId] || 0) + record.quantity
      latestCosts[record.productId] = record.unitCost
      supplierOrders[record.supplierId] = (supplierOrders[record.supplierId] || 0) + 1
    })
    const records = ordered.map(({ record }) => record).reverse()
    setData((prev) => ({
      ...prev,
      inventory: [...records, ...prev.inventory],
      products: prev.products.map((product) => increments[product.id]
        ? { ...product, stock: product.stock + increments[product.id], cost: latestCosts[product.id] }
        : product),
      suppliers: prev.suppliers.map((supplier) => supplierOrders[supplier.id]
        ? { ...supplier, orders: Number(supplier.orders || 0) + supplierOrders[supplier.id] }
        : supplier),
    }))
    appendLog(`${records.length} inventory receipts imported`, 'Inventory')
    notify(`${records.length} inventory receipts imported. Latest product costs updated.`)
    return true
  }

  const createCompany = (values) => {
    const companyId = newId('cmp'), branchId = newId('br')
    const company = { id: companyId, companyId, ...values, status: 'Active', owner: account.fullName, registeredAt: new Date().toISOString().slice(0, 10) }
    const branch = { id: branchId, companyId, name: 'Main Branch', code: 'BR-0001', address: values.address, phone: values.phone, managerId: account.id, manager: account.fullName, status: 'Active' }
    setData((prev) => ({
      ...prev,
      companies: [...prev.companies, company], branches: [...prev.branches, branch],
      users: [...prev.users, { id: newId('usr'), accountId: account.id, companyId, branchIds: [branchId], role: 'Company Admin', permissions: roleDefaults['Company Admin'], status: 'Active' }],
      settings: [...prev.settings, { id: newId('set'), companyId, currency: values.currency, language: 'English', timezone: 'Africa/Dar_es_Salaam', theme: 'light', tax: null }],
    }))
    setSession((prev) => ({ ...prev, activeCompanyId: companyId, activeBranchId: branchId }))
    notify('Company profile created.')
  }

  const saveMembership = (values) => {
    const email = cleanText(values.email).toLowerCase()
    const fullName = cleanText(values.fullName)
    const userAccount = data.accounts.find((a) => a.email.toLowerCase() === email)
    if (!fullName || !email) return { ok: false, message: 'Full name and email are required.' }
    if (!values.branchIds?.length) return { ok: false, message: 'Assign at least one branch to this user.' }
    if (userAccount && userAccount.status !== 'Active') return { ok: false, message: 'This account is inactive and cannot be assigned until it is activated.' }
    if (userAccount && data.users.some((row) => row.companyId === session.activeCompanyId && row.accountId === userAccount.id)) {
      return { ok: false, message: 'This user already has access to the selected company.' }
    }
    if (!userAccount && (!values.password || values.password.length < 8)) {
      return { ok: false, message: 'Set a password with at least 8 characters for the new user.' }
    }
    if (!userAccount && values.password !== values.confirmPassword) {
      return { ok: false, message: 'Passwords do not match.' }
    }
    const accountId = userAccount?.id || newId('acc')
    setData((prev) => ({
      ...prev,
      accounts: userAccount ? prev.accounts : [...prev.accounts, { id: accountId, fullName, email, password: values.password, avatar: '', status: 'Active' }],
      users: [...prev.users, { id: newId('usr'), accountId, companyId: session.activeCompanyId, branchIds: values.branchIds, role: values.role, permissions: values.permissions, status: 'Active' }],
    }))
    appendLog(userAccount ? 'User assigned' : 'User created', 'Users')
    notify(userAccount ? 'Existing user assigned to this company.' : 'User account created and assigned.')
    return { ok: true }
  }

  const updateMembership = (id, values) => {
    setData((prev) => ({ ...prev, users: prev.users.map((row) => row.id === id ? { ...row, ...values } : row) }))
    appendLog('Permission changed', 'Users')
    notify('User access updated.')
  }

  const updateCompany = (values) => {
    setData((prev) => ({
      ...prev,
      companies: prev.companies.map((row) => row.id === session.activeCompanyId ? { ...row, ...values } : row),
      settings: prev.settings.map((row) => row.companyId === session.activeCompanyId ? { ...row, ...values } : row),
    }))
    appendLog('Settings updated', 'Settings')
    notify('Settings saved.')
  }

  const resolveBranchValues = (values, excludeId = null) => {
    const name = cleanText(values.name)
    const address = cleanText(values.address)
    const phone = cleanText(values.phone)
    const managerMembership = data.users.find((row) => row.id === values.managerMembershipId && row.companyId === session.activeCompanyId)
    const managerAccount = data.accounts.find((row) => row.id === managerMembership?.accountId)
    if (!name || !address || !phone) return { error: 'Branch name, address and phone are required.' }
    if (!managerMembership || managerMembership.status !== 'Active' || !managerAccount) return { error: 'Select an active company user as branch manager.' }
    if (data.branches.some((row) =>
      row.companyId === session.activeCompanyId
      && row.id !== excludeId
      && comparableText(row.name) === comparableText(name))) {
      return { error: `A branch named "${name}" already exists in this company.` }
    }
    return { name, address, phone, status: values.status || 'Active', managerMembership, managerAccount }
  }

  const addBranch = (values) => {
    const branchValues = resolveBranchValues(values)
    if (branchValues.error) {
      notify(branchValues.error, 'warning')
      return false
    }
    const id = newId('br')
    const branch = {
      id, companyId: session.activeCompanyId, code: nextBranchCode(session.activeCompanyId),
      name: branchValues.name, address: branchValues.address, phone: branchValues.phone, status: branchValues.status,
      managerId: branchValues.managerMembership.accountId, manager: branchValues.managerAccount.fullName,
    }
    setData((prev) => ({
      ...prev,
      branches: [...prev.branches, branch],
      users: prev.users.map((user) => user.id === branchValues.managerMembership.id && !user.branchIds.includes(id)
        ? { ...user, branchIds: [...user.branchIds, id] }
        : user),
    }))
    appendLog('Branch created', 'Branches')
    notify('Branch created.')
    return true
  }

  const updateBranch = (id, values) => {
    const branch = data.branches.find((row) => row.id === id && row.companyId === session.activeCompanyId)
    if (!branch) {
      notify('Branch could not be found.', 'warning')
      return false
    }
    const branchValues = resolveBranchValues(values, id)
    if (branchValues.error) {
      notify(branchValues.error, 'warning')
      return false
    }
    if (id === session.activeBranchId && branchValues.status !== 'Active') {
      notify('Switch to another branch before making the selected branch inactive.', 'warning')
      return false
    }
    setData((prev) => ({
      ...prev,
      branches: prev.branches.map((row) => row.id === id
        ? {
          ...row,
          name: branchValues.name,
          address: branchValues.address,
          phone: branchValues.phone,
          status: branchValues.status,
          managerId: branchValues.managerMembership.accountId,
          manager: branchValues.managerAccount.fullName,
        }
        : row),
      users: prev.users.map((user) => user.id === branchValues.managerMembership.id && !user.branchIds.includes(id)
        ? { ...user, branchIds: [...user.branchIds, id] }
        : user),
    }))
    appendLog('Branch updated', 'Branches')
    notify('Branch updated.')
    return true
  }

  const deleteBranch = (id) => {
    const branch = data.branches.find((row) => row.id === id && row.companyId === session.activeCompanyId)
    if (!branch) {
      notify('Branch could not be found.', 'warning')
      return false
    }
    if (companyBranches().length === 1) {
      notify('The only branch in a company cannot be deleted.', 'warning')
      return false
    }
    if (id === session.activeBranchId) {
      notify('Switch to another branch before deleting the selected branch.', 'warning')
      return false
    }
    const restrictedCollections = ['products', 'inventory', 'sales', 'customers', 'suppliers']
    if (restrictedCollections.some((collection) => data[collection].some((row) => row.companyId === session.activeCompanyId && row.branchId === id))) {
      notify('This branch contains operational records. Set it inactive instead of deleting it.', 'warning')
      return false
    }
    setData((prev) => ({
      ...prev,
      branches: prev.branches.filter((row) => row.id !== id),
      users: prev.users.map((user) => user.companyId === session.activeCompanyId && user.branchIds.includes(id)
        ? { ...user, branchIds: user.branchIds.filter((branchId) => branchId !== id) }
        : user),
      logs: prev.logs.filter((row) => !(row.companyId === session.activeCompanyId && row.branchId === id)),
    }))
    appendLog(`Branch deleted: ${branch.name}`, 'Branches')
    notify('Branch deleted.', 'warning')
    return true
  }

  const toggleCompany = (id) => {
    setData((prev) => ({ ...prev, companies: prev.companies.map((row) => row.id === id ? { ...row, status: row.status === 'Active' ? 'Inactive' : 'Active' } : row) }))
    notify('Company status updated.')
  }

  const resetDemo = () => {
    setData(createSeedData())
    setSession((previous) => ({ ...previous, activeCompanyId: null, activeBranchId: null, lastVisitedRoute: '/start' }))
    notify('Sample data restored.')
  }

  const value = {
    data, session, setSession, account, memberships, membership, activeCompany, activeBranch, role, isSystemAdmin,
    toasts, availableCompanies, availableBranches, companyBranches, can, login, registerBusiness, logout, switchCompany, switchBranch,
    scoped, addRecord, addProduct, updateProduct, importProducts, addSupplier, updateSupplier, updateRecord, deleteRecord, pendingQuantities, availableForSale, initiatePayment, confirmPayment, receiveInventory, importInventory, createCompany, saveMembership, updateMembership,
    updateCompany, addBranch, updateBranch, deleteBranch, toggleCompany, resetDemo, notify, appendLog,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
