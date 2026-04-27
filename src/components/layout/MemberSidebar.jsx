import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, CreditCard, QrCode,
  Bell, User, LogOut, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNotificacoes } from '../../hooks/useNotificacoes'
import Avatar from '../ui/Avatar'

const ROLES_DUPLO_ACESSO = ['super_admin', 'admin', 'lideranca']

const navItems = [
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/dashboard/calendario', label: 'Agenda', icon: Calendar },
  { to: '/dashboard/carteira', label: 'Carteira Digital', icon: CreditCard },
  { to: '/dashboard/ofertas', label: 'Ofertas', icon: QrCode },
  { to: '/dashboard/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
]

export default function MemberSidebar() {
  const { membro, signOut } = useAuth()
  const { naoLidas } = useNotificacoes()
  const navigate = useNavigate()
  const temDuploAcesso = ROLES_DUPLO_ACESSO.includes(membro?.role)

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 min-h-svh flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm leading-tight">
              {membro?.igrejas?.nome ?? 'Minha Igreja'}
            </p>
            <p className="text-gray-400 text-xs">Área do membro</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive ? 'bg-blue-50 text-blue-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {to.includes('notificacoes') && naoLidas > 0 && (
                  <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {naoLidas > 9 ? '9+' : naoLidas}
                  </span>
                )}
                {isActive && !to.includes('notificacoes') && (
                  <ChevronRight size={14} className="text-blue-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 mb-2">
          <Avatar nome={membro?.nome_completo} fotoUrl={membro?.foto_perfil_url} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-xs font-medium truncate">{membro?.nome_completo}</p>
            <p className="text-gray-400 text-xs capitalize">{membro?.role}</p>
          </div>
        </div>
        {temDuploAcesso && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-blue-700 hover:text-blue-900 border border-blue-100 hover:border-blue-200 hover:bg-blue-50 rounded-xl text-sm font-medium transition-colors"
          >
            <LayoutDashboard size={15} />
            Painel administrativo
          </button>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl text-sm transition-colors"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}
