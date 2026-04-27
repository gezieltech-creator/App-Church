import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'

const tiposOferta = [
  { value: 'dizimo', label: 'Dízimo' },
  { value: 'oferta', label: 'Oferta' },
  { value: 'campanha', label: 'Campanha' },
  { value: 'outros', label: 'Outros' },
]

export default function OfertaModal({ isOpen, onClose, oferta, onSalvar }) {
  const [form, setForm] = useState(estadoInicial())
  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)

  function estadoInicial() {
    return { tipo: 'oferta', descricao: '', chave_pix: '', qrcode_url: '' }
  }

  useEffect(() => {
    if (oferta) {
      setForm({
        tipo: oferta.tipo ?? 'oferta',
        descricao: oferta.descricao ?? '',
        chave_pix: oferta.chave_pix ?? '',
        qrcode_url: oferta.qrcode_url ?? '',
      })
    } else {
      setForm(estadoInicial())
    }
    setErros({})
  }, [oferta, isOpen])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErros((p) => ({ ...p, [field]: undefined }))
  }

  function validar() {
    const e = {}
    if (!form.descricao.trim()) e.descricao = 'Descrição obrigatória'
    if (!form.chave_pix.trim()) e.chave_pix = 'Chave Pix obrigatória'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    try {
      await onSalvar(form)
      onClose()
    } catch {
      setErros({ geral: 'Erro ao salvar oferta.' })
    } finally {
      setLoading(false)
    }
  }

  const qrPreview = form.chave_pix
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(form.chave_pix)}`
    : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={oferta ? 'Editar oferta' : 'Nova oferta'} size="sm">
      {erros.geral && <p className="mb-3 text-sm text-red-600 p-3 bg-red-50 rounded-xl">{erros.geral}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Tipo</label>
          <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {tiposOferta.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Descrição <span className="text-red-500">*</span></label>
          <input type="text" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="Ex: Dízimo mensal"
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.descricao ? 'border-red-400' : 'border-gray-200'}`} />
          {erros.descricao && <p className="text-xs text-red-500 mt-0.5">{erros.descricao}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Pix Copia e Cola <span className="text-red-500">*</span></label>
          <textarea
            value={form.chave_pix}
            onChange={(e) => set('chave_pix', e.target.value)}
            placeholder="Cole aqui a string completa do Pix Copia e Cola gerada no seu banco"
            rows={3}
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${erros.chave_pix ? 'border-red-400' : 'border-gray-200'}`}
          />
          {erros.chave_pix && <p className="text-xs text-red-500 mt-0.5">{erros.chave_pix}</p>}
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Para gerar: acesse seu banco → área Pix → Cobrar → copie a string "Pix Copia e Cola"
          </p>
        </div>

        {qrPreview && (
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl gap-2">
            <img src={qrPreview} alt="QR Preview" className="w-24 h-24 rounded-lg" />
            <p className="text-xs text-gray-400">Pré-visualização do QR Code</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
