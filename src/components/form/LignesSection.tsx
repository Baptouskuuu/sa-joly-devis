import type { FieldArrayWithId, UseFormRegister } from 'react-hook-form'
import type { ProduitCatalogue } from '../../types/catalogue'
import type { FormData } from '../../types/formSchema'
import { SectionTitle } from './formUtils'
import LigneTitre from './LigneTitre'
import LigneArticle from './LigneArticle'

interface Props {
  fields:          FieldArrayWithId<FormData, 'lignes', 'id'>[]
  register:        UseFormRegister<FormData>
  lignesValues:    FormData['lignes'] | undefined
  getMatches:      (i: number) => ProduitCatalogue[]
  onFocusDesc:     (i: number) => void
  onBlurDesc:      () => void
  onSelectProduit: (i: number, p: ProduitCatalogue) => void
  onSaveProduit:   (i: number) => void
  onRemove:        (i: number) => void
  onAddArticle:    () => void
  onAddTitre:      () => void
}

export default function LignesSection({
  fields, register, lignesValues,
  getMatches, onFocusDesc, onBlurDesc, onSelectProduit, onSaveProduit,
  onRemove, onAddArticle, onAddTitre,
}: Props) {
  return (
    <section>
      <SectionTitle>Lignes du devis</SectionTitle>
      <div className="space-y-2">
        {fields.map((field, i) => {
          const vals = lignesValues?.[i]
          const type = vals?.type ?? 'article'

          if (type === 'titre') {
            return (
              <LigneTitre
                key={field.id}
                index={i}
                register={register}
                onRemove={() => onRemove(i)}
              />
            )
          }

          return (
            <LigneArticle
              key={field.id}
              index={i}
              register={register}
              quantite={Number(vals?.quantite) || 0}
              prixUnitaire={Number(vals?.prixUnitaire) || 0}
              remise={Number(vals?.remise) || 0}
              produitMatches={getMatches(i)}
              canRemove={fields.length > 1}
              onRemove={() => onRemove(i)}
              onFocusDesc={() => onFocusDesc(i)}
              onBlurDesc={onBlurDesc}
              onSelectProduit={p => onSelectProduit(i, p)}
              onSaveProduit={() => onSaveProduit(i)}
            />
          )
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onAddArticle}
          className="flex-1 text-sm text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 hover:border-gray-400 rounded-md px-4 py-2 transition-colors"
        >
          + Ajouter une ligne
        </button>
        <button
          type="button"
          onClick={onAddTitre}
          className="text-sm text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 hover:border-gray-400 rounded-md px-4 py-2 transition-colors whitespace-nowrap"
        >
          + Titre de section
        </button>
      </div>
    </section>
  )
}
