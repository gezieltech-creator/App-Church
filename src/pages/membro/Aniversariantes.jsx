import { useEffect, useState } from 'react'
import { Cake } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const ROLE_LABEL = {
  super_admin: 'Administrador Geral',
  admin: 'Administrador',
  lideranca: 'Liderança',
  membro: 'Membro',
  visitante: 'Visitante',
}

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function formatarDiaMes(dataISO) {
  const [, mes, dia] = dataISO.split('-')
  return `${parseInt(dia, 10)} de ${MESES[parseInt(mes, 10) - 1]}`
}

function isHoje(dataISO) {
  const hoje = new Date()
  const [, mes, dia] = dataISO.split('-')
  return parseInt(mes, 10) === hoje.getMonth() + 1 && parseInt(dia, 10) === hoje.getDate()
}

export default function MembroAniversariantes() {
  const { membro } = useAuth()
  const [aniversariantes, setAniversariantes] = useState([])
  const [loading, setLoading] = useState(true)

  const mesAtual = new Date().getMonth() + 1

  useEffect(() => {
    if (!membro?.igreja_id) return

    supabase
      .from('membros')
      .select('id, nome_completo, data_nascimento, funcao, role, foto_perfil_url')
      .eq('igreja_id', membro.igreja_id)
      .eq('status', 'ativo')
      .not('data_nascimento', 'is', null)
      .then(({ data }) => {
        const filtrados = (data ?? [])
          .filter(m => parseInt(m.data_nascimento.split('-')[1], 10) === mesAtual)
          .sort((a, b) => parseInt(a.data_nascimento.split('-')[2], 10) - parseInt(b.data_nascimento.split('-')[2], 10))
        setAniversariantes(filtrados)
        setLoading(false)
      })
  }, [membro?.igreja_id])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Cake size={20} className="text-purple-600" />
          Aniversariantes
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{MESES[mesAtual - 1]}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : aniversariantes.length === 0 ? (
        <Card>
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
              <Cake size={26} className="text-purple-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Nenhum aniversariante em {MESES[mesAtual - 1]}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {aniversariantes.map(m => {
            const hoje = isHoje(m.data_nascimento)
            const funcaoLabel = m.funcao?.trim() || ROLE_LABEL[m.role] || m.role

            return (
              <div
                key={m.id}
                className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                  hoje
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar nome={m.nome_completo} fotoUrl={m.foto_perfil_url} size="md" />
                  {hoje && (
                    <span className="absolute -bottom-1 -right-1 text-base leading-none">🎂</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold truncate ${hoje ? 'text-amber-900' : 'text-gray-900'}`}>
                      {m.nome_completo}
                    </p>
                    {hoje && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
                        Hoje! 🎉
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${hoje ? 'text-amber-700' : 'text-gray-400'}`}>
                    {funcaoLabel}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className={`text-sm font-semibold ${hoje ? 'text-amber-800' : 'text-purple-700'}`}>
                    {formatarDiaMes(m.data_nascimento)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
