import { useAuth } from './useAuth'

export function usePermissoes() {
  const { membro } = useAuth()
  const role = membro?.role

  return {
    // Eventos
    podeIncluirEvento: ['super_admin', 'admin', 'lideranca'].includes(role),
    podeEditarEvento:  ['super_admin', 'admin', 'lideranca'].includes(role),
    podeExcluirEvento: ['super_admin', 'admin'].includes(role),

    // Membros
    podeCadastrarMembro: ['super_admin', 'admin'].includes(role),
    podeEditarMembro:    ['super_admin', 'admin'].includes(role),
    podeExcluirMembro:   ['super_admin'].includes(role),

    // Ofertas
    podeCriarOferta:   ['super_admin'].includes(role),
    podeEditarOferta:  ['super_admin', 'admin'].includes(role),
    podeExcluirOferta: ['super_admin'].includes(role),

    // Configurações
    podeAcessarConfiguracoes: ['super_admin', 'admin'].includes(role),

    // Navegação admin
    podeAcessarAdmin: ['super_admin', 'admin', 'lideranca'].includes(role),
  }
}
