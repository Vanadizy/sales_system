import { Building2, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function CompanySwitcher() {
  const { activeCompany, availableCompanies, isSystemAdmin, switchCompany } = useApp()
  const navigate = useNavigate()
  if (isSystemAdmin) return null
  return <label className="relative hidden min-w-48 items-center lg:flex"><Building2 className="absolute left-3 text-slate-400" size={16} /><select aria-label="Active company" className="input py-2 pl-9" value={activeCompany?.id || ''} onChange={(event) => { const branch = switchCompany(event.target.value); navigate(branch ? '/dashboard' : '/select-branch') }}><option value="" disabled>Company</option>{availableCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
}

export function BranchSwitcher() {
  const { activeBranch, availableBranches, isSystemAdmin, switchBranch } = useApp()
  const navigate = useNavigate()
  if (isSystemAdmin) return null
  return <label className="relative hidden min-w-44 items-center lg:flex"><MapPin className="absolute left-3 text-slate-400" size={16} /><select aria-label="Active branch" className="input py-2 pl-9" value={activeBranch?.id || ''} onChange={(event) => { switchBranch(event.target.value); navigate('/dashboard') }}><option value="" disabled>Branch</option>{availableBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
}
