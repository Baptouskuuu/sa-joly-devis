import { useState } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Devis } from '../types/devis'
import type { ClientCatalogue, ProduitCatalogue } from '../types/catalogue'
import { getClients, saveClient, getProduits, saveProduit } from '../utils/storage'
import { useDevisAutosave } from '../hooks/useDevisAutosave'

const ligneSchema = z.object({
  id: z.string(),
  type: z.enum(['article', 'titre']),
  description: z.string(),
  reference: z.string(),
  unite: z.string(),
  quantite: z.number().min(0),
  prixUnitaire: z.number().min(0),
  remise: z.number().min(0).max(100),
})

const devisSchema = z.object({
  numero: z.string(),
  date: z.string().min(1, 'Date requise'),
  validite: z.string().min(1, 'Validité requise'),
  statut: z.enum(['brouillon', 'envoye', 'accepte', 'refuse']),
  tauxTVA: z.string(),
  remiseGlobale: z.number().min(0).max(100),
  client: z.object({
    nom: z.string(),
    contact: z.string(),
    email: z.string().email('Email invalide').or(z.literal('')),
    adresse: z.string(),
  }),
  lignes: z.array(ligneSchema).min(1),
  delaiLivraison: z.string(),
  conditionsPaiement: z.string(),
  notes: z.string(),
})

type FormData = z.infer<typeof devisSchema>

interface Props {
  initialDevis: Devis
  onUpdate: (data: Devis) => void
}

const UNITES = ['pièce', 'lot', 'kg', 'm', 'm²', 'forfait', 'heure']

const CONDITIONS_PAIEMENT = [
  '30 jours fin de mois',
  '30 jours date facture',
  '45 jours fin de mois',
  '60 jours fin de mois',
  'Comptant à réception',
  '50% acompte, solde à livraison',
]

const STATUT_OPTIONS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye',   label: 'Envoyé' },
  { value: 'accepte',  label: 'Accepté' },
  { value: 'refuse',   label: 'Refusé' },
]

const TVA_OPTIONS = [
  { value: '20',  label: 'TVA 20 %' },
  { value: '10',  label: 'TVA 10 %' },
  { value: '5.5', label: 'TVA 5,5 %' },
  { value: '2.1', label: 'TVA 2,1 %' },
  { value: '0',   label: 'TVA 0 %' },
  { value: 'na',  label: 'Non applicable (art. 293B)' },
]

export default function DevisForm({ initialDevis, onUpdate }: Props) {
  const [savedClients, setSavedClients]   = useState<ClientCatalogue[]>(() => getClients())
  const [savedProduits, setSavedProduits] = useState<ProduitCatalogue[]>(() => getProduits())
  const [showClientDrop, setShowClientDrop]   = useState(false)
  const [openProduitIdx, setOpenProduitIdx]   = useState<number | null>(null)

  const { register, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(devisSchema),
    defaultValues: {
      numero:          initialDevis.numero,
      date:            initialDevis.date,
      validite:        initialDevis.validite,
      statut:          initialDevis.statut,
      tauxTVA:         initialDevis.tauxTVA ?? '20',
      remiseGlobale:   initialDevis.remiseGlobale ?? 0,
      client:          initialDevis.client,
      lignes:          initialDevis.lignes.map(l => ({
        id:            l.id,
        type:          l.type ?? 'article',
        description:   l.description,
        reference:     l.reference,
        unite:         l.unite,
        quantite:      l.quantite,
        prixUnitaire:  l.prixUnitaire,
        remise:        l.remise ?? 0,
      })),
      delaiLivraison:    initialDevis.delaiLivraison,
      conditionsPaiement: initialDevis.conditionsPaiement,
      notes:             initialDevis.notes,
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const values     = useWatch({ control })

  useDevisAutosave({
    baseDevis: initialDevis,
    values: values as unknown as Record<string, unknown> | undefined,
    onUpdate,
    delayMs: 200,
  })

  // Autocomplete — client
  const clientNom = values?.client?.nom ?? ''
  const clientMatches: ClientCatalogue[] = showClientDrop && clientNom.length >= 1
    ? savedClients.filter(c => c.nom.toLowerCase().includes(clientNom.toLowerCase())).slice(0, 6)
    : []

  const handleSelectClient = (c: ClientCatalogue) => {
    setValue('client.nom',     c.nom)
    setValue('client.contact', c.contact)
    setValue('client.email',   c.email)
    setValue('client.adresse', c.adresse)
    setShowClientDrop(false)
  }

  const handleSaveClient = () => {
    const nom = values?.client?.nom ?? ''
    if (!nom) return
    const existing = savedClients.find(c => c.nom === nom)
    saveClient({
      id:      existing?.id ?? crypto.randomUUID(),
      nom,
      contact: values?.client?.contact ?? '',
      email:   values?.client?.email ?? '',
      adresse: values?.client?.adresse ?? '',
    })
    setSavedClients(getClients())
  }

  // Autocomplete — produits
  const getProduitMatches = (i: number): ProduitCatalogue[] => {
    if (openProduitIdx !== i) return []
    const desc = values?.lignes?.[i]?.description ?? ''
    if (desc.length < 1) return []
    return savedProduits.filter(p => p.description.toLowerCase().includes(desc.toLowerCase())).slice(0, 5)
  }

  const handleSelectProduit = (i: number, p: ProduitCatalogue) => {
    setValue(`lignes.${i}.description`,  p.description)
    setValue(`lignes.${i}.reference`,    p.reference)
    setValue(`lignes.${i}.unite`,        p.unite)
    setValue(`lignes.${i}.prixUnitaire`, p.prixUnitaire)
    setOpenProduitIdx(null)
  }

  const handleSaveProduit = (i: number) => {
    const l = values?.lignes?.[i]
    if (!l?.description) return
    const existing = savedProduits.find(p => p.description === l.description)
    saveProduit({
      id:          existing?.id ?? crypto.randomUUID(),
      description: l.description,
      reference:   l.reference ?? '',
      unite:       l.unite ?? 'pièce',
      prixUnitaire: Number(l.prixUnitaire) || 0,
    })
    setSavedProduits(getProduits())
  }

  const addArticle = () => append({
    id: crypto.randomUUID(), type: 'article', description: '',
    reference: '', unite: 'pièce', quantite: 1, prixUnitaire: 0, remise: 0,
  })

  const addTitre = () => append({
    id: crypto.randomUUID(), type: 'titre', description: '',
    reference: '', unite: '', quantite: 0, prixUnitaire: 0, remise: 0,
  })

  const css = {
    input: 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent',
    label: 'block text-xs font-medium text-gray-500 mb-1',
    err:   'text-xs text-red-500 mt-1',
  }

  return (
    <form className="space-y-6">

      {/* ── Informations devis ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
          Informations devis
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className={css.label}>Numéro</label>
            <input {...register('numero')} readOnly className={`${css.input} bg-gray-50 text-gray-500`} />
          </div>
          <div>
            <label className={css.label}>Date</label>
            <input type="date" {...register('date')} className={css.input} />
            {errors.date && <p className={css.err}>{errors.date.message}</p>}
          </div>
          <div>
            <label className={css.label}>Validité</label>
            <input {...register('validite')} placeholder="30 jours" className={css.input} />
          </div>
          <div>
            <label className={css.label}>Statut</label>
            <select {...register('statut')} className={css.input}>
              {STATUT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── Client ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
          Client
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Nom avec autocomplete */}
          <div>
            <label className={css.label}>Nom de l'entreprise</label>
            <div className="relative">
              <input
                {...register('client.nom')}
                onFocus={() => setShowClientDrop(true)}
                onBlur={() => setTimeout(() => setShowClientDrop(false), 150)}
                placeholder="ex : Prysmian France SAS"
                className={css.input}
              />
              {clientMatches.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {clientMatches.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => handleSelectClient(c)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex flex-col"
                    >
                      <span className="font-medium text-gray-900">{c.nom}</span>
                      {c.contact && <span className="text-xs text-gray-400">{c.contact}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className={css.label}>Interlocuteur</label>
            <input {...register('client.contact')} placeholder="Prénom Nom" className={css.input} />
          </div>
          <div>
            <label className={css.label}>Email</label>
            <input type="email" {...register('client.email')} placeholder="contact@client.fr" className={css.input} />
            {errors.client?.email && <p className={css.err}>{errors.client.email.message}</p>}
          </div>
          <div>
            <label className={css.label}>Adresse</label>
            <input {...register('client.adresse')} placeholder="Rue, ville, code postal" className={css.input} />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveClient}
          className="mt-2 text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Sauvegarder dans le carnet clients
        </button>
      </section>

      {/* ── Lignes ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
          Lignes du devis
        </h2>
        <div className="space-y-2">
          {fields.map((field, i) => {
            const ligneVals = values?.lignes?.[i]
            const ligneType = ligneVals?.type ?? 'article'
            const qte   = Number(ligneVals?.quantite) || 0
            const pu    = Number(ligneVals?.prixUnitaire) || 0
            const rem   = Number(ligneVals?.remise) || 0
            const total = qte * pu * (1 - rem / 100)
            const produitMatches = getProduitMatches(i)

            if (ligneType === 'titre') {
              return (
                <div key={field.id} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2.5">
                  <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8" />
                  </svg>
                  <input
                    {...register(`lignes.${i}.description`)}
                    placeholder="Titre de section…"
                    className="flex-1 bg-transparent text-white text-sm font-semibold placeholder-gray-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-gray-600 hover:text-gray-300 transition-colors ml-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            }

            return (
              <div key={field.id} className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-12 gap-2 items-start">
                  {/* Description */}
                  <div className="col-span-3 relative">
                    <label className={css.label}>Description</label>
                    <input
                      {...register(`lignes.${i}.description`)}
                      onFocus={() => setOpenProduitIdx(i)}
                      onBlur={() => setTimeout(() => setOpenProduitIdx(null), 150)}
                      placeholder="ex : Bobine acier Ø800"
                      className={css.input}
                    />
                    {produitMatches.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        {produitMatches.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => handleSelectProduit(i, p)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between gap-2"
                          >
                            <span className="font-medium text-gray-900 truncate">{p.description}</span>
                            <span className="text-gray-400 font-mono shrink-0">{p.reference}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Référence */}
                  <div className="col-span-2">
                    <label className={css.label}>Référence</label>
                    <input {...register(`lignes.${i}.reference`)} placeholder="REF-001" className={css.input} />
                  </div>
                  {/* Unité */}
                  <div className="col-span-1">
                    <label className={css.label}>Unité</label>
                    <select {...register(`lignes.${i}.unite`)} className={css.input}>
                      {UNITES.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  {/* Quantité */}
                  <div className="col-span-1">
                    <label className={css.label}>Qté</label>
                    <input
                      type="number" step="0.01" min="0"
                      {...register(`lignes.${i}.quantite`, { valueAsNumber: true })}
                      className={css.input}
                    />
                  </div>
                  {/* Prix unitaire */}
                  <div className="col-span-2">
                    <label className={css.label}>P.U. HT</label>
                    <input
                      type="number" step="0.01" min="0"
                      {...register(`lignes.${i}.prixUnitaire`, { valueAsNumber: true })}
                      className={css.input}
                    />
                  </div>
                  {/* Remise */}
                  <div className="col-span-1">
                    <label className={css.label}>Remise %</label>
                    <input
                      type="number" step="0.5" min="0" max="100"
                      {...register(`lignes.${i}.remise`, { valueAsNumber: true })}
                      className={css.input}
                    />
                  </div>
                  {/* Total */}
                  <div className="col-span-1">
                    <label className={css.label}>Total HT</label>
                    <p className={`text-sm font-medium py-2 ${rem > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                  {/* Actions ligne */}
                  <div className="col-span-1 flex items-end justify-end gap-0.5 pb-1">
                    <button
                      type="button"
                      onClick={() => handleSaveProduit(i)}
                      title="Sauvegarder dans le catalogue"
                      className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </button>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors text-base leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={addArticle}
            className="flex-1 text-sm text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 hover:border-gray-400 rounded-md px-4 py-2 transition-colors"
          >
            + Ajouter une ligne
          </button>
          <button
            type="button"
            onClick={addTitre}
            className="text-sm text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 hover:border-gray-400 rounded-md px-4 py-2 transition-colors whitespace-nowrap"
          >
            + Titre de section
          </button>
        </div>
      </section>

      {/* ── Conditions ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
          Conditions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={css.label}>Délai de livraison</label>
            <input {...register('delaiLivraison')} placeholder="ex : 3 semaines après commande" className={css.input} />
          </div>
          <div>
            <label className={css.label}>Conditions de paiement</label>
            <select {...register('conditionsPaiement')} className={css.input}>
              {CONDITIONS_PAIEMENT.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={css.label}>TVA</label>
            <select {...register('tauxTVA')} className={css.input}>
              {TVA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className={css.label}>Remise globale (%)</label>
            <input
              type="number" step="0.5" min="0" max="100"
              {...register('remiseGlobale', { valueAsNumber: true })}
              placeholder="0"
              className={css.input}
            />
          </div>
        </div>
      </section>

      {/* ── Notes ── */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
          Notes / Remarques
        </h2>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Informations complémentaires, conditions particulières…"
          className={`${css.input} resize-none`}
        />
      </section>
    </form>
  )
}
