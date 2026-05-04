import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, QrCode,
  Settings, Gift, LogOut, ChevronRight, UserCircle, Download,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { usePWAInstall } from '../../hooks/usePWAInstall'
import Avatar from '../ui/Avatar'

const ROLES_DUPLO_ACESSO = ['super_admin', 'admin', 'lideranca']

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/membros', label: 'Membros', icon: Users },
  { to: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { to: '/admin/aniversariantes', label: 'Aniversariantes', icon: Gift },
  { to: '/admin/ofertas', label: 'Ofertas', icon: QrCode },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AdminSidebar() {
  const { membro, signOut } = useAuth()
  const navigate = useNavigate()
  const temDuploAcesso = ROLES_DUPLO_ACESSO.includes(membro?.role)
  const { podeInstalar, instalado, instalar, isIOS, isStandalone } = usePWAInstall()
  const [mostrarDicaIOS, setMostrarDicaIOS] = useState(false)

  return (
    <aside className="w-64 shrink-0 bg-gradient-to-b from-blue-950 to-blue-900 min-h-svh flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-blue-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              {membro?.igrejas?.nome ?? 'Igreja'}
            </p>
            <p className="text-blue-300 text-xs">Administração</p>
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
              ${isActive
                ? 'bg-white/15 text-white'
                : 'text-blue-200 hover:bg-white/8 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-blue-800/50">
        <div className="flex items-center gap-3 px-2 mb-2">
          <Avatar nome={membro?.nome_completo} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{membro?.nome_completo}</p>
            <p className="text-blue-300 text-xs capitalize">{membro?.role}</p>
          </div>
        </div>
        {temDuploAcesso && (
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-blue-200 hover:text-white border border-blue-700/50 hover:border-blue-500/60 hover:bg-white/8 rounded-xl text-sm transition-colors"
          >
            <UserCircle size={16} />
            Ver como membro
          </button>
        )}
        {/* Botão instalar PWA — Android/Chrome */}
        {podeInstalar && !instalado && (
          <button
            onClick={instalar}
            className="w-full flex items-center gap-2 px-3 py-2 mb-1 text-emerald-300 hover:text-emerald-100 border border-emerald-700/40 hover:border-emerald-500/60 hover:bg-white/8 rounded-xl text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Instalar App
          </button>
        )}

        {/* Botão instalar PWA — iOS */}
        {isIOS && !isStandalone && !instalado && (
          <div className="mb-1">
            <button
              onClick={() => setMostrarDicaIOS(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 text-emerald-300 hover:text-emerald-100 border border-emerald-700/40 hover:border-emerald-500/60 hover:bg-white/8 rounded-xl text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Instalar App
            </button>
            {mostrarDicaIOS && (
              <div className="mt-1 mx-1 px-3 py-2 bg-white/8 border border-emerald-700/30 rounded-xl text-xs text-emerald-200 leading-relaxed">
                Toque em <strong>Compartilhar</strong> (□↑) e selecione <strong>"Adicionar à Tela de Início"</strong>
              </div>
            )}
          </div>
        )}

        {instalado && (
          <p className="text-xs text-emerald-400 text-center px-3 py-2">✓ App instalado</p>
        )}

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-blue-200 hover:text-white hover:bg-white/8 rounded-xl text-sm transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
