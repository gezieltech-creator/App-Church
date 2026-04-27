import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const icons = {
  sucesso: CheckCircle,
  erro: XCircle,
  aviso: AlertCircle,
}

const cores = {
  sucesso: 'bg-green-50 border-green-200 text-green-800',
  erro: 'bg-red-50 border-red-200 text-red-800',
  aviso: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const coresIcone = {
  sucesso: 'text-green-500',
  erro: 'text-red-500',
  aviso: 'text-yellow-500',
}

let toastId = 0
let setToastsExternal = null

export function toast(mensagem, tipo = 'sucesso', duracao = 3500) {
  if (!setToastsExternal) return
  const id = ++toastId
  setToastsExternal((prev) => [...prev, { id, mensagem, tipo }])
  setTimeout(() => setToastsExternal((prev) => prev.filter((t) => t.id !== id)), duracao)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    setToastsExternal = setToasts
    return () => { setToastsExternal = null }
  }, [])

  function remover(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(({ id, mensagem, tipo }) => {
        const Icon = icons[tipo] ?? icons.sucesso
        return (
          <div
            key={id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-[slideIn_200ms_ease-out] ${cores[tipo] ?? cores.sucesso}`}
          >
            <Icon size={17} className={`shrink-0 mt-0.5 ${coresIcone[tipo] ?? coresIcone.sucesso}`} />
            <span className="flex-1">{mensagem}</span>
            <button onClick={() => remover(id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={15} />
            </button>
          </div>
        )
      })}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
