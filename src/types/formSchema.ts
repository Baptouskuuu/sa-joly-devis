import { z } from 'zod'

export const ligneSchema = z.object({
  id:           z.string(),
  type:         z.enum(['article', 'titre']),
  description:  z.string(),
  reference:    z.string(),
  unite:        z.string(),
  quantite:     z.number().min(0),
  prixUnitaire: z.number().min(0),
  remise:       z.number().min(0).max(100),
})

export const devisSchema = z.object({
  numero:             z.string(),
  date:               z.string().min(1, 'Date requise'),
  validite:           z.string().min(1, 'Validité requise'),
  statut:             z.enum(['brouillon', 'envoye', 'accepte', 'refuse']),
  tauxTVA:            z.string(),
  remiseGlobale:      z.number().min(0).max(100),
  client: z.object({
    nom:     z.string(),
    contact: z.string(),
    email:   z.string().email('Email invalide').or(z.literal('')),
    adresse: z.string(),
  }),
  lignes:             z.array(ligneSchema).min(1),
  delaiLivraison:     z.string(),
  conditionsPaiement: z.string(),
  notes:              z.string(),
})

export type FormData = z.infer<typeof devisSchema>

export const UNITES = ['pièce', 'lot', 'kg', 'm', 'm²', 'forfait', 'heure'] as const

export const CONDITIONS_PAIEMENT = [
  '30 jours fin de mois',
  '30 jours date facture',
  '45 jours fin de mois',
  '60 jours fin de mois',
  'Comptant à réception',
  '50% acompte, solde à livraison',
] as const

export const STATUT_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye',    label: 'Envoyé' },
  { value: 'accepte',   label: 'Accepté' },
  { value: 'refuse',    label: 'Refusé' },
] as const

export const TVA_OPTIONS = [
  { value: '20',  label: 'TVA 20 %' },
  { value: '10',  label: 'TVA 10 %' },
  { value: '5.5', label: 'TVA 5,5 %' },
  { value: '2.1', label: 'TVA 2,1 %' },
  { value: '0',   label: 'TVA 0 %' },
  { value: 'na',  label: 'Non applicable (art. 293B)' },
] as const
