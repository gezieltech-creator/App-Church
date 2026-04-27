import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { mascararCPF, mascararTelefone } from '../../utils/formatters'
import { validarCPF, validarEmail, validarTelefone } from '../../utils/validators'

export default function PreCadastro() {
  const navigate = useNavigate()
  const [igrejas, setIgrejas] = useState([])
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erros, setErros] = useState({})

  const [form, setForm] = useState({
    igreja_id: '',
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
    data_nascimento: '',
  })

  useEffect(() => {
    supabase.from('igrejas').select('id, nome').eq('status', 'ativa').order('nome')
      .then(({ data }) => setIgrejas(data ?? []))
  }, [])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErros((prev) => ({ ...prev, [field]: undefined }))
  }

  function validar() {
    const e = {}
    if (!form.igreja_id) e.igreja_id = 'Selecione uma igreja'
    if (!form.nome_completo.trim()) e.nome_completo = 'Nome obrigatório'
    if (!validarCPF(form.cpf)) e.cpf = 'CPF inválido'
    if (!validarEmail(form.email)) e.email = 'E-mail inválido'
    if (!validarTelefone(form.telefone)) e.telefone = 'Telefone inválido'
    if (!form.data_nascimento) e.data_nascimento = 'Data obrigatória'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    try {
      const { error } = await supabase.from('membros').insert({
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, ''),
        status: 'aguardando',
        role: 'membro',
      })
      if (error) throw error
      setSucesso(true)
    } catch (e) {
      setErros({ geral: e.message.includes('unique') ? 'CPF ou e-mail já cadastrado.' : 'Erro ao enviar cadastro. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cadastro enviado!</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Seu pré-cadastro foi recebido. O administrador irá analisá-lo e você receberá um e-mail quando for aprovado.
          </p>
          <Link to="/login" className="text-sm text-blue-700 hover:underline font-medium">
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> Voltar
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
              <UserPlus size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pré-cadastro</h1>
              <p className="text-xs text-gray-400">Solicitação de membro</p>
            </div>
          </div>

          {erros.geral && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{erros.geral}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Igreja <span className="text-red-500">*</span></label>
              <select value={form.igreja_id} onChange={(e) => set('igreja_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.igreja_id ? 'border-red-400' : 'border-gray-200'}`}>
                <option value="">Selecione a sua igreja...</option>
                {igrejas.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
              {erros.igreja_id && <p className="text-xs text-red-500 mt-0.5">{erros.igreja_id}</p>}
            </div>

            {[
              { field: 'nome_completo', label: 'Nome completo', type: 'text', placeholder: 'Seu nome completo' },
              { field: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
              { field: 'data_nascimento', label: 'Data de nascimento', type: 'date' },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="text-sm font-medium text-gray-700 block mb-1">{label} <span className="text-red-500">*</span></label>
                <input type={type} value={form[field]} onChange={(e) => set(field, e.target.value)} placeholder={placeholder}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros[field] ? 'border-red-400' : 'border-gray-200'}`} />
                {erros[field] && <p className="text-xs text-red-500 mt-0.5">{erros[field]}</p>}
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">CPF <span className="text-red-500">*</span></label>
              <input type="text" value={form.cpf} onChange={(e) => set('cpf', mascararCPF(e.target.value))} maxLength={14} placeholder="000.000.000-00"
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.cpf ? 'border-red-400' : 'border-gray-200'}`} />
              {erros.cpf && <p className="text-xs text-red-500 mt-0.5">{erros.cpf}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Telefone <span className="text-red-500">*</span></label>
              <input type="text" value={form.telefone} onChange={(e) => set('telefone', mascararTelefone(e.target.value))} maxLength={15} placeholder="(00) 00000-0000"
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.telefone ? 'border-red-400' : 'border-gray-200'}`} />
              {erros.telefone && <p className="text-xs text-red-500 mt-0.5">{erros.telefone}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Enviando...' : 'Enviar pré-cadastro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
