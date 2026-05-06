import type { UseFormRegister } from 'react-hook-form'
import type { FormData } from '../../types/formSchema'
import { CONDITIONS_PAIEMENT, TVA_OPTIONS } from '../../types/formSchema'
import { SectionTitle, inputCls, labelCls } from './formUtils'

interface Props {
  register: UseFormRegister<FormData>
}

export default function ConditionsSection({ register }: Props) {
  return (
    <section>
      <SectionTitle>Conditions</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Délai de livraison</label>
          <input
            {...register('delaiLivraison')}
            placeholder="ex : 3 semaines après commande"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Conditions de paiement</label>
          <select {...register('conditionsPaiement')} className={inputCls}>
            {CONDITIONS_PAIEMENT.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>TVA</label>
          <select {...register('tauxTVA')} className={inputCls}>
            {TVA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Remise globale (%)</label>
          <input
            type="number" step="0.5" min="0" max="100"
            {...register('remiseGlobale', { valueAsNumber: true })}
            placeholder="0"
            className={inputCls}
          />
        </div>
      </div>
    </section>
  )
}
