import { useAuthContext } from '../contexts/AuthContext'

export function useAuth() {
  return useAuthContext()
}

export function useIsAdmin() {
  const { membro } = useAuthContext()
  return membro?.role === 'admin' || membro?.role === 'super_admin'
}

export function useIsLideranca() {
  const { membro } = useAuthContext()
  return ['admin', 'super_admin', 'lideranca'].includes(membro?.role)
}

export function useIgrejaId() {
  const { membro } = useAuthContext()
  return membro?.igreja_id ?? null
}
