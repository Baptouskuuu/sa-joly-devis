export type StatutDevis = 'brouillon' | 'envoye' | 'accepte' | 'refuse'
export type TypeLigne = 'article' | 'titre'

export interface LigneDevis {
  id: string
  type?: TypeLigne      // défaut : 'article'
  description: string
  reference: string
  unite: string
  quantite: number
  prixUnitaire: number
  remise?: number       // pourcentage 0-100, défaut : 0
}

export interface Devis {
  id: string
  numero: string
  date: string
  validite: string
  statut: StatutDevis
  tauxTVA?: string      // '20' | '10' | '5.5' | '2.1' | '0' | 'na', défaut : '20'
  remiseGlobale?: number // pourcentage 0-100, défaut : 0

  client: {
    nom: string
    contact: string
    email: string
    adresse: string
  }

  lignes: LigneDevis[]

  delaiLivraison: string
  conditionsPaiement: string
  notes: string

  createdAt: string
  updatedAt: string
}
