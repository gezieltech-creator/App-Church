import { useEffect, useState } from 'react'
import { Plus, Power, Pencil, QrCode, Copy, Check } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import OfertaModal from '../../components/admin/OfertaModal'
import Button from '../../components/ui/Button'
import { useOfertas } from '../../hooks/useOfertas'
import { usePermissoes } from '../../hooks/usePermissoes'

const labelTipo = { dizimo: 'Dízimo', oferta: 'Oferta', campanha: 'Campanha', outros: 'Outros' }
const colorTipo = { dizimo: 'blue', oferta: 'purple', campanha: 'orange', outros: 'default' }

export default function Ofertas() {
  const { ofertas, loading, buscarOfertas, criarOferta, atualizarOferta, alternarStatus } = useOfertas()
  const { podeCriarOferta, podeEditarOferta, podeExcluirOferta } = usePermissoes()
  const [modalAberto, setModalAberto] = useState(false)
  const [ofertaSelecionada, setOfertaSelecionada] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [copiado, setCopiado] = useState(null)

  async function copiarChave(chave, id) {
    try {
      await navigator.clipboard.writeText(chave)
    } catch {
      const el = document.createElement('textarea')
      el.value = chave
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  useEffect(() => { buscarOfertas() }, [buscarOfertas])

  function abrirNovo() { setOfertaSelecionada(null); setModalAberto(true) }
  function abrirEditar(o) { setOfertaSelecionada(o); setModalAberto(true) }

  async function handleSalvar(dados) {
    if (ofertaSelecionada) await atualizarOferta(ofertaSelecionada.id, dados)
    else await criarOferta(dados)
    buscarOfertas()
  }

  async function handleAlternar(o) {
    setLoadingId(o.id)
    try { await alternarStatus(o.id, o.ativo); buscarOfertas() }
    finally { setLoadingId(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ofertas & Dízimos</h1>
          <p className="text-sm text-gray-400">Gerenciar chaves Pix e QR Codes</p>
        </div>
        {podeCriarOferta && <Button onClick={abrirNovo} size="sm"><Plus size={15} /> Nova oferta</Button>}
      </div>

      {loading ? <LoadingSpinner /> : ofertas.length === 0 ? (
        <EmptyState icon={QrCode} title="Nenhuma oferta cadastrada"
          description="Cadastre uma chave Pix para que os membros possam realizar ofertas e dízimos."
          action={podeCriarOferta ? <Button onClick={abrirNovo} size="sm"><Plus size={14} /> Cadastrar</Button> : undefined} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ofertas.map((o) => (
            <Card key={o.id}>
              <div className="flex items-start justify-between mb-3">
                <Badge variant={colorTipo[o.tipo] ?? 'default'}>{labelTipo[o.tipo] ?? o.tipo}</Badge>
                <div className="flex items-center gap-1">
                  {podeEditarOferta && (
                    <button onClick={() => abrirEditar(o)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                  )}
                  {podeExcluirOferta && (
                    <button onClick={() => handleAlternar(o)} disabled={loadingId === o.id}
                      className={`p-1.5 rounded-lg transition-colors ${o.ativo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      <Power size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 mb-1">{o.descricao}</h3>
              <p className="text-xs text-gray-400 font-mono mb-3 truncate">{o.chave_pix}</p>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-2 bg-white border border-gray-100 rounded-xl inline-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(o.chave_pix)}`}
                    alt={`QR Code - ${o.descricao}`}
                    className="w-28 h-28 rounded-lg"
                  />
                </div>
              </div>

              {o.chave_pix && (
                <button
                  onClick={() => copiarChave(o.chave_pix, o.id)}
                  className={`mt-3 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    copiado === o.id
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-blue-900 hover:bg-blue-800 text-white'
                  }`}
                >
                  {copiado === o.id ? <Check size={13} /> : <Copy size={13} />}
                  {copiado === o.id ? 'Copiado!' : 'Copiar Pix Copia e Cola'}
                </button>
              )}

              <div className="mt-2 flex justify-center">
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${o.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {o.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <OfertaModal isOpen={modalAberto} onClose={() => setModalAberto(false)} oferta={ofertaSelecionada} onSalvar={handleSalvar} />
    </div>
  )
}
