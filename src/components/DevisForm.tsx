import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Devis } from '../types/devis'
import { devisSchema, type FormData } from '../types/formSchema'
import { useDevisAutosave } from '../hooks/useDevisAutosave'
import { useClientCatalogue } from '../hooks/useClientCatalogue'
import { useProduitCatalogue } from '../hooks/useProduitCatalogue'
import DevisInfoSection from './form/DevisInfoSection'
import ClientSection from './form/ClientSection'
import LignesSection from './form/LignesSection'
import ConditionsSection from './form/ConditionsSection'
import NotesSection from './form/NotesSection'

interface Props {
  initialDevis: Devis
  onUpdate: (data: Devis) => void
}

export default function DevisForm({ initialDevis, onUpdate }: Props) {
  const { register, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(devisSchema),
    defaultValues: {
      numero:             initialDevis.numero,
      date:               initialDevis.date,
      validite:           initialDevis.validite,
      statut:             initialDevis.statut,
      tauxTVA:            initialDevis.tauxTVA ?? '20',
      remiseGlobale:      initialDevis.remiseGlobale ?? 0,
      client:             initialDevis.client,
      lignes:             initialDevis.lignes.map(l => ({
        id:           l.id,
        type:         l.type ?? 'article',
        description:  l.description,
        reference:    l.reference,
        unite:        l.unite,
        quantite:     l.quantite,
        prixUnitaire: l.prixUnitaire,
        remise:       l.remise ?? 0,
      })),
      delaiLivraison:     initialDevis.delaiLivraison,
      conditionsPaiement: initialDevis.conditionsPaiement,
      notes:              initialDevis.notes,
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const values = useWatch({ control })

  useDevisAutosave({
    baseDevis: initialDevis,
    values: values as unknown as Record<string, unknown> | undefined,
    onUpdate,
    delayMs: 200,
  })

  const client = useClientCatalogue(setValue, values.client as FormData['client'] | undefined)
  const produit = useProduitCatalogue(setValue, values.lignes as FormData['lignes'])

  const addArticle = () => append({
    id: crypto.randomUUID(), type: 'article', description: '',
    reference: '', unite: 'pièce', quantite: 1, prixUnitaire: 0, remise: 0,
  })
  const addTitre = () => append({
    id: crypto.randomUUID(), type: 'titre', description: '',
    reference: '', unite: '', quantite: 0, prixUnitaire: 0, remise: 0,
  })

  return (
    <form className="space-y-6">
      <DevisInfoSection register={register} errors={errors} />

      <ClientSection
        register={register}
        errors={errors}
        clientMatches={client.clientMatches}
        onFocus={() => client.setShowDrop(true)}
        onBlur={() => setTimeout(() => client.setShowDrop(false), 150)}
        onSelectClient={client.handleSelectClient}
        onSaveClient={client.handleSaveClient}
      />

      <LignesSection
        fields={fields}
        register={register}
        lignesValues={values.lignes as FormData['lignes']}
        getMatches={produit.getMatches}
        onFocusDesc={i => produit.setOpenIdx(i)}
        onBlurDesc={() => setTimeout(() => produit.setOpenIdx(null), 150)}
        onSelectProduit={produit.handleSelectProduit}
        onSaveProduit={produit.handleSaveProduit}
        onRemove={remove}
        onAddArticle={addArticle}
        onAddTitre={addTitre}
      />

      <ConditionsSection register={register} />

      <NotesSection register={register} />
    </form>
  )
}
