const variants = {
  default: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
}

export default function Badge({ children, variant = 'default', size = 'md', dot }) {
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant] ?? variants.default} ${sizes[size] ?? sizes.md}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor(variant)}`} />}
      {children}
    </span>
  )
}

function dotColor(variant) {
  const colors = {
    default: 'bg-gray-500',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    orange: 'bg-orange-600',
  }
  return colors[variant] ?? 'bg-gray-500'
}

export function statusBadge(status) {
  const map = {
    ativo: { variant: 'green', label: 'Ativo' },
    aprovado: { variant: 'blue', label: 'Aprovado' },
    aguardando: { variant: 'yellow', label: 'Aguardando' },
    inativo: { variant: 'default', label: 'Inativo' },
    agendado: { variant: 'blue', label: 'Agendado' },
    cancelado: { variant: 'red', label: 'Cancelado' },
    concluido: { variant: 'green', label: 'Concluído' },
    suspensa: { variant: 'red', label: 'Suspensa' },
    ativa: { variant: 'green', label: 'Ativa' },
  }
  const config = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={config.variant} dot>{config.label}</Badge>
}

export function roleBadge(role) {
  const map = {
    super_admin: { variant: 'purple', label: 'Super Admin' },
    admin: { variant: 'blue', label: 'Admin' },
    lideranca: { variant: 'orange', label: 'Liderança' },
    membro: { variant: 'green', label: 'Membro' },
    visitante: { variant: 'default', label: 'Visitante' },
  }
  const config = map[role] ?? { variant: 'default', label: role }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
