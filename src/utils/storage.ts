import type { Devis } from '../types/devis'
import type { SettingsSociete } from '../types/settings'
import type { ClientCatalogue, ProduitCatalogue } from '../types/catalogue'
import { defaultSettings } from '../types/settings'
import { dateAujourdhui } from './numero'

const KEYS = {
  devis:    'sajoly_devis',
  settings: 'sajoly_settings',
  counter:  'sajoly_counter',
  clients:  'sajoly_clients',
  produits: 'sajoly_produits',
} as const

type UnknownRecord = Record<string, unknown>

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}

function parse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setItemIfChanged(key: string, nextValue: string): void {
  const prevValue = localStorage.getItem(key)
  if (prevValue === nextValue) return
  localStorage.setItem(key, nextValue)
}

// Migration transparente des anciens devis sans les nouveaux champs
function migrateDevis(d: unknown): Devis {
  const obj: UnknownRecord = isRecord(d) ? d : {}
  const lignesRaw = Array.isArray(obj.lignes) ? obj.lignes : []
  const now = new Date().toISOString()

  const clientObj: UnknownRecord = isRecord(obj.client) ? obj.client : {}
  const statut =
    obj.statut === 'envoye' || obj.statut === 'accepte' || obj.statut === 'refuse'
      ? obj.statut
      : 'brouillon'

  return {
    id: typeof obj.id === 'string' ? obj.id : crypto.randomUUID(),
    numero: typeof obj.numero === 'string' ? obj.numero : '',
    date: typeof obj.date === 'string' ? obj.date : dateAujourdhui(),
    validite: typeof obj.validite === 'string' ? obj.validite : '30 jours',
    statut,

    tauxTVA: typeof obj.tauxTVA === 'string' ? obj.tauxTVA : '20',
    remiseGlobale: typeof obj.remiseGlobale === 'number' ? obj.remiseGlobale : 0,

    client: {
      nom: typeof clientObj.nom === 'string' ? clientObj.nom : '',
      contact: typeof clientObj.contact === 'string' ? clientObj.contact : '',
      email: typeof clientObj.email === 'string' ? clientObj.email : '',
      adresse: typeof clientObj.adresse === 'string' ? clientObj.adresse : '',
    },

    lignes: lignesRaw.map((l) => {
      const lObj: UnknownRecord = isRecord(l) ? l : {}
      const type = lObj.type === 'titre' ? 'titre' : 'article'
      return {
        id: typeof lObj.id === 'string' ? lObj.id : crypto.randomUUID(),
        type,
        description: typeof lObj.description === 'string' ? lObj.description : '',
        reference: typeof lObj.reference === 'string' ? lObj.reference : '',
        unite: typeof lObj.unite === 'string' ? lObj.unite : (type === 'titre' ? '' : 'pièce'),
        quantite: typeof lObj.quantite === 'number' ? lObj.quantite : (type === 'titre' ? 0 : 1),
        prixUnitaire: typeof lObj.prixUnitaire === 'number' ? lObj.prixUnitaire : 0,
        remise: typeof lObj.remise === 'number' ? lObj.remise : 0,
      }
    }),

    delaiLivraison: typeof obj.delaiLivraison === 'string' ? obj.delaiLivraison : '',
    conditionsPaiement: typeof obj.conditionsPaiement === 'string' ? obj.conditionsPaiement : '30 jours fin de mois',
    notes: typeof obj.notes === 'string' ? obj.notes : '',

    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : now,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : now,
  }
}

// Devis CRUD

export function getDevisList(): Devis[] {
  const raw = parse<unknown[]>(KEYS.devis, [])
  const migrated = raw.map(migrateDevis)

  // Si migration a modifié la forme, on persiste la version migrée (une fois)
  try {
    const before = JSON.stringify(raw)
    const after = JSON.stringify(migrated)
    if (before !== after) setItemIfChanged(KEYS.devis, after)
  } catch {
    // no-op
  }

  return migrated
}

export function getDevisById(id: string): Devis | undefined {
  return getDevisList().find(d => d.id === id)
}

export function saveDevis(devis: Devis): void {
  const list = parse<unknown[]>(KEYS.devis, [])
  const idx = list.findIndex(d => isRecord(d) && typeof d.id === 'string' && d.id === devis.id)
  if (idx >= 0) { list[idx] = devis } else { list.unshift(devis) }
  setItemIfChanged(KEYS.devis, JSON.stringify(list))
}

export function deleteDevis(id: string): void {
  const list = parse<unknown[]>(KEYS.devis, []).filter(d => !(isRecord(d) && typeof d.id === 'string' && d.id === id))
  setItemIfChanged(KEYS.devis, JSON.stringify(list))
}

// Settings

export function getSettings(): SettingsSociete {
  return parse<SettingsSociete>(KEYS.settings, defaultSettings)
}

export function saveSettings(settings: SettingsSociete): void {
  setItemIfChanged(KEYS.settings, JSON.stringify(settings))
}

// Numérotation séquentielle : JOLY-2025-001

export function getNextNumero(): string {
  const annee = new Date().getFullYear()
  const counters = parse<Record<string, number>>(KEYS.counter, {})
  const next = (counters[String(annee)] ?? 0) + 1
  counters[String(annee)] = next
  setItemIfChanged(KEYS.counter, JSON.stringify(counters))
  return `JOLY-${annee}-${String(next).padStart(3, '0')}`
}

// Carnet clients

export function getClients(): ClientCatalogue[] {
  return parse<ClientCatalogue[]>(KEYS.clients, [])
}

export function saveClient(c: ClientCatalogue): void {
  const list = getClients()
  const idx = list.findIndex(x => x.id === c.id)
  if (idx >= 0) { list[idx] = c } else { list.unshift(c) }
  setItemIfChanged(KEYS.clients, JSON.stringify(list))
}

// Catalogue produits

export function getProduits(): ProduitCatalogue[] {
  return parse<ProduitCatalogue[]>(KEYS.produits, [])
}

export function saveProduit(p: ProduitCatalogue): void {
  const list = getProduits()
  const idx = list.findIndex(x => x.id === p.id)
  if (idx >= 0) { list[idx] = p } else { list.unshift(p) }
  setItemIfChanged(KEYS.produits, JSON.stringify(list))
}

// Factories

export function creerNouveauDevis(): Devis {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    numero: getNextNumero(),
    date: dateAujourdhui(),
    validite: '30 jours',
    statut: 'brouillon',
    tauxTVA: '20',
    remiseGlobale: 0,
    client: { nom: '', contact: '', email: '', adresse: '' },
    lignes: [{ id: crypto.randomUUID(), type: 'article', description: '', reference: '', unite: 'pièce', quantite: 1, prixUnitaire: 0, remise: 0 }],
    delaiLivraison: '',
    conditionsPaiement: '30 jours fin de mois',
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

export function dupliquerDevis(source: Devis): Devis {
  const now = new Date().toISOString()
  return {
    ...source,
    id: crypto.randomUUID(),
    numero: getNextNumero(),
    statut: 'brouillon',
    date: dateAujourdhui(),
    createdAt: now,
    updatedAt: now,
  }
}

// Export / Import JSON

export function exportDevisJSON(): void {
  const list = parse<unknown[]>(KEYS.devis, [])
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sajoly-devis-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importDevisJSON(raw: unknown[]): number {
  const existing = parse<unknown[]>(KEYS.devis, [])
  const existingIds = new Set(
    existing
      .filter(isRecord)
      .map(d => (typeof d.id === 'string' ? d.id : null))
      .filter((id): id is string => Boolean(id))
  )

  const toAdd = raw.filter((d): d is UnknownRecord => {
    if (!isRecord(d)) return false
    if (typeof d.id !== 'string') return false
    return !existingIds.has(d.id)
  })

  const merged: unknown[] = [...toAdd.map(migrateDevis), ...existing]
  setItemIfChanged(KEYS.devis, JSON.stringify(merged))
  return toAdd.length
}
