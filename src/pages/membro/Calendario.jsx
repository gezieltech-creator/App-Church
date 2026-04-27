import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Clock, ImageIcon, X } from 'lucide-react'
import Card from '../../components/ui/Card'
import { statusBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useEventos } from '../../hooks/useEventos'
import { formatarDataHora } from '../../utils/formatters'
import { Calendar } from 'lucide-react'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Calendario() {
  const { eventos, buscarEventos } = useEventos()
  const [hoje] = useState(new Date())
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  const [diaSelecionado, setDiaSelecionado] = useState(null)
  const [cartazEvento, setCartazEvento] = useState(null)

  useEffect(() => {
    const inicio = new Date(anoAtual, mesAtual, 1).toISOString()
    const fim = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59).toISOString()
    buscarEventos({ dataInicio: inicio, dataFim: fim })
  }, [mesAtual, anoAtual, buscarEventos])

  function navMes(delta) {
    const d = new Date(anoAtual, mesAtual + delta, 1)
    setMesAtual(d.getMonth())
    setAnoAtual(d.getFullYear())
    setDiaSelecionado(null)
  }

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()

  function eventosNoDia(dia) {
    return eventos.filter((ev) => {
      const d = new Date(ev.data_inicio)
      return d.getDate() === dia && d.getMonth() === mesAtual && d.getFullYear() === anoAtual
    })
  }

  const eventosDoDiaSelecionado = diaSelecionado ? eventosNoDia(diaSelecionado) : []

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Agenda</h1>

      <Card>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navMes(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft size={18} /></button>
          <h2 className="text-sm font-bold text-gray-900">{MESES[mesAtual]} {anoAtual}</h2>
          <button onClick={() => navMes(1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight size={18} /></button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: primeiroDia }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: diasNoMes }).map((_, i) => {
            const dia = i + 1
            const temEvento = eventosNoDia(dia).length > 0
            const ehHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()
            const selecionado = diaSelecionado === dia

            return (
              <button
                key={dia}
                onClick={() => setDiaSelecionado(selecionado ? null : dia)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                  ${selecionado ? 'bg-blue-900 text-white' : ehHoje ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-50 text-gray-700'}
                `}
              >
                {dia}
                {temEvento && !selecionado && (
                  <div className={`w-1 h-1 rounded-full mt-0.5 ${ehHoje ? 'bg-blue-700' : 'bg-purple-500'}`} />
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Eventos do dia selecionado */}
      {diaSelecionado && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {diaSelecionado} de {MESES[mesAtual]}
            {eventosDoDiaSelecionado.length > 0 && ` · ${eventosDoDiaSelecionado.length} evento(s)`}
          </h3>
          {eventosDoDiaSelecionado.length === 0 ? (
            <EmptyState icon={Calendar} title="Nenhum evento neste dia" />
          ) : (
            <div className="space-y-3">
              {eventosDoDiaSelecionado.map((ev) => (
                <Card key={ev.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{ev.titulo}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      {ev.banner_url && (
                        <button
                          onClick={() => setCartazEvento(ev)}
                          className="flex items-center gap-1 text-xs text-blue-700 font-medium hover:underline"
                        >
                          <ImageIcon size={13} />
                          Ver Cartaz
                        </button>
                      )}
                      {statusBadge(ev.status)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1.5"><Clock size={11} />{formatarDataHora(ev.data_inicio)}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5"><MapPin size={11} />{ev.local}</p>
                  </div>
                  {ev.descricao && <p className="text-xs text-gray-500 mt-2">{ev.descricao}</p>}
                </Card>
              ))}
            </div>
          )}
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
