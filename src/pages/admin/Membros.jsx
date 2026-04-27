import { useEffect, useState } from 'react'
import { Plus, Search, UserCheck, UserX, Pencil } from 'lucide-react'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import { statusBadge, roleBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { ConfirmModal } from '../../components/ui/Modal'
import MembroModal from '../../components/admin/MembroModal'
import Button from '../../components/ui/Button'
import { useMembros } from '../../hooks/useMembros'
import { useDebounce } from '../../hooks/useDebounce'
import { usePermissoes } from '../../hooks/usePermissoes'
import { useIgrejaId } from '../../hooks/useAuth'
import { toast } from '../../components/ui/Toast'
import { Users } from 'lucide-react'

const FILTROS_STATUS = [
  { value: '', label: 'Todos' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'inativo', label: 'Inativos' },
]

export default function Membros() {
  const { membros, loading, buscarMembros, criarMembro, atualizarMembro, aprovarMembro, rejeitarMembro } = useMembros()
  const { podeCadastrarMembro, podeEditarMembro, podeExcluirMembro } = usePermissoes()
  const igrejaId = useIgrejaId()
  const [busca, setBusca] = useState('')
  const buscaDebounced = useDebounce(busca)
  const [statusFiltro, setStatusFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [membroSelecionado, setMembroSelecionado] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const [loadingAcao, setLoadingAcao] = useState(false)

  useEffect(() => {
    buscarMembros({ status: statusFiltro, busca: buscaDebounced })
  }, [statusFiltro, buscaDebounced, buscarMembros])

  function abrirNovo() { setMembroSelecionado(null); setModalAberto(true) }
  function abrirEditar(m) { setMembroSelecionado(m); setModalAberto(true) }

  async function handleSalvar(dados) {
    let result
    if (membroSelecionado) {
      result = await atualizarMembro(membroSelecionado.id, dados)
      toast('Membro atualizado com sucesso!')
    } else {
      result = await criarMembro(dados)
      toast('Membro cadastrado com sucesso!')
    }
    buscarMembros({ status: statusFiltro })
    return result
  }

  async function handleConfirmar() {
    if (!confirmacao) return
    setLoadingAcao(true)
    try {
      if (confirmacao.tipo === 'aprovar') {
        await aprovarMembro(confirmacao.membro.id)
        toast(`${confirmacao.membro.nome_completo} aprovado!`)
      } else {
        await rejeitarMembro(confirmacao.membro.id)
        toast(`Cadastro rejeitado.`, 'aviso')
      }
      buscarMembros({ status: statusFiltro })
    } catch {
      toast('Erro ao processar ação.', 'erro')
    } finally {
      setLoadingAcao(false)
      setConfirmacao(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Membros</h1>
          <p className="text-sm text-gray-400">{membros.length} registro(s)</p>
        </div>
        {podeCadastrarMembro && <Button onClick={abrirNovo} size="sm"><Plus size={15} /> Novo membro</Button>}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTROS_STATUS.map((f) => (
            <button key={f.value} onClick={() => setStatusFiltro(f.value)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${statusFiltro === f.value ? 'bg-blue-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card padding={false}>
        {loading ? <LoadingSpinner /> : membros.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum membro encontrado" description="Ajuste os filtros ou cadastre um novo membro." action={podeCadastrarMembro ? <Button onClick={abrirNovo} size="sm"><Plus size={14} /> Novo</Button> : undefined} />
        ) : (
          <div className="divide-y divide-gray-50">
            {membros.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <Avatar nome={m.nome_completo} fotoUrl={m.foto_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.nome_completo}</p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {roleBadge(m.role)}
                  {statusBadge(m.status)}
                </div>
                <div className="flex items-center gap-1">
                  {m.status === 'aguardando' && podeEditarMembro && (
                    <button onClick={() => setConfirmacao({ tipo: 'aprovar', membro: m })}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Aprovar">
                      <UserCheck size={15} />
                    </button>
                  )}
                  {m.status === 'aguardando' && podeExcluirMembro && (
                    <button onClick={() => setConfirmacao({ tipo: 'rejeitar', membro: m })}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Rejeitar">
                      <UserX size={15} />
                    </button>
                  )}
                  {podeEditarMembro && (
                    <button onClick={() => abrirEditar(m)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                      <Pencil size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <MembroModal isOpen={modalAberto} onClose={() => setModalAberto(false)} membro={membroSelecionado} onSalvar={handleSalvar} igrejaId={igrejaId} />

      <ConfirmModal
        isOpen={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        onConfirm={handleConfirmar}
        loading={loadingAcao}
        title={confirmacao?.tipo === 'aprovar' ? 'Aprovar cadastro' : 'Rejeitar cadastro'}
        message={`Deseja ${confirmacao?.tipo === 'aprovar' ? 'aprovar' : 'rejeitar'} o cadastro de ${confirmacao?.membro?.nome_completo}?`}
        confirmLabel={confirmacao?.tipo === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
      />
    </div>
  )
}
