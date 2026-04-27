import { useState, useEffect, useRef } from 'react'
import { Save, User, Mail, Phone, Calendar, Camera, X, Briefcase } from 'lucide-react'
import Card, { CardHeader } from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import { roleBadge, statusBadge } from '../../components/ui/Badge'
import { useAuth } from '../../hooks/useAuth'
import { useUpload } from '../../hooks/useUpload'
import { supabase } from '../../lib/supabase'
import { mascararTelefone, formatarData } from '../../utils/formatters'

export default function Perfil() {
  const { membro, recarregarMembro } = useAuth()
  const { upload, uploading } = useUpload()
  const [form, setForm] = useState({ telefone: '' })
  const [fotoArquivo, setFotoArquivo] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (membro) setForm({ telefone: membro.telefone ?? '' })
  }, [membro])

  useEffect(() => {
    return () => { if (fotoPreview) URL.revokeObjectURL(fotoPreview) }
  }, [fotoPreview])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    setFotoArquivo(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  function removerFotoSelecionada() {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    setFotoArquivo(null)
    setFotoPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      let foto_perfil_url = membro.foto_perfil_url ?? null

      if (fotoArquivo) {
        const ext = fotoArquivo.name.split('.').pop().toLowerCase()
        foto_perfil_url = await upload('membros', `${membro.igreja_id}/perfil/${membro.id}.${ext}`, fotoArquivo, 5)
      }

      const { error } = await supabase
        .from('membros')
        .update({ telefone: form.telefone.replace(/\D/g, ''), foto_perfil_url, atualizada_em: new Date().toISOString() })
        .eq('id', membro.id)

      if (error) throw error
      await recarregarMembro()
      setFotoArquivo(null)
      setFotoPreview(null)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (!membro) return null

  const fotoExibida = fotoPreview ?? membro.foto_perfil_url
  const isProcessando = salvando || uploading

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold text-gray-900">Meu Perfil</h1>

      <Card>
        <div className="flex items-center gap-4">
          <Avatar nome={membro.nome_completo} fotoUrl={membro.foto_perfil_url} size="xl" />
          <div>
            <h2 className="text-base font-bold text-gray-900">{membro.nome_completo}</h2>
            <p className="text-sm text-gray-400">{membro.igrejas?.nome}</p>
            <div className="flex gap-1.5 mt-2">
              {roleBadge(membro.role)}
              {statusBadge(membro.status)}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Dados cadastrais" icon={User} />
        <div className="space-y-3">
          {[
            { icon: Mail, label: 'E-mail', value: membro.email },
            { icon: Calendar, label: 'Nascimento', value: formatarData(membro.data_nascimento) },
            { icon: Calendar, label: 'Membro desde', value: membro.data_membresia ? formatarData(membro.data_membresia) : 'Não informado' },
            { icon: Briefcase, label: 'Função', value: membro.funcao || 'Não definida' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <Icon size={15} className="text-gray-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-gray-700">{value || 'Não informado'}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Editar informações" icon={User} />

        {erro && <p className="mb-3 text-sm text-red-600 p-3 bg-red-50 rounded-xl">{erro}</p>}
        {sucesso && <p className="mb-3 text-sm text-green-700 p-3 bg-green-50 rounded-xl">✅ Salvo com sucesso!</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Foto de perfil</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {fotoExibida ? (
                  <img src={fotoExibida} alt="Foto de perfil" className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
                ) : (
                  <Avatar nome={membro.nome_completo} size="xl" />
                )}
                {fotoArquivo && (
                  <button type="button" onClick={removerFotoSelecionada}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                    <X size={11} />
                  </button>
                )}
              </div>
              <div>
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Camera size={14} />
                  {fotoExibida ? 'Trocar foto' : 'Enviar foto'}
                </button>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP · Máx. 5MB</p>
              </div>
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFotoChange} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Telefone</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={mascararTelefone(form.telefone)}
                onChange={(e) => set('telefone', e.target.value.replace(/\D/g, ''))}
                maxLength={15} placeholder="(00) 00000-0000"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <button type="submit" disabled={isProcessando}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-sm">
            <Save size={15} />
            {uploading ? 'Enviando foto...' : salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </Card>
    </div>
  )
}
