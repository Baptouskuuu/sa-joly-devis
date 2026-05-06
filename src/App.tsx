import { useState, useRef, useEffect, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'
import DevisForm from './components/DevisForm'
import DevisPreview from './components/DevisPreview'
import DevisPublic from './components/DevisPublic'
import Dashboard from './components/Dashboard'
import SettingsModal from './components/SettingsModal'
import { lazy, Suspense } from 'react'
const SplashScreen = lazy(() => import('./components/SplashScreen'))
import type { Devis } from './types/devis'
import type { SettingsSociete } from './types/settings'
import {
  getSettings, saveSettings,
  getDevisById, saveDevis,
  creerNouveauDevis, dupliquerDevis,
} from './utils/storage'
import { buildShareUrl, buildMailtoUrl, decodeShare } from './utils/share'
import './index.css'

type AppView   = 'dashboard' | 'editor'
type EditorTab = 'form' | 'split' | 'preview'

// Check for public share link before rendering the app
function getPublicPayload() {
  const hash = window.location.hash
  if (!hash.startsWith('#/view/')) return null
  return decodeShare(hash.slice(7))
}

export default function App() {
  const [publicPayload]                = useState(getPublicPayload)
  const [splash, setSplash]            = useState(() => !publicPayload)
  const [appView, setAppView]          = useState<AppView>('dashboard')
  const [devis, setDevis]              = useState<Devis | null>(null)
  const [tab, setTab]                  = useState<EditorTab>('form')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings]        = useState<SettingsSociete>(getSettings)
  const [savedMsg, setSavedMsg]        = useState(false)
  const [shareToast, setShareToast]    = useState(false)
  const previewRef                     = useRef<HTMLDivElement>(null)
  const savedTimerRef                  = useRef<number | null>(null)
  const shareTimerRef                  = useRef<number | null>(null)

  useEffect(() => () => {
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current)
  }, [])

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: `Devis-${devis?.numero}`,
  })

  const handleUpdate = useCallback((updated: Devis) => {
    setDevis(updated)
    saveDevis(updated)
    setSavedMsg(true)
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
    savedTimerRef.current = window.setTimeout(() => setSavedMsg(false), 2000)
  }, [])

  const openEditor = (d: Devis) => {
    setDevis(d)
    setTab('form')
    setAppView('editor')
  }

  const handleNew       = () => { const d = creerNouveauDevis(); saveDevis(d); openEditor(d) }
  const handleEdit      = (id: string) => { const d = getDevisById(id); if (d) openEditor(d) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if ((e.key === 'n' || e.key === 'N') && appView === 'dashboard') {
        e.preventDefault()
        handleNew()
      }
      if ((e.key === 'p' || e.key === 'P') && appView === 'editor') {
        e.preventDefault()
        handlePrint()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // handleNew and handlePrint are stable references
  }, [appView]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDuplicate = (id: string) => {
    const src = getDevisById(id)
    if (!src) return
    const dup = dupliquerDevis(src)
    saveDevis(dup)
    openEditor(dup)
  }

  const handleSaveSettings = (s: SettingsSociete) => {
    saveSettings(s)
    setSettings(s)
    setShowSettings(false)
  }

  const handleCopyLink = () => {
    if (!devis) return
    const url = buildShareUrl(devis, settings)
    navigator.clipboard.writeText(url).then(() => {
      setShareToast(true)
      if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current)
      shareTimerRef.current = window.setTimeout(() => setShareToast(false), 2500)
    })
  }

  const handleEmail = () => {
    if (!devis) return
    window.open(buildMailtoUrl(devis, settings), '_blank')
  }

  // ── Splash ──
  if (splash) return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <SplashScreen onDone={() => setSplash(false)} />
    </Suspense>
  )

  // ── Vue publique (lien partagé) ──
  if (publicPayload) {
    return <DevisPublic devis={publicPayload.devis} settings={publicPayload.settings} />
  }

  // ── Dashboard ──
  if (appView === 'dashboard') {
    return (
      <>
        <Dashboard
          onNew={handleNew}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onSettings={() => setShowSettings(true)}
        />
        {showSettings && (
          <SettingsModal initial={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
        )}
      </>
    )
  }

  if (!devis) return null

  const tabCls = (active: boolean) =>
    `flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      active ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
    }`

  // ── Éditeur ──
  return (
    <>
      <div className={`min-h-screen bg-gray-100 ${tab === 'split' ? 'flex flex-col' : ''}`}>
        {/* Topbar */}
        <header className="no-print bg-gray-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setDevis(null); setAppView('dashboard') }}
              title="Retour au tableau de bord"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <img src="/logo.jpeg" alt="SA JOLY" className="h-8 object-contain brightness-0 invert" />
            <div>
              <h1 className="text-sm font-semibold leading-none">Générateur de devis</h1>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{devis.numero}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs transition-opacity duration-300 ${savedMsg ? 'text-green-400 opacity-100' : 'opacity-0'}`}>
              ✓ Sauvegardé
            </span>

            <button
              onClick={() => setShowSettings(true)}
              title="Paramètres SA JOLY"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Sélecteur de vue */}
            <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
              <button onClick={() => setTab('form')} className={tabCls(tab === 'form')}>
                Formulaire
              </button>
              <button onClick={() => setTab('split')} title="Vue partagée" className={tabCls(tab === 'split')}>
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="1" width="6" height="14" rx="1.5" />
                  <rect x="9" y="1" width="6" height="14" rx="1.5" />
                </svg>
              </button>
              <button onClick={() => setTab('preview')} className={tabCls(tab === 'preview')}>
                Aperçu
              </button>
            </div>

            {/* Envoyer par email */}
            <button
              onClick={handleEmail}
              title="Envoyer par email"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Copier le lien client */}
            <button
              onClick={handleCopyLink}
              title="Copier le lien client"
              className={`p-2 rounded-lg transition-colors ${shareToast ? 'text-green-400 bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {shareToast ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Exporter PDF
            </button>
          </div>
        </header>

        {/* Contenu principal */}
        {tab === 'split' ? (
          <div className="grid grid-cols-[55fr_45fr] gap-6 px-6 py-6 flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
            <div className="bg-white rounded-xl shadow-sm p-8 overflow-y-auto">
              <DevisForm key={devis.id} initialDevis={devis} onUpdate={handleUpdate} />
            </div>
            <div className="shadow-xl rounded-xl overflow-y-auto">
              <DevisPreview devis={devis} settings={settings} />
            </div>
          </div>
        ) : (
          <main className="max-w-6xl mx-auto px-6 py-8">
            {tab === 'form' ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <DevisForm key={devis.id} initialDevis={devis} onUpdate={handleUpdate} />
              </div>
            ) : (
              <div className="shadow-xl rounded-xl overflow-hidden">
                <DevisPreview devis={devis} settings={settings} />
              </div>
            )}
          </main>
        )}

        {/* Preview cachée pour l'impression */}
        <div className="hidden">
          <DevisPreview ref={previewRef} devis={devis} settings={settings} />
        </div>
      </div>

      {showSettings && (
        <SettingsModal initial={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}
