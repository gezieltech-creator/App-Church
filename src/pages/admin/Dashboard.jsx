import { useEffect, useState } from 'react'
import { Users, Calendar, Clock, Gift, UserCheck, ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card, { MetricCard } from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import { statusBadge } from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import { useIgrejaId } from '../../hooks/useAuth'
import { formatarDataHora, formatarData } from '../../utils/formatters'

export default function AdminDashboard() {
  const igrejaId = useIgrejaId()
  const [metricas, setMetricas] = useState({ total: 0, aguardando: 0, eventos: 0, aniversariantes: 0 })
  const [aguardando, setAguardando] = useState([])
  const [proximosEventos, setProximosEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!igrejaId) return
    async function carregar() {
      const agora = new Date().toISOString()
      const mesAtual = new Date().getMonth() + 1

      const [{ count: total }, { count: pendentes }, { data: eventos }, { data: membrosAguardando }, { data: todosMembros }] =
        await Promise.all([
          supabase.from('membros').select('*', { count: 'exact', head: true }).eq('igreja_id', igrejaId).eq('status', 'ativo'),
          supabase.from('membros').select('*', { count: 'exact', head: true }).eq('igreja_id', igrejaId).eq('status', 'aguardando'),
          supabase.from('eventos').select('*').eq('igreja_id', igrejaId).eq('status', 'agendado').gte('data_inicio', agora).order('data_inicio').limit(5),
          supabase.from('membros').select('*').eq('igreja_id', igrejaId).eq('status', 'aguardando').order('criado_em').limit(5),
          supabase.from('membros').select('data_nascimento').eq('igreja_id', igrejaId).eq('status', 'ativo'),
        ])

      const aniversariantes = (todosMembros ?? []).filter((m) => {
        if (!m.data_nascimento) return false
        return parseInt(m.data_nascimento.split('-')[1], 10) === mesAtual
      }).length

      setMetricas({ total: total ?? 0, aguardando: pendentes ?? 0, eventos: eventos?.length ?? 0, aniversariantes })
      setAguardando(membrosAguardando ?? [])
      setProximosEventos(eventos ?? [])
      setLoading(false)
    }
    carregar()
  }, [igrejaId])

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-24 bg-gray-100 rounded-2xl" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">Visão geral da sua igreja</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Membros ativos" value={metricas.total} icon={Users} color="blue" />
        <MetricCard title="Aguardando aprovação" value={metricas.aguardando} icon={Clock} color="orange" />
        <MetricCard title="Próximos eventos" value={metricas.eventos} icon={Calendar} color="purple" />
        <MetricCard title="Aniversariantes do mês" value={metricas.aniversariantes} icon={Gift} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Aguardando aprovação */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-orange-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Aguardando aprovação</h3>
              {metricas.aguardando > 0 && (
                <span className="w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {metricas.aguardando}
                </span>
              )}
            </div>
            <Link to="/admin/membros" className="text-xs text-blue-700 hover:underline">Ver todos</Link>
          </div>
          {aguardando.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum cadastro pendente</p>
          ) : (
            <div className="space-y-3">
              {aguardando.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar nome={m.nome_completo} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.nome_completo}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  {statusBadge(m.status)}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Próximos eventos */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-700" />
              <h3 className="font-semibold text-gray-900 text-sm">Próximos eventos</h3>
            </div>
            <Link to="/admin/eventos" className="text-xs text-blue-700 hover:underline">Ver todos</Link>
          </div>
          {proximosEventos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum evento agendado</p>
          ) : (
            <div className="space-y-3">
              {proximosEventos.map((ev) => (
                <div key={ev.id} className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-blue-800 font-bold text-xs leading-tight">{new Date(ev.data_inicio).getDate()}</span>
                    <span className="text-blue-500 text-[9px] uppercase">{new Date(ev.data_inicio).toLocaleString('pt-BR', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{ev.titulo}</p>
                    <p className="text-xs text-gray-400">{ev.local}</p>
                  </div>
                  {ev.banner_url && <ImageIcon size={13} className="text-blue-400 shrink-0 mt-0.5" />}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
