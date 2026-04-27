import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, LayoutDashboard, Users, Calendar, QrCode, Settings, Gift, LogOut } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/membros', label: 'Membros', icon: Users },
  { to: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { to: '/admin/aniversariantes', label: 'Aniversariantes', icon: Gift },
  { to: '/admin/ofertas', label: 'Ofertas', icon: QrCode },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { membro, signOut } = useAuth()

  return (
    <div className="flex min-h-svh bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Overlay mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuAberto(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30">
          <button
            onClick={() => setMenuAberto(true)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Admin</span>
          </div>
          <button onClick={signOut} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <LogOut size={18} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
