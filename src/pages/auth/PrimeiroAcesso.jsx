import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { mascararCPF } from '../../utils/formatters'
import { validarCPF, validarEmail } from '../../utils/validators'

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  )
}

function StepIndicator({ etapa }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            n < etapa ? 'bg-blue-900 text-white' :
            n === etapa ? 'bg-blue-900 text-white ring-4 ring-blue-100' :
            'bg-gray-100 text-gray-400'
          }`}>
            {n < etapa ? '✓' : n}
          </div>
          {n < 2 && <div className={`h-0.5 w-8 rounded-full transition-all ${etapa > 1 ? 'bg-blue-900' : 'bg-gray-100'}`} />}
        </div>
      ))}
      <p className="text-xs text-gray-400 ml-1">Etapa {etapa} de 2</p>
    </div>
  )
}

export default function PrimeiroAcesso() {
  const navigate = useNavigate()

  // Etapa 1
  const [etapa, setEtapa] = useState(1)
  const [cpf, setCpf] = useState('')
  const [loadingCpf, setLoadingCpf] = useState(false)
  const [erroCpf, setErroCpf] = useState('')

  // Dados do membro encontrado
  const [membroId, setMembroId] = useState(null)
  const [membroNome, setMembroNome] = useState('')

  // Etapa 2
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loadingConta, setLoadingConta] = useState(false)
  const [erroConta, setErroConta] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function handleBuscarCPF(e) {
    e.preventDefault()
    if (!validarCPF(cpf)) { setErroCpf('CPF inválido. Verifique e tente novamente.'); return }

    setErroCpf('')
    setLoadingCpf(true)
    try {
      const { data, error } = await supabase
        .from('membros')
        .select('id, nome_completo, status, auth_user_id')
        .eq('cpf', cpf.replace(/\D/g, ''))
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setErroCpf('CPF não cadastrado. Procure o secretário da sua igreja.')
        return
      }

      if (data.auth_user_id) {
        navigate('/login', { state: { mensagem: 'Você já possui acesso. Faça login normalmente.' } })
        return
      }

      if (data.status === 'aguardando') {
        setErroCpf('Seu cadastro ainda não foi aprovado. Aguarde a aprovação do administrador.')
        return
      }

      if (data.status !== 'aprovado') {
        setErroCpf('CPF não cadastrado. Procure o secretário da sua igreja.')
        return
      }

      setMembroId(data.id)
      setMembroNome(data.nome_completo)
      setEtapa(2)
    } catch {
      setErroCpf('Erro ao buscar cadastro. Tente novamente.')
    } finally {
      setLoadingCpf(false)
    }
  }

  async function handleCriarConta(e) {
    e.preventDefault()
    if (!validarEmail(email)) { setErroConta('E-mail inválido.'); return }
    if (senha.length < 8) { setErroConta('A senha deve ter pelo menos 8 caracteres.'); return }
    if (senha !== confirmar) { setErroConta('As senhas não coincidem.'); return }

    setErroConta('')
    setLoadingConta(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: window.location.origin },
      })
      if (signUpError) throw signUpError

      await supabase
        .from('membros')
        .update({ auth_user_id: data.user.id, email, status: 'ativo' })
        .eq('id', membroId)

      await supabase.auth.signInWithPassword({ email, password: senha })

      setSucesso(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      const msg = err?.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setErroConta('Este e-mail já está em uso. Tente outro.')
      } else {
        setErroConta('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoadingConta(false)
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Conta criada!</h2>
          <p className="text-sm text-gray-500">Você será redirecionado em instantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh flex">
      {/* Left — brand (desktop) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-950 via-blue-900 to-purple-800 flex-col justify-center items-center p-12 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">Igreja Conectada</h1>
        <p className="text-blue-200 text-lg text-center max-w-xs leading-relaxed">
          Crie seu acesso e conecte-se à sua comunidade.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center p-6 sm:p-10 bg-white">
        {/* Logo mobile */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Igreja Conectada</span>
        </div>

        <StepIndicator etapa={etapa} />

        {/* ── ETAPA 1 — CPF ── */}
        {etapa === 1 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Primeiro acesso</h2>
            <p className="text-gray-500 text-sm mb-8">Informe seu CPF para localizar seu cadastro.</p>

            {erroCpf && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {erroCpf}
              </div>
            )}

            <form onSubmit={handleBuscarCPF} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => { setCpf(mascararCPF(e.target.value)); setErroCpf('') }}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  autoComplete="off"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loadingCpf}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loadingCpf ? <Spinner /> : <Search size={16} />}
                {loadingCpf ? 'Buscando...' : 'Continuar'}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-500 text-center">
              Já tem acesso?{' '}
              <Link to="/login" className="text-blue-700 font-medium hover:underline">Entrar</Link>
            </p>
          </>
        )}

        {/* ── ETAPA 2 — Email + Senha ── */}
        {etapa === 2 && (
          <>
            <button
              onClick={() => { setEtapa(1); setErroConta('') }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Voltar
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">Criar acesso</h2>
            <p className="text-gray-500 text-sm mb-1">
              Olá, <span className="font-medium text-gray-700">{membroNome}</span>!
            </p>
            <p className="text-gray-500 text-sm mb-8">Defina seu e-mail e senha para acessar o app.</p>

            {erroConta && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {erroConta}
              </div>
            )}

            <form onSubmit={handleCriarConta} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErroConta('') }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setErroConta('') }}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {senha.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        senha.length >= i * 2 ? i <= 2 ? 'bg-orange-400' : 'bg-green-500' : 'bg-gray-100'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {senha.length < 8 ? 'Muito curta' : senha.length < 12 ? 'Razoável' : 'Forte'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => { setConfirmar(e.target.value); setErroConta('') }}
                  placeholder="Digite novamente"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loadingConta}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
              >
                {loadingConta ? <Spinner /> : <KeyRound size={16} />}
                {loadingConta ? 'Criando conta...' : 'Criar minha conta'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
