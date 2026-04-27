import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [membro, setMembro] = useState(null)
  const [loading, setLoading] = useState(true)
  const inicializado = useRef(false)

  const carregarMembro = async (userId) => {
    if (!userId) { setMembro(null); return }
    try {
      const { data: membroData, error } = await supabase
        .from('membros')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle()

      if (error || !membroData) { setMembro(null); return }

      const { data: igrejaData } = await supabase
        .from('igrejas')
        .select('*')
        .eq('id', membroData.igreja_id)
        .maybeSingle()

      setMembro({ ...membroData, igrejas: igrejaData ?? null })
    } catch {
      setMembro(null)
    }
  }

  useEffect(() => {
    // PASSO 1: Inicializar com getSession (lê do localStorage diretamente)
    const inicializar = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await carregarMembro(session.user.id)
        } else {
          setUser(null)
          setMembro(null)
        }
      } catch {
        setUser(null)
        setMembro(null)
      } finally {
        setLoading(false)
        inicializado.current = true
      }
    }

    inicializar()

    // PASSO 2: onAuthStateChange só para eventos APÓS inicialização
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!inicializado.current) return

        if (event === 'SIGNED_OUT') {
          setUser(null)
          setMembro(null)
          return
        }

        if (event === 'SIGNED_IN') {
          setUser(session.user)
          await carregarMembro(session.user.id)
          return
        }

        if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          return
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    setUser(null)
    setMembro(null)
    await supabase.auth.signOut()
    localStorage.removeItem('church-app-auth')
  }

  async function recarregarMembro() {
    if (!user?.id) return
    await carregarMembro(user.id)
  }

  const value = { user, membro, loading, signIn, signOut, recarregarMembro }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro do AuthProvider')
  return ctx
}
