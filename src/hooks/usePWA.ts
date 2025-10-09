import { useEffect, useState } from 'react'

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration)
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error)
        })
    } else {
      console.warn('⚠️ Service Worker não suportado neste navegador')
    }

    // Detectar se o app pode ser instalado
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA pode ser instalado!')
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Detectar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ PWA já está instalado')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  return { isInstallable, installApp }
}
