import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { FormData } from '../../types/formSchema'
import { STATUT_OPTIONS } from '../../types/formSchema'
import { SectionTitle, inputCls, labelCls, errCls } from './formUtils'

interface Props {
  register: UseFormRegister<FormData>
  errors:   FieldErrors<FormData>
}

export default function DevisInfoSection({ register, errors }: Props) {
  return (
    <section>
      <SectionTitle>Informations devis</SectionTitle>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Numéro</label>
          <input {...register('numero')} readOnly className={`${inputCls} bg-gray-50 text-gray-500`} />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input type="date" {...register('date')} className={inputCls} />
          {errors.date && <p className={errCls}>{errors.date.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Validité</label>
          <input {...register('validite')} placeholder="30 jours" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <select {...register('statut')} className={inputCls}>
            {STATUT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
