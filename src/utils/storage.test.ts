import { describe, expect, it } from 'vitest'
import { getDevisList } from './storage'

function mockLocalStorage() {
  const store = new Map<string, string>()

  const api = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)) },
    removeItem: (k: string) => { store.delete(k) },
    clear: () => { store.clear() },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size },
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: api,
    configurable: true,
  })
}

describe('storage migration', () => {
  it('migrates legacy devis data and persists migrated shape', () => {
    mockLocalStorage()

    const legacy = [
      {
        id: 'old-1',
        numero: 'JOLY-2025-001',
        date: '2025-12-31',
        validite: '30 jours',
        statut: 'envoye',
        client: { nom: 'ACME' },
        lignes: [
          { description: 'Produit', quantite: 2, prixUnitaire: 10 }, // missing id/type/remise/etc
        ],
      },
    ]

    localStorage.setItem('sajoly_devis', JSON.stringify(legacy))

    const list = getDevisList()
    expect(list).toHaveLength(1)

    const d = list[0]
    expect(d.id).toBe('old-1')
    expect(d.tauxTVA).toBeDefined()
    expect(d.remiseGlobale).toBeDefined()
    expect(d.client.nom).toBe('ACME')

    expect(d.lignes).toHaveLength(1)
    expect(typeof d.lignes[0].id).toBe('string')
    expect(d.lignes[0].type).toBe('article')
    expect(d.lignes[0].remise).toBe(0)

    const persisted = JSON.parse(localStorage.getItem('sajoly_devis') || '[]')
    expect(persisted[0].tauxTVA).toBeDefined()
    expect(persisted[0].lignes[0].id).toBeDefined()
  })
})

