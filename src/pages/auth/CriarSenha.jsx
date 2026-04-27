import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function CriarSenha() {
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    // Supabase injeta o token via URL hash ao abrir o link do e-mail
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuário chegou via link de convite/recuperação
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    setErro('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: senha })
      if (error) throw error

      // Atualizar status do membro para ativo
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('membros')
          .update({ status: 'ativo', atualizada_em: new Date().toISOString() })
          .eq('auth_user_id', user.id)
      }

      setSucesso(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
    } catch (e) {
      setErro('Erro ao definir senha. O link pode ter expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Senha criada!</h2>
          <p className="text-sm text-gray-500">Você será redirecionado para o app em instantes...</p>
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
        <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Criar senha</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Defina uma senha segura para acessar o app.
        </p>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{erro}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nova senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Confirmar senha</label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Digite novamente"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Força da senha */}
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
                {senha.length < 6 ? 'Muito curta' : senha.length < 10 ? 'Razoável' : 'Forte'}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 mt-2">
            {loading ? 'Salvando...' : 'Definir senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
