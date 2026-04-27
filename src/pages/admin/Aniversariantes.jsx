import { useEffect, useState } from 'react'
import { Gift, Phone } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { supabase } from '../../lib/supabase'
import { useIgrejaId } from '../../hooks/useAuth'
import { formatarTelefone } from '../../utils/formatters'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Aniversariantes() {
  const igrejaId = useIgrejaId()
  const [membros, setMembros] = useState([])
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!igrejaId) return
    supabase
      .from('membros')
      .select('id, nome_completo, data_nascimento, foto_url, telefone')
      .eq('igreja_id', igrejaId)
      .eq('status', 'ativo')
      .not('data_nascimento', 'is', null)
      .then(({ data }) => { setMembros(data ?? []); setLoading(false) })
  }, [igrejaId])

  const doMes = membros
    .filter((m) => parseInt(m.data_nascimento.split('-')[1], 10) - 1 === mesSelecionado)
    .sort((a, b) => parseInt(a.data_nascimento.split('-')[2]) - parseInt(b.data_nascimento.split('-')[2]))

  const hoje = new Date()
  const diaHoje = hoje.getDate()
  const mesHoje = hoje.getMonth()

  function ehHoje(dataNasc) {
    const [, m, d] = dataNasc.split('-')
    return parseInt(m) - 1 === mesHoje && parseInt(d) === diaHoje
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Aniversariantes</h1>
        <p className="text-sm text-gray-400">Membros que fazem aniversário em cada mês</p>
      </div>

      {/* Seletor de mês */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MESES.map((mes, i) => (
          <button
            key={i}
            onClick={() => setMesSelecionado(i)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mesSelecionado === i
                ? 'bg-blue-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {mes}
          </button>
        ))}
      </div>

      <Card padding={false}>
        {loading ? (
          <LoadingSpinner />
        ) : doMes.length === 0 ? (
          <EmptyState icon={Gift} title="Nenhum aniversariante" description={`Nenhum membro faz aniversário em ${MESES[mesSelecionado]}.`} />
        ) : (
          <div className="divide-y divide-gray-50">
            {doMes.map((m) => {
              const dia = parseInt(m.data_nascimento.split('-')[2])
              const aniversarioHoje = ehHoje(m.data_nascimento)
              return (
                <div key={m.id} className={`flex items-center gap-4 px-5 py-4 ${aniversarioHoje ? 'bg-yellow-50' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-blue-700">{dia}</span>
                  </div>
                  <Avatar nome={m.nome_completo} fotoUrl={m.foto_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.nome_completo}</p>
                      {aniversarioHoje && <span className="text-base">🎂</span>}
                    </div>
                    {m.telefone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={10} /> {formatarTelefone(m.telefone)}
                      </p>
                    )}
                  </div>
                  {aniversarioHoje && (
                    <span className="shrink-0 text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded-full">Hoje!</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
