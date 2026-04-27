import { obterIniciais } from '../../utils/formatters'

const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
}

const colors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]

function getColor(nome = '') {
  const index = nome.charCodeAt(0) % colors.length
  return colors[index] ?? colors[0]
}

export default function Avatar({ nome, fotoUrl, size = 'md', className = '' }) {
  const sizeClass = sizes[size] ?? sizes.md

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizeClass} rounded-full shrink-0 flex items-center justify-center
        font-semibold ${getColor(nome)} ${className}
      `}
    >
      {obterIniciais(nome)}
    </div>
  )
}
