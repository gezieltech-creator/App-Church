import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const ROLES_ADMIN = ['admin', 'super_admin', 'lideranca']

export default function Login() {
  const navigate = useNavigate()
  const { signIn, membro, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Redirecionar assim que membro ativo for carregado
  useEffect(() => {
    if (authLoading || !membro) return
    if (membro.status === 'ativo') {
      const destino = ROLES_ADMIN.includes(membro.role) ? '/admin' : '/dashboard'
      navigate(destino, { replace: true })
    }
  }, [membro, authLoading, navigate])

  async function handleSubmit(e) {
  e.preventDefault()
  if (!email || !senha) { setErro('Preencha todos os campos.'); return }
  setErro('')
  setLoading(true)
  try {
    await signIn(email, senha)
    // Não colocar setLoading(false) aqui
    // O redirecionamento via useEffect vai acontecer
    // quando o membro carregar
  } catch {
    setErro('E-mail ou senha inválidos.')
    setLoading(false) // Só reseta loading se der erro
  }
}

  if (authLoading) return <PageLoader />

  return (
    <div className="min-h-svh flex">
      {/* Left - brand */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-950 via-blue-900 to-purple-800 flex-col justify-center items-center p-12 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">Igreja Conectada</h1>
        <p className="text-blue-200 text-lg text-center max-w-xs leading-relaxed">
          Gestão moderna e completa para sua comunidade de fé.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-xs">
          {['Membros', 'Eventos', 'Ofertas', 'Notificações'].map((item) => (
            <div key={item} className="bg-white/10 rounded-xl px-4 py-3 text-sm font-medium backdrop-blur-sm text-center">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center p-6 sm:p-10 bg-white">
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-purple-700 flex items-center justify-center">
            <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">Igreja Conectada</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Entrar na conta</h2>
        <p className="text-gray-500 text-sm mb-8">Use o e-mail e senha cadastrados.</p>

        {erro && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
            ) : <LogIn size={16} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Não tem conta?{' '}
          <Link to="/pre-cadastro" className="text-blue-700 font-medium hover:underline">
            Fazer pré-cadastro
          </Link>
        </p>
      </div>
    </div>
  )
}
