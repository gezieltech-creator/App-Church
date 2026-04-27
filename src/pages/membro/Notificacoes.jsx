import { Bell, CheckCheck, Calendar, AlertCircle, Gift, Info } from 'lucide-react'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'
import { useNotificacoes } from '../../hooks/useNotificacoes'

const iconesTipo = {
  evento_novo: Calendar,
  evento_cancelado: AlertCircle,
  aniversario: Gift,
  aviso: Info,
  cadastro_aprovado: CheckCheck,
}

const coresTipo = {
  evento_novo: 'bg-blue-50 text-blue-600',
  evento_cancelado: 'bg-red-50 text-red-500',
  aniversario: 'bg-yellow-50 text-yellow-600',
  aviso: 'bg-purple-50 text-purple-600',
  cadastro_aprovado: 'bg-green-50 text-green-600',
}

function formatarTempoRelativo(dataISO) {
  const diff = Date.now() - new Date(dataISO).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d atrás`
  return new Date(dataISO).toLocaleDateString('pt-BR')
}

export default function Notificacoes() {
  const { notificacoes, naoLidas, loading, marcarComoLida, marcarTodasComoLidas } = useNotificacoes()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notificações</h1>
          {naoLidas > 0 && <p className="text-sm text-gray-400">{naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}</p>}
        </div>
        {naoLidas > 0 && (
          <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas}>
            <CheckCheck size={14} /> Marcar todas
          </Button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : notificacoes.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhuma notificação"
          description="Você está em dia! Notificações de eventos e avisos aparecerão aqui."
        />
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-gray-50">
            {notificacoes.map((n) => {
              const Icon = iconesTipo[n.tipo] ?? Bell
              const cor = coresTipo[n.tipo] ?? 'bg-gray-50 text-gray-500'
              return (
                <div
                  key={n.id}
                  onClick={() => !n.lida && marcarComoLida(n.id)}
                  className={`flex gap-3 px-4 py-4 transition-colors cursor-pointer ${n.lida ? '' : 'bg-blue-50/40 hover:bg-blue-50/60'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cor}`}>
                    <Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${n.lida ? 'text-gray-600' : 'text-gray-900'}`}>{n.titulo}</p>
                      <span className="text-xs text-gray-400 shrink-0">{formatarTempoRelativo(n.criada_em)}</span>
                    </div>
                    <p className={`text-xs mt-0.5 leading-relaxed ${n.lida ? 'text-gray-400' : 'text-gray-600'}`}>{n.mensagem}</p>
                  </div>
                  {!n.lida && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
