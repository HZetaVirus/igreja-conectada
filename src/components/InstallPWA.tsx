import { usePWA } from '../hooks/usePWA'

export default function InstallPWA() {
  const { isInstallable, installApp } = usePWA()

  if (!isInstallable) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-primary-600 text-white px-6 py-4 rounded-lg shadow-xl max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1">
            <h3 className="font-bold mb-1">Instalar App</h3>
            <p className="text-sm text-primary-100 mb-3">
              Instale o Igreja Conectada no seu dispositivo para acesso rápido
            </p>
            <div className="flex gap-2">
              <button
                onClick={installApp}
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-50 transition"
              >
                Instalar
              </button>
              <button
                onClick={() => {}}
                className="text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
