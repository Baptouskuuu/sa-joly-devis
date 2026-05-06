import { useMemo, useState, useRef } from 'react'
import type { Devis, StatutDevis } from '../types/devis'
import { deleteDevis, getDevisList, exportDevisJSON, importDevisJSON } from '../utils/storage'
import { formatDate, formatPrix } from '../utils/numero'
import { devisStatusCounts, devisTotalHT, devisKPIs } from '../utils/devis'
import ConfirmModal from './ConfirmModal'

const STATUT_LABELS: Record<StatutDevis, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
}

const STATUT_CLASSES: Record<StatutDevis, string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  envoye: 'bg-blue-100 text-blue-700',
  accepte: 'bg-green-100 text-green-700',
  refuse: 'bg-red-100 text-red-600',
}

type Filtre = 'tous' | StatutDevis

interface Props {
  onNew: () => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onSettings: () => void
}

export default function Dashboard({ onNew, onEdit, onDuplicate, onSettings }: Props) {
  const [filtre, setFiltre]       = useState<Filtre>('tous')
  const [liste, setListe]         = useState<Devis[]>(() => getDevisList())
  const [search, setSearch]       = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; numero: string } | null>(null)
  const [toast, setToast]         = useState<string | null>(null)
  const importRef                 = useRef<HTMLInputElement>(null)
  const toastTimer                = useRef<number | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3000)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteDevis(deleteTarget.id)
    setListe(getDevisList())
    setDeleteTarget(null)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(data)) throw new Error()
        const count = importDevisJSON(data)
        setListe(getDevisList())
        showToast(count > 0 ? `${count} devis importé${count > 1 ? 's' : ''}` : 'Aucun nouveau devis (déjà présents)')
      } catch {
        showToast('Fichier invalide')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtres: { key: Filtre; label: string }[] = [
    { key: 'tous', label: 'Tous' },
    { key: 'brouillon', label: 'Brouillon' },
    { key: 'envoye', label: 'Envoyé' },
    { key: 'accepte', label: 'Accepté' },
    { key: 'refuse', label: 'Refusé' },
  ]

  const kpis         = useMemo(() => devisKPIs(liste), [liste])
  const statusCounts = useMemo(() => devisStatusCounts(liste), [liste])

  const devisFiltres = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = filtre === 'tous' ? liste : liste.filter(d => d.statut === filtre)
    if (!q) return base
    return base.filter(d =>
      d.numero.toLowerCase().includes(q) ||
      d.client?.nom?.toLowerCase().includes(q) ||
      d.client?.email?.toLowerCase().includes(q)
    )
  }, [filtre, liste, search])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="SA JOLY" className="h-8 object-contain brightness-0 invert" />
          <div>
            <h1 className="text-sm font-semibold leading-none">Générateur de devis</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {liste.length} devis enregistré{liste.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSettings}
            title="Paramètres SA JOLY"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={exportDevisJSON}
            title="Exporter tous les devis en JSON"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            onClick={() => importRef.current?.click()}
            title="Importer des devis depuis un JSON"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

          <button
            onClick={onNew}
            className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau devis
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* KPI cards */}
        {liste.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CA accepté</p>
              <p className="text-xl font-bold text-green-600">{formatPrix(kpis.caAccepte)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{statusCounts.accepte} devis</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">En attente</p>
              <p className="text-xl font-bold text-blue-600">{formatPrix(kpis.caEnAttente)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{statusCounts.envoye} envoyé{statusCounts.envoye !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Taux de conversion</p>
              <p className="text-xl font-bold text-gray-900">
                {kpis.tauxConversion !== null ? `${Math.round(kpis.tauxConversion)} %` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {kpis.tauxConversion !== null
                  ? `${statusCounts.accepte} / ${statusCounts.accepte + statusCounts.refuse}`
                  : 'pas encore de données'}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total devis</p>
              <p className="text-xl font-bold text-gray-900">{kpis.totalDevis}</p>
              <p className="text-xs text-gray-400 mt-0.5">{statusCounts.brouillon} brouillon{statusCounts.brouillon !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Filtres + recherche */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex gap-2 flex-wrap">
            {filtres.map(f => (
              <button
                key={f.key}
                onClick={() => setFiltre(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtre === f.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {f.label}
                {f.key !== 'tous' && (
                  <span className="ml-1.5 text-xs opacity-60">{statusCounts[f.key]}</span>
                )}
              </button>
            ))}
          </div>
          <div className="ml-auto relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 w-48"
            />
          </div>
        </div>

        {/* Table */}
        {devisFiltres.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <p className="text-gray-400 text-sm mb-4">
              {search
                ? `Aucun résultat pour « ${search} ».`
                : filtre === 'tous'
                  ? 'Aucun devis créé pour le moment.'
                  : `Aucun devis avec le statut "${STATUT_LABELS[filtre as StatutDevis]}".`}
            </p>
            {!search && filtre === 'tous' && (
              <button onClick={onNew} className="text-sm font-medium text-gray-900 underline underline-offset-2">
                Créer le premier devis
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Montant HT</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {devisFiltres.map(devis => (
                  <tr
                    key={devis.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-inset"
                    onClick={() => onEdit(devis.id)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onEdit(devis.id)
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{devis.numero}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {devis.client?.nom || <span className="text-gray-300 italic">Sans nom</span>}
                      </p>
                      {devis.client?.contact && (
                        <p className="text-xs text-gray-400">{devis.client.contact}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatPrix(devisTotalHT(devis))}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(devis.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_CLASSES[devis.statut]}`}>
                        {STATUT_LABELS[devis.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(devis.id)}
                          title="Modifier"
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDuplicate(devis.id)}
                          title="Dupliquer"
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: devis.id, numero: devis.numero })}
                          title="Supprimer"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Confirmation suppression */}
      {deleteTarget && (
        <ConfirmModal
          title="Supprimer ce devis ?"
          message={`Le devis ${deleteTarget.numero} sera définitivement supprimé. Cette action est irréversible.`}
          confirmLabel="Supprimer"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
