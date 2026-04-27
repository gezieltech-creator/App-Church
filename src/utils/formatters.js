export function formatarCPF(cpf) {
  const numeros = cpf.replace(/\D/g, '')
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatarTelefone(tel) {
  const numeros = tel.replace(/\D/g, '')
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function formatarCNPJ(cnpj) {
  const numeros = cnpj.replace(/\D/g, '')
  return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatarData(dataISO) {
  if (!dataISO) return ''
  const data = new Date(dataISO + 'T00:00:00')
  return data.toLocaleDateString('pt-BR')
}

export function formatarDataHora(dataISO) {
  if (!dataISO) return ''
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatarDataInput(dataISO) {
  if (!dataISO) return ''
  return dataISO.split('T')[0]
}

export function mascararCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export function mascararTelefone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1')
}

export function obterIniciais(nome) {
  if (!nome) return '??'
  const partes = nome.trim().split(' ')
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function labelRole(role) {
  const labels = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    lideranca: 'Liderança',
    membro: 'Membro',
    visitante: 'Visitante',
  }
  return labels[role] || role
}

export function labelStatus(status) {
  const labels = {
    aguardando: 'Aguardando',
    aprovado: 'Aprovado',
    ativo: 'Ativo',
    inativo: 'Inativo',
    agendado: 'Agendado',
    cancelado: 'Cancelado',
    concluido: 'Concluído',
  }
  return labels[status] || status
}

export function aniversariantesDoMes(membros) {
  const mesAtual = new Date().getMonth() + 1
  return membros.filter((m) => {
    if (!m.data_nascimento) return false
    const mes = parseInt(m.data_nascimento.split('-')[1], 10)
    return mes === mesAtual
  })
}
