import type { Devis, LigneDevis, StatutDevis } from '../types/devis'

export function ligneTotalHT(l: LigneDevis): number {
  if ((l.type ?? 'article') === 'titre') return 0
  const brut = (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0)
  return brut * (1 - (Number(l.remise) || 0) / 100)
}

// Sous-total HT avant remise globale
export function devisSubtotalHT(d: Devis): number {
  return (d.lignes ?? []).reduce((sum, l) => sum + ligneTotalHT(l), 0)
}

// Total HT final (après remise globale)
export function devisTotalHT(d: Devis): number {
  const sub = devisSubtotalHT(d)
  return sub * (1 - (Number(d.remiseGlobale) || 0) / 100)
}

export type DevisTotals = {
  totalBrutHT: number
  remiseLignes: number
  subtotalHT: number
  remiseGlobalePct: number
  remiseGlobaleAmt: number
  totalHT: number
  tauxTVAStr: string
  tauxTVANum: number | null
  tva: number
  totalTTC: number
  hasRemiseLigne: boolean
}

export function computeDevisTotals(d: Devis): DevisTotals {
  const lignes = d.lignes ?? []
  const articles = lignes.filter(l => (l.type ?? 'article') === 'article')

  const totalBrutHT = articles.reduce((s, l) => {
    return s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0)
  }, 0)

  const remiseLignes = articles.reduce((s, l) => {
    const brut = (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0)
    return s + brut * ((Number(l.remise) || 0) / 100)
  }, 0)

  const subtotalHT = totalBrutHT - remiseLignes
  const remiseGlobalePct = Number(d.remiseGlobale) || 0
  const remiseGlobaleAmt = subtotalHT * (remiseGlobalePct / 100)
  const totalHT = subtotalHT - remiseGlobaleAmt

  const tauxTVAStr = d.tauxTVA ?? '20'
  const tauxTVANum = tauxTVAStr === 'na' ? null : Number.parseFloat(tauxTVAStr)
  const tva = tauxTVANum !== null ? (totalHT * tauxTVANum) / 100 : 0
  const totalTTC = totalHT + tva

  return {
    totalBrutHT,
    remiseLignes,
    subtotalHT,
    remiseGlobalePct,
    remiseGlobaleAmt,
    totalHT,
    tauxTVAStr,
    tauxTVANum,
    tva,
    totalTTC,
    hasRemiseLigne: articles.some(l => (Number(l.remise) || 0) > 0),
  }
}

export function devisStatusCounts(list: Devis[]): Record<StatutDevis, number> {
  return list.reduce<Record<StatutDevis, number>>(
    (acc, d) => { acc[d.statut] += 1; return acc },
    { brouillon: 0, envoye: 0, accepte: 0, refuse: 0 }
  )
}

export interface DevisKPIs {
  caAccepte: number
  caEnAttente: number
  tauxConversion: number | null
  totalDevis: number
}

export function devisKPIs(list: Devis[]): DevisKPIs {
  const acceptes = list.filter(d => d.statut === 'accepte')
  const envoyes  = list.filter(d => d.statut === 'envoye')
  const refuses  = list.filter(d => d.statut === 'refuse')
  const decided  = acceptes.length + refuses.length
  return {
    caAccepte:     acceptes.reduce((s, d) => s + devisTotalHT(d), 0),
    caEnAttente:   envoyes.reduce((s, d) => s + devisTotalHT(d), 0),
    tauxConversion: decided > 0 ? (acceptes.length / decided) * 100 : null,
    totalDevis:    list.length,
  }
}
