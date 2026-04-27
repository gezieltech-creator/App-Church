import { useState, useRef } from 'react'
import { X, RefreshCw, Download, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import FrenteAssembleia, { Verso as VersoAssembleia } from './templates/AssembleiaRibeiraoCorrente'

const ROLE_LABEL = {
  super_admin: 'Administrador Geral',
  admin: 'Administrador',
  lideranca: 'Liderança',
  membro: 'Membro',
  visitante: 'Visitante',
}

const TEMPLATES = {
  'assembleia-ribeirao-corrente': {
    Frente: FrenteAssembleia,
    Verso: VersoAssembleia,
  },
}

export default function CarteiraDigital() {
  const { membro } = useAuth()
  const [modalAberto, setModalAberto] = useState(false)
  const [virado, setVirado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const frenteRef = useRef(null)

  if (!membro) return null

  const igreja = membro.igrejas
  const template = igreja?.template_id ? TEMPLATES[igreja.template_id] : null
  const { Frente, Verso } = template ?? {}

  const funcaoLabel = membro.funcao?.trim() || ROLE_LABEL[membro.role] || membro.role
  const qrData = encodeURIComponent(
    `Nome: ${membro.nome_completo}\nIgreja: ${igreja?.nome ?? ''}\nFunção: ${funcaoLabel}`
  )
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&color=1e3a5f&bgcolor=eff6ff`

  const dadosIncompletos = !membro.cpf || !membro.data_membresia

  async function salvarImagem() {
    if (!frenteRef.current || salvando) return
    setSalvando(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(frenteRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = `carteira-${membro.nome_completo.split(' ')[0].toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // falha silenciosa
    } finally {
      setSalvando(false)
    }
  }

  function fecharModal() {
    setModalAberto(false)
    setVirado(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Carteira Digital</h1>
        <p className="text-sm text-gray-400">Sua identidade de membro</p>
      </div>

      {!template && (
        <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
          <AlertCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">
            Carteira não configurada. Entre em contato com o administrador.
          </p>
        </div>
      )}

      {template && (
        <>
          {dadosIncompletos && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Carteira incompleta</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Complete seu perfil com CPF e data de membresia para uma carteira completa.
                </p>
              </div>
            </div>
          )}

          {/* Preview clicável */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setModalAberto(true)}
              className="w-full max-w-xs transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
              aria-label="Abrir carteira em tamanho completo"
            >
              <Frente membro={membro} igreja={igreja} />
            </button>
            <p className="text-xs text-gray-400">Toque para ampliar</p>
          </div>
        </>
      )}

      {/* Modal */}
      {template && modalAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 overflow-y-auto"
          onClick={fecharModal}
        >
          <button
            onClick={fecharModal}
            className="fixed top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
          >
            <X size={22} />
          </button>

          <div className="flex flex-col items-center justify-start min-h-full p-5 gap-5 pt-12">
            <div className="w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
              {/* Flip 3D usando grid — altura determinada pelo conteúdo */}
              <div style={{ perspective: '1200px' }}>
                <div
                  style={{
                    display: 'grid',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: virado ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Frente */}
                  <div
                    ref={frenteRef}
                    style={{
                      gridArea: '1 / 1',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    <Frente membro={membro} igreja={igreja} />
                  </div>

                  {/* Verso */}
                  <div
                    style={{
                      gridArea: '1 / 1',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <Verso qrUrl={qrUrl} igreja={igreja} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-5">
                <button
                  onClick={() => setVirado((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <RefreshCw size={14} />
                  {virado ? 'Ver frente' : 'Ver verso'}
                </button>
                <button
                  onClick={salvarImagem}
                  disabled={salvando}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                >
                  <Download size={14} />
                  {salvando ? 'Salvando...' : 'Salvar imagem'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
