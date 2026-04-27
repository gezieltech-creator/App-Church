import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import MemberSidebar from './MemberSidebar'
import MemberBottomNav from './MemberBottomNav'
import { useAuth } from '../../hooks/useAuth'
import { useNotificacoes } from '../../hooks/useNotificacoes'

export default function MemberLayout() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { membro } = useAuth()
  const { naoLidas } = useNotificacoes()

  return (
    <div className="flex min-h-svh bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden lg:block sticky top-0 h-svh">
        <MemberSidebar />
      </div>

      {/* Overlay mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuAberto(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <MemberSidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button onClick={() => setMenuAberto(true)} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {membro?.igrejas?.nome ?? 'Igreja'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <NavLink to="/dashboard/notificacoes" className="relative p-2 rounded-xl hover:bg-gray-50 text-gray-500">
              <Bell size={18} />
              {naoLidas > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav mobile */}
      <MemberBottomNav />
    </div>
  )
}
