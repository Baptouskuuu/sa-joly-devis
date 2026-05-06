export interface ClientCatalogue {
  id: string
  nom: string
  contact: string
  email: string
  adresse: string
}

export interface ProduitCatalogue {
  id: string
  description: string
  reference: string
  unite: string
  prixUnitaire: number
}
