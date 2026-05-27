import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import { BranchSelection, CompanySelection, CompanySetup, StartPage } from '../pages/companies/SelectionPages'
import { LoadingSpinner } from '../components/UI'
import { ContextGuard, RequireAuth } from './ProtectedRoute'

const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const POSPage = lazy(() => import('../pages/pos/POSPage'))
const FinancePage = lazy(() => import('../pages/finance/FinancePage'))
const ProductsPage = lazy(() => import('../pages/products/ProductsPage'))
const InventoryPage = lazy(() => import('../pages/inventory/InventoryPage'))
const CustomersPage = lazy(() => import('../pages/customers/CustomersPage'))
const SuppliersPage = lazy(() => import('../pages/suppliers/SuppliersPage'))
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'))
const UsersPage = lazy(() => import('../pages/users/UsersPage'))
const LogsPage = lazy(() => import('../pages/logs/LogsPage'))
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'))
const BranchesPage = lazy(() => import('../pages/branches/BranchesPage'))
const SystemAdminPage = lazy(() => import('../pages/system-admin/SystemAdminPage'))

export default function App() {
  return <Suspense fallback={<LoadingSpinner />}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/start" element={<StartPage />} />
    <Route path="/select-company" element={<RequireAuth><CompanySelection /></RequireAuth>} />
    <Route path="/select-branch" element={<RequireAuth><BranchSelection /></RequireAuth>} />
    <Route path="/company-setup" element={<RequireAuth><CompanySetup /></RequireAuth>} />
    <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
      <Route path="/system-admin" element={<ContextGuard systemOnly><SystemAdminPage /></ContextGuard>} />
      <Route path="/dashboard" element={<ContextGuard permission="dashboard.view"><DashboardPage /></ContextGuard>} />
      <Route path="/pos" element={<ContextGuard permission="pos.use"><POSPage /></ContextGuard>} />
      <Route path="/finance" element={<ContextGuard permission="finance.view"><FinancePage /></ContextGuard>} />
      <Route path="/products" element={<ContextGuard permission="products.view"><ProductsPage /></ContextGuard>} />
      <Route path="/inventory" element={<ContextGuard permission="inventory.view"><InventoryPage /></ContextGuard>} />
      <Route path="/customers" element={<ContextGuard permission="customers.view"><CustomersPage /></ContextGuard>} />
      <Route path="/suppliers" element={<ContextGuard permission="suppliers.view"><SuppliersPage /></ContextGuard>} />
      <Route path="/reports" element={<ContextGuard permission="reports.view"><ReportsPage /></ContextGuard>} />
      <Route path="/users" element={<ContextGuard permission="users.view"><UsersPage /></ContextGuard>} />
      <Route path="/branches" element={<ContextGuard permission="settings.manage"><BranchesPage /></ContextGuard>} />
      <Route path="/logs" element={<ContextGuard permission="logs.view"><LogsPage /></ContextGuard>} />
      <Route path="/settings" element={<ContextGuard permission="settings.manage"><SettingsPage /></ContextGuard>} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes></Suspense>
}
