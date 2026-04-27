export default function Card({ children, className = '', padding = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        ${padding ? 'p-5' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon size={18} className="text-blue-700" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function MetricCard({ title, value, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-700', value: 'text-blue-900' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-700', value: 'text-purple-900' },
    green: { bg: 'bg-green-50', icon: 'text-green-700', value: 'text-green-900' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-700', value: 'text-orange-900' },
  }
  const c = colors[color] ?? colors.blue

  return (
    <Card className="flex-1 min-w-[140px]">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon size={20} className={c.icon} />
      </div>
      <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
      {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
    </Card>
  )
}
