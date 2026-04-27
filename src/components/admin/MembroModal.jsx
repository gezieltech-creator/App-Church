import { useState, useEffect, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import Modal from '../ui/Modal'
import { mascararCPF, mascararTelefone } from '../../utils/formatters'
import { validarCPF, validarEmail } from '../../utils/validators'
import { useUpload } from '../../hooks/useUpload'
import { supabase } from '../../lib/supabase'

const rolesOptions = [
  { value: 'membro', label: 'Membro' },
  { value: 'visitante', label: 'Visitante' },
  { value: 'lideranca', label: 'Liderança' },
  { value: 'admin', label: 'Administrador' },
]

const statusOptions = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'inativo', label: 'Inativo' },
]

const FUNCOES_PREDEFINIDAS = ['Membro', 'Pastor', 'Presbítero', 'Evangelista', 'Obreiro', 'Diácono', 'Missionário']

function estadoInicial() {
  return {
    nome_completo: '', cpf: '', email: '', telefone: '',
    data_nascimento: '', role: 'membro', status: 'aprovado',
    data_membresia: '', funcao: '',
  }
}

export default function MembroModal({ isOpen, onClose, membro, onSalvar, igrejaId }) {
  const { upload, uploading } = useUpload()
  const [form, setForm] = useState(estadoInicial())
  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)
  const [fotoCarteira, setFotoCarteira] = useState(null)
  const [previewSrc, setPreviewSrc] = useState(null)
  const [funcaoOpcao, setFuncaoOpcao] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (membro) {
      setForm({
        nome_completo: membro.nome_completo ?? '',
        cpf: membro.cpf ?? '',
        email: membro.email ?? '',
        telefone: membro.telefone ?? '',
        data_nascimento: membro.data_nascimento ?? '',
        role: membro.role ?? 'membro',
        status: membro.status ?? 'aprovado',
        data_membresia: membro.data_membresia ?? '',
        funcao: membro.funcao ?? '',
      })
      const opcao = FUNCOES_PREDEFINIDAS.includes(membro.funcao)
        ? membro.funcao
        : membro.funcao ? '__outro__' : ''
      setFuncaoOpcao(opcao)
      setPreviewSrc(membro.foto_carteira_url ?? null)
    } else {
      setForm(estadoInicial())
      setFuncaoOpcao('')
      setPreviewSrc(null)
    }
    setFotoCarteira(null)
    setErros({})
  }, [membro, isOpen])

  useEffect(() => {
    return () => { if (previewSrc?.startsWith('blob:')) URL.revokeObjectURL(previewSrc) }
  }, [previewSrc])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    setErros((p) => ({ ...p, [field]: undefined }))
  }

  function handleFuncaoOpcaoChange(opcao) {
    setFuncaoOpcao(opcao)
    if (opcao !== '__outro__') set('funcao', opcao)
    else set('funcao', '')
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewSrc?.startsWith('blob:')) URL.revokeObjectURL(previewSrc)
    setFotoCarteira(file)
    setPreviewSrc(URL.createObjectURL(file))
  }

  function removerFoto() {
    if (previewSrc?.startsWith('blob:')) URL.revokeObjectURL(previewSrc)
    setFotoCarteira(null)
    setPreviewSrc(membro?.foto_carteira_url ?? null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function validar() {
    const e = {}
    if (!form.nome_completo.trim()) e.nome_completo = 'Nome obrigatório'
    if (!membro && !validarCPF(form.cpf)) e.cpf = 'CPF inválido'
    if (!validarEmail(form.email)) e.email = 'E-mail inválido'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    try {
      const dados = {
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, ''),
      }

      // Edição: upload antes, URL incluída nos dados
      if (membro && fotoCarteira) {
        const ext = fotoCarteira.name.split('.').pop().toLowerCase()
        dados.foto_carteira_url = await upload('membros', `${igrejaId}/carteira/${membro.id}.${ext}`, fotoCarteira, 5)
      }

      const result = await onSalvar(dados)

      // Criação: upload após ter o ID do novo membro
      if (!membro && fotoCarteira && result?.id) {
        const ext = fotoCarteira.name.split('.').pop().toLowerCase()
        const url = await upload('membros', `${igrejaId}/carteira/${result.id}.${ext}`, fotoCarteira, 5)
        await supabase.from('membros').update({ foto_carteira_url: url }).eq('id', result.id)
      }

      onClose()
    } catch (err) {
      setErros({ geral: err.message?.includes('unique') ? 'CPF ou e-mail já cadastrado.' : 'Erro ao salvar.' })
    } finally {
      setLoading(false)
    }
  }

  const isProcessando = loading || uploading

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={membro ? 'Editar membro' : 'Novo membro'}>
      {erros.geral && <p className="mb-3 text-sm text-red-600 p-3 bg-red-50 rounded-xl">{erros.geral}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { field: 'nome_completo', label: 'Nome completo', type: 'text', required: true },
          { field: 'email', label: 'E-mail', type: 'email', required: true },
          { field: 'data_nascimento', label: 'Data de nascimento', type: 'date' },
          { field: 'data_membresia', label: 'Data de membresia', type: 'date' },
        ].map(({ field, label, type, required }) => (
          <div key={field}>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input type={type} value={form[field]} onChange={(e) => set(field, e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros[field] ? 'border-red-400' : 'border-gray-200'}`} />
            {erros[field] && <p className="text-xs text-red-500 mt-0.5">{erros[field]}</p>}
          </div>
        ))}

        {!membro && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">CPF</label>
            <input type="text" value={form.cpf} onChange={(e) => set('cpf', mascararCPF(e.target.value))} maxLength={14} placeholder="000.000.000-00"
              className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.cpf ? 'border-red-400' : 'border-gray-200'}`} />
            {erros.cpf && <p className="text-xs text-red-500 mt-0.5">{erros.cpf}</p>}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
          <input type="text" value={form.telefone} onChange={(e) => set('telefone', mascararTelefone(e.target.value))} maxLength={15} placeholder="(00) 00000-0000"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { field: 'role', label: 'Papel', options: rolesOptions },
            { field: 'status', label: 'Status', options: statusOptions },
          ].map(({ field, label, options }) => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
              <select value={form[field]} onChange={(e) => set(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Função na Igreja */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Função na Igreja</label>
          <select
            value={funcaoOpcao}
            onChange={(e) => handleFuncaoOpcaoChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            {FUNCOES_PREDEFINIDAS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
            <option value="__outro__">Outro</option>
          </select>
          {funcaoOpcao === '__outro__' && (
            <input
              type="text"
              value={form.funcao}
              onChange={(e) => set('funcao', e.target.value)}
              placeholder="Ex: Evangelista, Coordenador..."
              className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Foto para carteira */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Foto para carteira de membro (formal)
          </label>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
            {previewSrc ? (
              <div className="relative shrink-0">
                <img src={previewSrc} alt="Foto carteira" className="w-14 h-14 rounded-lg object-cover" />
                {fotoCarteira && (
                  <button type="button" onClick={removerFoto}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                    <X size={9} />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Camera size={18} className="text-gray-400" />
              </div>
            )}
            <div>
              <button type="button" onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <Camera size={12} />
                {previewSrc ? 'Trocar foto' : 'Enviar foto'}
              </button>
              <p className="text-[11px] text-gray-400 mt-1">Use uma foto com fundo neutro, rosto centralizado</p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFotoChange} />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isProcessando}
            className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
            {uploading ? 'Enviando foto...' : loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
