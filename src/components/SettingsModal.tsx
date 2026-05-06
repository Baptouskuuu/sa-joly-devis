import { useForm } from 'react-hook-form'
import type { SettingsSociete } from '../types/settings'

interface Props {
  initial: SettingsSociete
  onSave: (data: SettingsSociete) => void
  onClose: () => void
}

export default function SettingsModal({ initial, onSave, onClose }: Props) {
  const { register, handleSubmit } = useForm<SettingsSociete>({ defaultValues: initial })

  const input = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
  const label = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Informations SA JOLY</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Nom de la société</label>
              <input {...register('nom')} className={input} />
            </div>
            <div>
              <label className={label}>Téléphone</label>
              <input {...register('tel')} placeholder="03 27 …" className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Adresse</label>
            <textarea {...register('adresse')} rows={2} className={`${input} resize-none`} />
          </div>

          <div>
            <label className={label}>Email</label>
            <input type="email" {...register('email')} className={input} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>SIRET</label>
              <input {...register('siret')} placeholder="XXX XXX XXX XXXXX" className={input} />
            </div>
            <div>
              <label className={label}>N° TVA intracommunautaire</label>
              <input {...register('tva')} placeholder="FR XX XXXXXXXXX" className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Mentions légales (pied de page)</label>
            <textarea
              {...register('mentionsLegales')}
              rows={2}
              placeholder="Clause de réserve de propriété, conditions générales de vente…"
              className={`${input} resize-none`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
