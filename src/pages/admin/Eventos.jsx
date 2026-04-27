import { useEffect, useState } from 'react'
import { Plus, Pencil, XCircle, MapPin, Clock, ImageIcon, X } from 'lucide-react'
import Card from '../../components/ui/Card'
import { statusBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { ConfirmModal } from '../../components/ui/Modal'
import EventoModal from '../../components/admin/EventoModal'
import Button from '../../components/ui/Button'
import { useEventos } from '../../hooks/useEventos'
import { useIgrejaId } from '../../hooks/useAuth'
import { usePermissoes } from '../../hooks/usePermissoes'
import { Calendar } from 'lucide-react'
import { formatarDataHora } from '../../utils/formatters'

const FILTROS = [
  { value: '', label: 'Todos' },
  { value: 'agendado', label: 'Agendados' },
  { value: 'concluido', label: 'Concluídos' },
  { value: 'cancelado', label: 'Cancelados' },
]

export default function Eventos() {
  const { eventos, loading, buscarEventos, criarEvento, atualizarEvento, cancelarEvento } = useEventos()
  const igrejaId = useIgrejaId()
  const { podeIncluirEvento, podeEditarEvento, podeExcluirEvento } = usePermissoes()
  const [modalAberto, setModalAberto] = useState(false)
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const [statusFiltro, setStatusFiltro] = useState('agendado')
  const [loadingAcao, setLoadingAcao] = useState(false)
  const [cartazEvento, setCartazEvento] = useState(null)

  useEffect(() => {
    buscarEventos({ status: statusFiltro || undefined })
  }, [statusFiltro, buscarEventos])

  function abrirNovo() { setEventoSelecionado(null); setModalAberto(true) }
  function abrirEditar(ev) { setEventoSelecionado(ev); setModalAberto(true) }

  async function handleSalvar(dados) {
    let ev
    if (eventoSelecionado) ev = await atualizarEvento(eventoSelecionado.id, dados)
    else ev = await criarEvento(dados)
    buscarEventos({ status: statusFiltro || undefined })
    return ev
  }

  async function handleCancelar() {
    if (!confirmacao) return
    setLoadingAcao(true)
    try {
      await cancelarEvento(confirmacao.id, confirmacao.titulo)
      buscarEventos({ status: statusFiltro || undefined })
    } finally {
      setLoadingAcao(false)
      setConfirmacao(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-400">{eventos.length} evento(s)</p>
        </div>
        {podeIncluirEvento && <Button onClick={abrirNovo} size="sm"><Plus size={15} /> Novo evento</Button>}
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {FILTROS.map((f) => (
          <button key={f.value} onClick={() => setStatusFiltro(f.value)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${statusFiltro === f.value ? 'bg-blue-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : eventos.length === 0 ? (
        <EmptyState icon={Calendar} title="Nenhum evento encontrado"
          description="Crie um novo evento para a sua comunidade."
          action={podeIncluirEvento ? <Button onClick={abrirNovo} size="sm"><Plus size={14} /> Novo</Button> : undefined} />
      ) : (
        <div className="space-y-3">
          {eventos.map((ev) => (
            <Card key={ev.id} padding={false}>
              <div className="flex gap-4 p-4">
                {/* Thumbnail do cartaz ou bloco de data */}
                {ev.banner_url ? (
                  <button
                    onClick={() => setCartazEvento(ev)}
                    className="w-12 shrink-0 self-stretch"
                    title="Ver cartaz"
                  >
                    <img
                      src={ev.banner_url}
                      alt="Cartaz"
                      className="w-full h-full min-h-[48px] max-h-16 rounded-xl object-cover"
                    />
                  </button>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex flex-col items-center justify-center shrink-0 text-white">
                    <span className="font-bold text-sm leading-tight">{new Date(ev.data_inicio).getDate()}</span>
                    <span className="text-[10px] uppercase opacity-80">{new Date(ev.data_inicio).toLocaleString('pt-BR', { month: 'short' })}</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900 flex-1 min-w-0">{ev.titulo}</h3>
                    {statusBadge(ev.status)}
                    {ev.banner_url && <ImageIcon size={12} className="text-blue-400 mt-0.5 shrink-0" />}
                    {ev.recorrente && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Recorrente</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} /> {formatarDataHora(ev.data_inicio)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} /> {ev.local}
                    </span>
                  </div>
                  {ev.descricao && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ev.descricao}</p>}
                </div>

                {/* Ações */}
                {ev.status === 'agendado' && (podeEditarEvento || podeExcluirEvento) && (
                  <div className="flex flex-col gap-1 shrink-0">
                    {podeEditarEvento && (
                      <button onClick={() => abrirEditar(ev)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                    )}
                    {podeExcluirEvento && (
                      <button onClick={() => setConfirmacao(ev)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><XCircle size={14} /></button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <EventoModal isOpen={modalAberto} onClose={() => setModalAberto(false)} evento={eventoSelecionado} onSalvar={handleSalvar} igrejaId={igrejaId} />

      <ConfirmModal
        isOpen={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        onConfirm={handleCancelar}
        loading={loadingAcao}
        title="Cancelar evento"
        message={`Deseja cancelar o evento "${confirmacao?.titulo}"? Todos os membros serão notificados.`}
        confirmLabel="Cancelar evento"
      />

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
