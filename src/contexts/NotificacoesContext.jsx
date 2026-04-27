import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from './AuthContext'

const NotificacoesContext = createContext(null)

export function NotificacoesProvider({ children }) {
  const { membro } = useAuthContext()
  const [notificacoes, setNotificacoes] = useState([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!membro?.id || membro.status !== 'ativo') {
      setNotificacoes([])
      setNaoLidas(0)
      return
    }

    const buscarNotificacoes = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('notificacoes')
          .select('*')
          .eq('membro_id', membro.id)
          .order('criada_em', { ascending: false })
          .limit(50)

        if (data) {
          setNotificacoes(data)
          const count = data.filter((n) => !n.lida).length
          setNaoLidas(count)
          if ('setAppBadge' in navigator) {
            count > 0
              ? navigator.setAppBadge(count).catch(() => {})
              : navigator.clearAppBadge().catch(() => {})
          }
        }
      } catch {
        // falha silenciosa — não bloqueia o app
      } finally {
        setLoading(false)
      }
    }

    buscarNotificacoes()
    const intervalo = setInterval(buscarNotificacoes, 60_000)
    return () => clearInterval(intervalo)
  }, [membro?.id, membro?.status])

  async function marcarComoLida(id) {
    await supabase
      .from('notificacoes')
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq('id', id)
      .eq('membro_id', membro.id)
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
    setNaoLidas((prev) => Math.max(0, prev - 1))
  }

  async function marcarTodasComoLidas() {
    await supabase
      .from('notificacoes')
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq('membro_id', membro.id)
      .eq('lida', false)
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    setNaoLidas(0)
    if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {})
  }

  return (
    <NotificacoesContext.Provider value={{ notificacoes, naoLidas, loading, marcarComoLida, marcarTodasComoLidas }}>
      {children}
    </NotificacoesContext.Provider>
  )
}

export function useNotificacoesContext() {
  const ctx = useContext(NotificacoesContext)
  if (!ctx) throw new Error('useNotificacoesContext deve ser usado dentro do NotificacoesProvider')
  return ctx
}
