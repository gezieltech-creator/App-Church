import { useEffect, useState } from 'react'
import { Calendar, Bell, Gift, ChevronRight, X, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { useNotificacoes } from '../../hooks/useNotificacoes'
import { supabase } from '../../lib/supabase'
import { formatarDataHora, aniversariantesDoMes } from '../../utils/formatters'

export default function MembroDashboard() {
  const { membro } = useAuth()
  const { notificacoes, naoLidas } = useNotificacoes()
  const [proximosEventos, setProximosEventos] = useState([])
  const [aniversariantes, setAniversariantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartazEvento, setCartazEvento] = useState(null)

  useEffect(() => {
    if (!membro?.igreja_id) return
    const agora = new Date().toISOString()

    Promise.all([
      supabase.from('eventos').select('*').eq('igreja_id', membro.igreja_id).eq('status', 'agendado').gte('data_inicio', agora).order('data_inicio').limit(3),
      supabase.from('membros').select('id, nome_completo, foto_url, data_nascimento').eq('igreja_id', membro.igreja_id).eq('status', 'ativo').not('data_nascimento', 'is', null),
    ]).then(([{ data: ev }, { data: mb }]) => {
      setProximosEventos(ev ?? [])
      setAniversariantes(aniversariantesDoMes(mb ?? []).slice(0, 5))
      setLoading(false)
    })
  }, [membro?.igreja_id])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {membro?.igrejas?.logo_url ? (
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            <img src={membro.igrejas.logo_url} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center shrink-0 shadow-sm">
            <Building2 size={22} className="text-white" />
          </div>
        )}
        <div>
          <p className="text-base font-bold text-gray-900 leading-tight">{membro?.igrejas?.nome ?? 'Minha Igreja'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{membro?.nome_completo} · <span className="capitalize">{membro?.role}</span></p>
        </div>
      </div>

      {/* Notificações não lidas */}
      {naoLidas > 0 && (
        <Link to="/dashboard/notificacoes">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-900 to-purple-800 rounded-2xl text-white shadow-sm">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {naoLidas} {naoLidas === 1 ? 'notificação nova' : 'notificações novas'}
              </p>
              <p className="text-xs text-blue-200">Toque para ver</p>
            </div>
            <ChevronRight size={18} className="opacity-70" />
          </div>
        </Link>
      )}

      {/* Próximos eventos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Calendar size={15} className="text-blue-700" /> Próximos eventos</h2>
          <Link to="/dashboard/calendario" className="text-xs text-blue-700 hover:underline flex items-center gap-0.5">Ver todos <ChevronRight size={12} /></Link>
        </div>
        {loading ? (
          <div className="space-y-2">{[1,2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : proximosEventos.length === 0 ? (
          <Card><p className="text-sm text-gray-400 text-center py-4">Nenhum evento agendado</p></Card>
        ) : (
          <div className="space-y-3">
            {proximosEventos.map((ev) => (
              <Card key={ev.id} padding={false}>
                <div className="flex gap-3 p-4 items-center">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex flex-col items-center justify-center shrink-0 text-white">
                    <span className="font-bold text-sm leading-tight">{new Date(ev.data_inicio).getDate()}</span>
                    <span className="text-[9px] uppercase opacity-80">{new Date(ev.data_inicio).toLocaleString('pt-BR', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{ev.titulo}</p>
                    <p className="text-xs text-gray-400">{formatarDataHora(ev.data_inicio)} · {ev.local}</p>
                  </div>
                  {ev.banner_url && (
                    <button onClick={() => setCartazEvento(ev)} className="shrink-0">
                      <img src={ev.banner_url} alt="Cartaz" className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Aniversariantes do mês */}
      {aniversariantes.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Gift size={15} className="text-purple-600" /> Aniversariantes do mês
          </h2>
          <Card padding={false}>
            <div className="flex gap-3 px-4 py-3 overflow-x-auto">
              {aniversariantes.map((m) => (
                <div key={m.id} className="flex flex-col items-center gap-1.5 shrink-0">
                  <Avatar nome={m.nome_completo} fotoUrl={m.foto_url} size="md" />
                  <p className="text-xs text-gray-600 font-medium text-center max-w-[60px] truncate">{m.nome_completo.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400">{m.data_nascimento.split('-')[2]}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal cartaz */}
      {cartazEvento && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setCartazEvento(null)}
        >
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setCartazEvento(null)}
              className="absolute -top-10 right-0 p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <X size={22} />
            </button>
            <img
              src={cartazEvento.banner_url}
              alt={`Cartaz — ${cartazEvento.titulo}`}
              className="w-full rounded-2xl object-contain max-h-[80vh]"
            />
            <p className="text-center text-white/70 text-sm mt-3">{cartazEvento.titulo}</p>
          </div>
        </div>
      )}
    </div>
  )
}
