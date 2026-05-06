import type { UseFormRegister } from 'react-hook-form'
import type { ProduitCatalogue } from '../../types/catalogue'
import type { FormData } from '../../types/formSchema'
import { UNITES } from '../../types/formSchema'
import { inputCls, labelCls } from './formUtils'

interface Props {
  index:           number
  register:        UseFormRegister<FormData>
  quantite:        number
  prixUnitaire:    number
  remise:          number
  produitMatches:  ProduitCatalogue[]
  canRemove:       boolean
  onRemove:        () => void
  onFocusDesc:     () => void
  onBlurDesc:      () => void
  onSelectProduit: (p: ProduitCatalogue) => void
  onSaveProduit:   () => void
}

export default function LigneArticle({
  index, register, quantite, prixUnitaire, remise,
  produitMatches, canRemove,
  onRemove, onFocusDesc, onBlurDesc, onSelectProduit, onSaveProduit,
}: Props) {
  const total = quantite * prixUnitaire * (1 - remise / 100)

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="grid grid-cols-12 gap-2 items-start">

        {/* Description */}
        <div className="col-span-3 relative">
          <label className={labelCls}>Description</label>
          <input
            {...register(`lignes.${index}.description`)}
            onFocus={onFocusDesc}
            onBlur={onBlurDesc}
            placeholder="ex : Bobine acier Ø800"
            className={inputCls}
          />
          {produitMatches.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {produitMatches.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => onSelectProduit(p)}
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
          <label className={labelCls}>Référence</label>
          <input {...register(`lignes.${index}.reference`)} placeholder="REF-001" className={inputCls} />
        </div>

        {/* Unité */}
        <div className="col-span-1">
          <label className={labelCls}>Unité</label>
          <select {...register(`lignes.${index}.unite`)} className={inputCls}>
            {UNITES.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>

        {/* Quantité */}
        <div className="col-span-1">
          <label className={labelCls}>Qté</label>
          <input
            type="number" step="0.01" min="0"
            {...register(`lignes.${index}.quantite`, { valueAsNumber: true })}
            className={inputCls}
          />
        </div>

        {/* Prix unitaire */}
        <div className="col-span-2">
          <label className={labelCls}>P.U. HT</label>
          <input
            type="number" step="0.01" min="0"
            {...register(`lignes.${index}.prixUnitaire`, { valueAsNumber: true })}
            className={inputCls}
          />
        </div>

        {/* Remise */}
        <div className="col-span-1">
          <label className={labelCls}>Remise %</label>
          <input
            type="number" step="0.5" min="0" max="100"
            {...register(`lignes.${index}.remise`, { valueAsNumber: true })}
            className={inputCls}
          />
        </div>

        {/* Total */}
        <div className="col-span-1">
          <label className={labelCls}>Total HT</label>
          <p className={`text-sm font-medium py-2 ${remise > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex items-end justify-end gap-0.5 pb-1">
          <button
            type="button"
            onClick={onSaveProduit}
            title="Sauvegarder dans le catalogue"
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors text-base leading-none"
            >
              ×
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
