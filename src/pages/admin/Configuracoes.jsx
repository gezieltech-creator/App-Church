import { useEffect, useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { Save, Building2, MapPin, CreditCard, ImageIcon, X, Upload } from 'lucide-react'
import Card, { CardHeader } from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useIgreja } from '../../hooks/useIgreja'
import { usePermissoes } from '../../hooks/usePermissoes'
import { useIgrejaId } from '../../hooks/useAuth'
import { useUpload } from '../../hooks/useUpload'

export default function Configuracoes() {
  const { igreja, loading, buscarIgreja, atualizarIgreja } = useIgreja()
  const { podeAcessarConfiguracoes } = usePermissoes()
  const igrejaId = useIgrejaId()
  const { upload, uploading } = useUpload()
  const [form, setForm] = useState({})
  const [logoArquivo, setLogoArquivo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const logoInputRef = useRef(null)

  if (!podeAcessarConfiguracoes) return <Navigate to="/admin" replace />

  useEffect(() => { buscarIgreja() }, [buscarIgreja])

  useEffect(() => {
    if (igreja) {
      setForm({
        nome: igreja.nome ?? '',
        cnpj: igreja.cnpj ?? '',
        chave_pix: igreja.chave_pix ?? '',
        logo_url: igreja.logo_url ?? '',
        endereco_rua: igreja.endereco_rua ?? '',
        endereco_numero: igreja.endereco_numero ?? '',
        endereco_complemento: igreja.endereco_complemento ?? '',
        endereco_bairro: igreja.endereco_bairro ?? '',
        endereco_cidade: igreja.endereco_cidade ?? '',
        endereco_estado: igreja.endereco_estado ?? '',
        endereco_cep: igreja.endereco_cep ?? '',
        pastor_nome: igreja.pastor_nome ?? '',
        pastor_cargo: igreja.pastor_cargo ?? 'Pastor Presidente',
        numero_registro: igreja.numero_registro ?? '',
      })
    }
  }, [igreja])

  useEffect(() => {
    return () => { if (logoPreview) URL.revokeObjectURL(logoPreview) }
  }, [logoPreview])

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoArquivo(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function removerLogoSelecionada() {
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoArquivo(null)
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nome.trim()) { setErro('Nome da igreja obrigatório'); return }
    setSalvando(true)
    setErro('')
    try {
      const dados = { ...form }

      if (logoArquivo) {
        const ext = logoArquivo.name.split('.').pop().toLowerCase()
        dados.logo_url = await upload('igrejas', `${igrejaId}/logo.${ext}`, logoArquivo, 2)
        set('logo_url', dados.logo_url)
        setLogoArquivo(null)
        setLogoPreview(null)
      }

      await atualizarIgreja(dados)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (e) {
      setErro(e.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const field = (f, label, type = 'text', placeholder = '', colSpan = '') => (
    <div className={colSpan}>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <input type={type} value={form[f] ?? ''} onChange={(e) => set(f, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )

  const logoAtual = logoPreview ?? form.logo_url
  const isProcessando = salvando || uploading

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-400">Dados e configurações da sua igreja</p>
      </div>

      {erro && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{erro}</div>}
      {sucesso && <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 flex items-center gap-2">✅ Salvo com sucesso!</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dados básicos */}
        <Card>
          <CardHeader title="Dados da Igreja" icon={Building2} />
          <div className="space-y-3">
            {field('nome', 'Nome da Igreja', 'text', 'Nome da sua igreja')}
            {field('cnpj', 'CNPJ', 'text', '00.000.000/0001-00')}
            {field('chave_pix', 'Chave Pix Principal', 'text', 'CPF, CNPJ, e-mail ou telefone')}

            {/* Logo upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Logo da Igreja</label>
              <div className="flex items-center gap-4">
                {logoAtual ? (
                  <div className="relative">
                    <img src={logoAtual} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                    {logoArquivo && (
                      <button type="button" onClick={removerLogoSelecionada}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon size={20} className="text-gray-400" />
                  </div>
                )}
                <div>
                  <button type="button" onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <Upload size={14} />
                    {logoAtual ? 'Trocar logo' : 'Enviar logo'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP ou SVG · Máx. 2MB</p>
                </div>
              </div>
              <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden" onChange={handleLogoChange} />
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader title="Endereço" icon={MapPin} />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">{field('endereco_rua', 'Rua', 'text', 'Rua / Avenida')}</div>
            {field('endereco_numero', 'Número', 'text', 'Nº', '')}
            <div className="col-span-3">{field('endereco_complemento', 'Complemento', 'text', 'Sala, bloco...')}</div>
            {field('endereco_bairro', 'Bairro', 'text', 'Bairro')}
            {field('endereco_cidade', 'Cidade', 'text', 'Cidade')}
            {field('endereco_estado', 'Estado', 'text', 'UF')}
            {field('endereco_cep', 'CEP', 'text', '00000-000')}
          </div>
        </Card>

        {/* Carteira Digital */}
        <Card>
          <CardHeader title="Carteira Digital" icon={CreditCard} />
          <div className="space-y-3">
            {field('pastor_nome', 'Nome do Pastor', 'text', 'Nome completo do pastor')}
            {field('pastor_cargo', 'Cargo do Pastor', 'text', 'Pastor Presidente')}
            {field('numero_registro', 'Número de Registro', 'text', 'Nº de registro da igreja')}
          </div>
        </Card>

        <div className="flex justify-end">
          <button type="submit" disabled={isProcessando}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-sm">
            <Save size={15} />
            {uploading ? 'Enviando logo...' : salvando ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
