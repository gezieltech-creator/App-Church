import { useNotificacoesContext } from '../contexts/NotificacoesContext'

export function useNotificacoes() {
  return useNotificacoesContext()
}
