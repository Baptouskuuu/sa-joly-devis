import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import type { Devis } from '../types/devis'
import type { SettingsSociete } from '../types/settings'
import DevisPreview from './DevisPreview'

interface Props {
  devis: Devis
  settings: SettingsSociete
}

export default function DevisPublic({ devis, settings }: Props) {
  const previewRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: `Devis-${devis.numero}`,
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="no-print bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt={settings.nom} className="h-8 object-contain brightness-0 invert" />
          <div>
            <h1 className="text-sm font-semibold leading-none">{settings.nom}</h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{devis.numero}</p>
          </div>
        </div>
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Télécharger PDF
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="shadow-xl rounded-xl overflow-hidden">
          <DevisPreview ref={previewRef} devis={devis} settings={settings} />
        </div>
      </main>
    </div>
  )
}
