export default function Input({
  label,
  erro,
  hint,
  className = '',
  required,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white
          text-gray-900 placeholder-gray-400
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${erro ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 hover:border-gray-300'}
          ${className}
        `}
      />
      {erro && <p className="text-xs text-red-500">{erro}</p>}
      {hint && !erro && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

export function Select({ label, erro, children, className = '', required, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white
          text-gray-900 cursor-pointer
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${erro ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}
          ${className}
        `}
      >
        {children}
      </select>
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  )
}

export function Textarea({ label, erro, className = '', required, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white
          text-gray-900 placeholder-gray-400 resize-none
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${erro ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}
          ${className}
        `}
      />
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  )
}
