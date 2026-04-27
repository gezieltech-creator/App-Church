import { useEffect, useState } from 'react'
import { Heart, Copy, Check, QrCode } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useOfertas } from '../../hooks/useOfertas'

const labelTipo = { dizimo: 'Dízimo', oferta: 'Oferta', campanha: 'Campanha', outros: 'Outros' }
const colorTipo = { dizimo: 'blue', oferta: 'purple', campanha: 'orange', outros: 'default' }

export default function MembroOfertas() {
  const { ofertas, loading, buscarOfertas } = useOfertas()
  const [copiado, setCopiado] = useState(null)

  useEffect(() => { buscarOfertas(true) }, [buscarOfertas])

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Ofertas & Dízimos</h1>
        <p className="text-sm text-gray-400">Contribua com sua igreja via Pix</p>
      </div>

      <div className="p-5 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl text-white">
        <div className="flex items-center gap-3 mb-2">
          <Heart size={20} className="text-pink-300" />
          <h2 className="font-semibold">Contribuição</h2>
        </div>
        <p className="text-sm text-blue-200 leading-relaxed">
          "Cada um contribua conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria." — 2 Co 9:7
        </p>
      </div>

      {loading ? <LoadingSpinner /> : ofertas.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="Nenhuma forma de oferta disponível no momento."
          description="Entre em contato com o administrador da sua igreja."
        />
      ) : (
        <div className="space-y-4">
          {ofertas.map((o) => (
            <Card key={o.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant={colorTipo[o.tipo] ?? 'default'}>{labelTipo[o.tipo] ?? o.tipo}</Badge>
                  <h3 className="text-base font-semibold text-gray-900 mt-1">{o.descricao}</h3>
                </div>
              </div>

              {o.chave_pix ? (
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(o.chave_pix)}&color=1e3a8a`}
                      alt={`QR Code - ${o.descricao}`}
                      className="w-44 h-44 rounded-xl"
                    />
                  </div>

                  <button
                    onClick={() => copiarChave(o.chave_pix, o.id)}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      copiado === o.id
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-blue-900 hover:bg-blue-800 text-white'
                    }`}
                  >
                    {copiado === o.id ? <Check size={18} /> : <Copy size={18} />}
                    {copiado === o.id ? 'Copiado!' : 'Copiar Pix Copia e Cola'}
                  </button>

                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    Abra o app do seu banco → área Pix → Pagar → Cole o código
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  Chave Pix não configurada para esta oferta.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
