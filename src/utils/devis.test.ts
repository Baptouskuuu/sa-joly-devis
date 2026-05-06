import { describe, expect, it } from 'vitest'
import type { Devis } from '../types/devis'
import { computeDevisTotals } from './devis'

function mkDevis(partial: Partial<Devis>): Devis {
  const now = new Date('2026-01-01T00:00:00.000Z').toISOString()
  return {
    id: 'd1',
    numero: 'JOLY-2026-001',
    date: '2026-01-01',
    validite: '30 jours',
    statut: 'brouillon',
    tauxTVA: '20',
    remiseGlobale: 0,
    client: { nom: 'Client', contact: '', email: '', adresse: '' },
    lignes: [],
    delaiLivraison: '',
    conditionsPaiement: '',
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

describe('computeDevisTotals', () => {
  it('ignores titre lines and applies line + global discount + VAT', () => {
    const devis = mkDevis({
      tauxTVA: '20',
      remiseGlobale: 10,
      lignes: [
        { id: 't1', type: 'titre', description: 'Section', reference: '', unite: '', quantite: 0, prixUnitaire: 0, remise: 0 },
        { id: 'l1', type: 'article', description: 'A', reference: '', unite: 'pièce', quantite: 2, prixUnitaire: 100, remise: 10 }, // 200 - 10% = 180
        { id: 'l2', type: 'article', description: 'B', reference: '', unite: 'pièce', quantite: 1, prixUnitaire: 50, remise: 0 },   // 50
      ],
    })

    const t = computeDevisTotals(devis)

    expect(t.totalBrutHT).toBe(250)
    expect(t.remiseLignes).toBe(20)
    expect(t.subtotalHT).toBe(230)
    expect(t.remiseGlobalePct).toBe(10)
    expect(t.remiseGlobaleAmt).toBeCloseTo(23)
    expect(t.totalHT).toBeCloseTo(207)
    expect(t.tva).toBeCloseTo(41.4)
    expect(t.totalTTC).toBeCloseTo(248.4)
    expect(t.hasRemiseLigne).toBe(true)
  })

  it('handles TVA "na" (no VAT)', () => {
    const devis = mkDevis({
      tauxTVA: 'na',
      lignes: [
        { id: 'l1', type: 'article', description: 'A', reference: '', unite: 'pièce', quantite: 1, prixUnitaire: 100, remise: 0 },
      ],
    })

    const t = computeDevisTotals(devis)
    expect(t.tauxTVANum).toBeNull()
    expect(t.tva).toBe(0)
    expect(t.totalTTC).toBe(100)
  })
})

