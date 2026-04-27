import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useIgrejaId } from './useAuth'

export function useMembros() {
  const igrejaId = useIgrejaId()
  const [membros, setMembros] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const buscarMembros = useCallback(async (filtros = {}) => {
    if (!igrejaId) return
    setLoading(true)
    setErro(null)
    try {
      let query = supabase
        .from('membros')
        .select('*')
        .eq('igreja_id', igrejaId)
        .order('nome_completo')

      if (filtros.status) query = query.eq('status', filtros.status)
      if (filtros.role) query = query.eq('role', filtros.role)
      if (filtros.busca) query = query.ilike('nome_completo', `%${filtros.busca}%`)

      const { data, error } = await query
      if (error) throw error
      setMembros(data ?? [])
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [igrejaId])

  async function criarMembro(dados) {
    const { data, error } = await supabase
      .from('membros')
      .insert({ ...dados, igreja_id: igrejaId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function atualizarMembro(id, dados) {
    const { data, error } = await supabase
      .from('membros')
      .update({ ...dados, atualizada_em: new Date().toISOString() })
      .eq('id', id)
      .eq('igreja_id', igrejaId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function aprovarMembro(id) {
    return atualizarMembro(id, { status: 'aprovado' })
  }

  async function rejeitarMembro(id) {
    return atualizarMembro(id, { status: 'inativo' })
  }

  async function convidarMembro(email) {
    const { error } = await supabase.auth.admin.inviteUserByEmail(email)
    if (error) throw error
  }

  return {
    membros,
    loading,
    erro,
    buscarMembros,
    criarMembro,
    atualizarMembro,
    aprovarMembro,
    rejeitarMembro,
    convidarMembro,
  }
}
