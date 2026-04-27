import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, useIgrejaId } from './useAuth'

export function useEventos() {
  const igrejaId = useIgrejaId()
  const { membro } = useAuth()
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const buscarEventos = useCallback(async (filtros = {}) => {
    if (!igrejaId) return
    setLoading(true)
    setErro(null)
    try {
      let query = supabase
        .from('eventos')
        .select('*, membros(nome_completo)')
        .eq('igreja_id', igrejaId)
        .order('data_inicio', { ascending: true })

      if (filtros.status) query = query.eq('status', filtros.status)
      if (filtros.dataInicio) query = query.gte('data_inicio', filtros.dataInicio)
      if (filtros.dataFim) query = query.lte('data_inicio', filtros.dataFim)

      const { data, error } = await query
      if (error) throw error
      setEventos(data ?? [])
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [igrejaId])

  async function criarEvento(dados) {
    const { data, error } = await supabase
      .from('eventos')
      .insert({
        ...dados,
        igreja_id: igrejaId,
        criado_por: membro?.id,
        status: 'agendado',
      })
      .select()
      .single()
    if (error) throw error
    await notificarMembros(data.id, data.titulo, 'evento_novo')
    return data
  }

  async function atualizarEvento(id, dados) {
    const { data, error } = await supabase
      .from('eventos')
      .update({ ...dados, atualizada_em: new Date().toISOString() })
      .eq('id', id)
      .eq('igreja_id', igrejaId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function cancelarEvento(id, titulo) {
    const resultado = await atualizarEvento(id, { status: 'cancelado' })
    await notificarMembros(id, titulo, 'evento_cancelado')
    return resultado
  }

  async function notificarMembros(referenciaId, tituloEvento, tipo) {
    const { data: membrosAtivos } = await supabase
      .from('membros')
      .select('id')
      .eq('igreja_id', igrejaId)
      .eq('status', 'ativo')

    if (!membrosAtivos?.length) return

    const mensagem =
      tipo === 'evento_novo'
        ? `Novo evento: ${tituloEvento}`
        : `Evento cancelado: ${tituloEvento}`

    const notificacoes = membrosAtivos.map((m) => ({
      igreja_id: igrejaId,
      membro_id: m.id,
      referencia_id: referenciaId,
      tipo,
      titulo: tipo === 'evento_novo' ? 'Novo Evento' : 'Evento Cancelado',
      mensagem,
    }))

    await supabase.from('notificacoes').insert(notificacoes)
  }

  return { eventos, loading, erro, buscarEventos, criarEvento, atualizarEvento, cancelarEvento }
}
