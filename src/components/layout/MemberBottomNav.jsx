import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, CreditCard, QrCode, Bell } from 'lucide-react'
import { useNotificacoes } from '../../hooks/useNotificacoes'

const navItems = [
  { to: '/dashboard', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/dashboard/calendario', label: 'Agenda', icon: Calendar },
  { to: '/dashboard/carteira', label: 'Carteira', icon: CreditCard },
  { to: '/dashboard/ofertas', label: 'Ofertas', icon: QrCode },
  { to: '/dashboard/notificacoes', label: 'Avisos', icon: Bell },
]

export default function MemberBottomNav() {
  const { naoLidas } = useNotificacoes()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 pb-safe">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-0 flex-1
              text-xs font-medium transition-colors duration-150
              ${isActive ? 'text-blue-800' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon
                    size={22}
                    className={isActive ? 'text-blue-800' : 'text-gray-400'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {to.includes('notificacoes') && naoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                      {naoLidas > 9 ? '9+' : naoLidas}
                    </span>
                  )}
                </div>
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
