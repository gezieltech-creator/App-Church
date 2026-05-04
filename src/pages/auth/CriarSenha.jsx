import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { validarEmail } from '../../utils/validators'

export default function CriarSenha() {
  const navigate = useNavigate()
  const location = useLocation()
  const membro_id = location.state?.membro_id

  const [nomeMembro, setNomeMembro] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!membro_id) {
      navigate('/primeiro-acesso', { replace: true })
      return
    }
    supabase
      .from('membros')
      .select('nome_completo')
      .eq('id', membro_id)
      .single()
      .then(({ data }) => {
        if (data) setNomeMembro(data.nome_completo)
        setCarregando(false)
      })
  }, [membro_id, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validarEmail(email)) { setErro('E-mail inválido.'); return }
    if (senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }

    setErro('')
    setLoading(true)
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
        .eq('id', membro_id)

      await supabase.auth.signInWithPassword({ email, password: senha })

      setSucesso(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (e) {
      const msg = e?.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setErro('Este e-mail já está em uso. Tente outro.')
      } else {
        setErro('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-gray-50">
        <svg className="animate-spin w-6 h-6 text-blue-900" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      </div>
    )
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
    <div className="min-h-svh flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-purple-700 mx-auto mb-6">
          <KeyRound size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Criar acesso</h2>
        {nomeMembro && (
          <p className="text-sm text-gray-500 text-center mb-1">
            Olá, <span className="font-medium text-gray-700">{nomeMembro}</span>!
          </p>
        )}
        <p className="text-sm text-gray-500 text-center mb-6">
          Defina seu e-mail e senha para acessar o app.
        </p>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErro('') }}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro('') }}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Confirmar senha</label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => { setConfirmar(e.target.value); setErro('') }}
              placeholder="Digite novamente"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            ) : <KeyRound size={16} />}
            {loading ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
