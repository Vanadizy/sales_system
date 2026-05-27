import { LockKeyhole } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function RequireAuth({ children }) {
  const { account } = useApp()
  return account ? children : <Navigate to="/login" replace />
}

export function ContextGuard({ permission, children, systemOnly = false }) {
  const { account, activeCompany, activeBranch, can, isSystemAdmin } = useApp()
  if (!account) return <Navigate to="/login" replace />
  if (systemOnly) return isSystemAdmin ? children : <AccessDenied />
  if (isSystemAdmin) return <Navigate to="/system-admin" replace />
  if (!activeCompany) return <Navigate to="/select-company" replace />
  if (!activeBranch) return <Navigate to="/select-branch" replace />
  return can(permission) ? children : <AccessDenied />
}

export function AccessDenied() {
  return <div className="card mx-auto mt-16 max-w-lg py-14 text-center"><LockKeyhole className="mx-auto mb-4 text-red-500" size={38} /><h1 className="text-xl font-bold">Access Denied</h1><p className="mt-2 text-sm text-slate-500">You do not have permission to access this module in the selected company and branch.</p></div>
}
