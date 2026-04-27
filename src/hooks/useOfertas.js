import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useIgrejaId } from './useAuth'

export function useOfertas() {
  const igrejaId = useIgrejaId()
  const [ofertas, setOfertas] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const buscarOfertas = useCallback(async (apenasAtivas = false) => {
    if (!igrejaId) return
    setLoading(true)
    setErro(null)
    try {
      let query = supabase
        .from('ofertas')
        .select('*')
        .eq('igreja_id', igrejaId)
        .order('criada_em', { ascending: false })

      if (apenasAtivas) query = query.eq('ativo', true)

      const { data, error } = await query
      if (error) throw error
      setOfertas(data ?? [])
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [igrejaId])

  async function criarOferta(dados) {
    const { data, error } = await supabase
      .from('ofertas')
      .insert({ ...dados, igreja_id: igrejaId, ativo: true })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function atualizarOferta(id, dados) {
    const { data, error } = await supabase
      .from('ofertas')
      .update({ ...dados, atualizada_em: new Date().toISOString() })
      .eq('id', id)
      .eq('igreja_id', igrejaId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function alternarStatus(id, ativo) {
    return atualizarOferta(id, { ativo: !ativo })
  }

  return { ofertas, loading, erro, buscarOfertas, criarOferta, atualizarOferta, alternarStatus }
}
