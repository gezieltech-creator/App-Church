import { useState, useEffect } from 'react'

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [instalado, setInstalado] = useState(false)

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    if (isStandalone) {
      setInstalado(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPromptEvent(e)
    }

    const onInstalled = () => setInstalado(true)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const instalar = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setInstalado(true)
    setPromptEvent(null)
  }

  return {
    podeInstalar: !!promptEvent,
    instalado,
    instalar,
    isIOS,
    isStandalone,
  }
}
