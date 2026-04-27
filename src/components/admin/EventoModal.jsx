import { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import Modal from '../ui/Modal'
import { supabase } from '../../lib/supabase'

export default function EventoModal({ isOpen, onClose, evento, onSalvar, igrejaId }) {
  const [form, setForm] = useState(estadoInicial())
  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)
  const [uploadando, setUploadando] = useState(false)
  const [arquivo, setArquivo] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [erroArquivo, setErroArquivo] = useState('')

  function estadoInicial() {
    return { titulo: '', descricao: '', data_inicio: '', data_fim: '', local: '', recorrente: false }
  }

  useEffect(() => {
    if (evento) {
      setForm({
        titulo: evento.titulo ?? '',
        descricao: evento.descricao ?? '',
        data_inicio: evento.data_inicio ? evento.data_inicio.slice(0, 16) : '',
        data_fim: evento.data_fim ? evento.data_fim.slice(0, 16) : '',
        local: evento.local ?? '',
        recorrente: evento.recorrente ?? false,
      })
      setPreviewUrl(evento.banner_url ?? null)
    } else {
      setForm(estadoInicial())
      setPreviewUrl(null)
    }
    setArquivo(null)
    setErros({})
    setErroArquivo('')
  }, [evento, isOpen])

  // Gera blob URL para preview e revoga ao trocar/desmontar
  useEffect(() => {
    if (!arquivo) return
    const url = URL.createObjectURL(arquivo)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [arquivo])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErros((p) => ({ ...p, [field]: undefined }))
  }

  function handleArquivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const tiposValidos = ['image/jpeg', 'image/png', 'image/webp']
    if (!tiposValidos.includes(file.type)) {
      setErroArquivo('Formato inválido. Use JPG, PNG ou WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErroArquivo('Arquivo muito grande. Máximo 5MB.')
      return
    }
    setErroArquivo('')
    setArquivo(file)
  }

  function removerPreview() {
    setArquivo(null)
    setPreviewUrl(null)
  }

  function validar() {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'Título obrigatório'
    if (!form.data_inicio) e.data_inicio = 'Data de início obrigatória'
    if (!form.local.trim()) e.local = 'Local obrigatório'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    try {
      const eventoSalvo = await onSalvar({
        ...form,
        data_inicio: new Date(form.data_inicio).toISOString(),
        data_fim: form.data_fim ? new Date(form.data_fim).toISOString() : null,
      })

      if (arquivo && eventoSalvo?.id) {
        setUploadando(true)
        const ext = arquivo.name.split('.').pop().toLowerCase()
        const path = `${igrejaId}/${eventoSalvo.id}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('eventos')
          .upload(path, arquivo, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('eventos').getPublicUrl(path)

        await supabase
          .from('eventos')
          .update({ banner_url: urlData.publicUrl })
          .eq('id', eventoSalvo.id)
      }

      onClose()
    } catch {
      setErros({ geral: uploadando ? 'Erro ao enviar o cartaz. O evento foi salvo.' : 'Erro ao salvar evento.' })
    } finally {
      setLoading(false)
      setUploadando(false)
    }
  }

  const botaoLabel = loading
    ? uploadando ? 'Enviando cartaz...' : 'Salvando...'
    : 'Salvar'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={evento ? 'Editar evento' : 'Novo evento'} size="md">
      {erros.geral && <p className="mb-3 text-sm text-red-600 p-3 bg-red-50 rounded-xl">{erros.geral}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Título <span className="text-red-500">*</span></label>
          <input type="text" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Nome do evento"
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.titulo ? 'border-red-400' : 'border-gray-200'}`} />
          {erros.titulo && <p className="text-xs text-red-500 mt-0.5">{erros.titulo}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Descrição</label>
          <textarea value={form.descricao} onChange={(e) => set('descricao', e.target.value)} rows={2} placeholder="Detalhes do evento..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Início <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.data_inicio ? 'border-red-400' : 'border-gray-200'}`} />
            {erros.data_inicio && <p className="text-xs text-red-500 mt-0.5">{erros.data_inicio}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Término</label>
            <input type="datetime-local" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Local <span className="text-red-500">*</span></label>
          <input type="text" value={form.local} onChange={(e) => set('local', e.target.value)} placeholder="Endereço ou nome do local"
            className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.local ? 'border-red-400' : 'border-gray-200'}`} />
          {erros.local && <p className="text-xs text-red-500 mt-0.5">{erros.local}</p>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.recorrente} onChange={(e) => set('recorrente', e.target.checked)}
            className="w-4 h-4 rounded accent-blue-700" />
          <span className="text-sm text-gray-600">Evento recorrente</span>
        </label>

        {/* Cartaz */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Cartaz do evento</label>
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Preview do cartaz" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={removerPreview}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X size={14} />
              </button>
              {!arquivo && <p className="text-xs text-gray-400 mt-1">Cartaz atual. Clique no X para trocar.</p>}
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500">Clique para selecionar o cartaz</span>
              <span className="text-xs text-gray-400">JPG, PNG ou WebP · máx. 5MB</span>
              <input
                key={String(isOpen)}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleArquivo}
                className="hidden"
              />
            </label>
          )}
          {erroArquivo && <p className="text-xs text-red-500 mt-1">{erroArquivo}</p>}
          {arquivo && !erroArquivo && <p className="text-xs text-gray-400 mt-1">{arquivo.name}</p>}
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
            {botaoLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
