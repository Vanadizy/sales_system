import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import { Avatar, Toasts } from '../components/UI'
import { BranchSwitcher, CompanySwitcher } from '../components/Switchers'

export default function AppLayout() {
  const [sidebar, setSidebar] = useState(false)
  const [dark, setDark] = useState(false)
  const { account, activeCompany, activeBranch, role, logout, setSession } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => setSession((previous) => ({ ...previous, lastVisitedRoute: location.pathname })), [location.pathname, setSession])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return <div className="min-h-screen"><Sidebar open={sidebar} onClose={() => setSidebar(false)} /><div className="lg:pl-72"><header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur dark:bg-slate-900/95 sm:px-6"><div className="flex items-center gap-3"><button className="rounded-xl border p-2 lg:hidden" onClick={() => setSidebar(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="hidden md:block"><p className="text-sm font-semibold">Welcome, {account?.fullName}</p><p className="text-xs text-slate-500">{activeCompany?.name || 'Platform'}{activeBranch ? ` / ${activeBranch.name}` : ''}</p></div></div><div className="flex items-center gap-2"><CompanySwitcher /><BranchSwitcher /><button className="rounded-xl border p-2.5" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><div className="ml-1 hidden items-center gap-2 sm:flex"><Avatar name={account?.fullName} /><div className="hidden xl:block"><p className="text-sm font-medium">{account?.fullName}</p><p className="text-xs text-slate-500">{role}</p></div></div><button className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => { logout(); navigate('/login') }} aria-label="Logout"><LogOut size={19} /></button></div></header><main className="p-4 sm:p-6 lg:p-8"><Outlet /></main></div><Toasts /></div>
}
