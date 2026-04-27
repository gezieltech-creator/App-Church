import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageLoader } from './ui/LoadingSpinner'

export default function RotaProtegida({ children, roles }) {
  const { user, membro, loading } = useAuth()

  if (loading) return <PageLoader />

  if (!user) return <Navigate to="/login" replace />

  // Membro ainda não carregado ou sem perfil
  if (!membro) return <StatusBloqueado mensagem="Seu perfil não foi encontrado. Entre em contato com o administrador." />

  // Verificar status
  if (membro.status === 'aguardando') {
    return (
      <StatusBloqueado
        titulo="Cadastro em análise"
        mensagem="Seu cadastro está sendo analisado pelo administrador. Você será notificado por e-mail quando for aprovado."
        icone="⏳"
      />
    )
  }

  if (membro.status === 'aprovado') {
    return (
      <StatusBloqueado
        titulo="Aguardando criação de senha"
        mensagem="Seu cadastro foi aprovado! Verifique seu e-mail para criar sua senha de acesso."
        icone="📧"
      />
    )
  }

  if (membro.status === 'inativo') {
    return (
      <StatusBloqueado
        titulo="Acesso inativo"
        mensagem="Sua conta está inativa. Entre em contato com o administrador da sua igreja."
        icone="🔒"
      />
    )
  }

  // Verificar role se necessário
  if (roles && !roles.includes(membro.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function StatusBloqueado({ titulo = 'Acesso bloqueado', mensagem, icone = '🔒' }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-svh flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">{icone}</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{titulo}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{mensagem}</p>
        <button
          onClick={signOut}
          className="text-sm text-blue-700 hover:underline font-medium"
        >
          Sair
        </button>
      </div>
    </div>
  )
}
