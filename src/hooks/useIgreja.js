import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useIgrejaId } from './useAuth'

export function useIgreja() {
  const igrejaId = useIgrejaId()
  const [igreja, setIgreja] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const buscarIgreja = useCallback(async () => {
    if (!igrejaId) return
    setLoading(true)
    setErro(null)
    try {
      const { data, error } = await supabase
        .from('igrejas')
        .select('*')
        .eq('id', igrejaId)
        .single()
      if (error) throw error
      setIgreja(data)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [igrejaId])

  async function atualizarIgreja(dados) {
    const { data, error } = await supabase
      .from('igrejas')
      .update({ ...dados, atualizada_em: new Date().toISOString() })
      .eq('id', igrejaId)
      .select()
      .single()
    if (error) throw error
    setIgreja(data)
    return data
  }

  async function buscarIgrejas() {
    const { data, error } = await supabase
      .from('igrejas')
      .select('id, nome, cnpj')
      .eq('status', 'ativa')
      .order('nome')
    if (error) throw error
    return data ?? []
  }

  return { igreja, loading, erro, buscarIgreja, atualizarIgreja, buscarIgrejas }
}
