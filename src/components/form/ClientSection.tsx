import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { ClientCatalogue } from '../../types/catalogue'
import type { FormData } from '../../types/formSchema'
import { SectionTitle, inputCls, labelCls, errCls } from './formUtils'

interface Props {
  register:       UseFormRegister<FormData>
  errors:         FieldErrors<FormData>
  clientMatches:  ClientCatalogue[]
  onFocus:        () => void
  onBlur:         () => void
  onSelectClient: (c: ClientCatalogue) => void
  onSaveClient:   () => void
}

export default function ClientSection({
  register, errors, clientMatches, onFocus, onBlur, onSelectClient, onSaveClient,
}: Props) {
  return (
    <section>
      <SectionTitle>Client</SectionTitle>
      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className={labelCls}>Nom de l'entreprise</label>
          <div className="relative">
            <input
              {...register('client.nom')}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="ex : Prysmian France SAS"
              className={inputCls}
            />
            {clientMatches.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {clientMatches.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={() => onSelectClient(c)}
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
          <label className={labelCls}>Interlocuteur</label>
          <input {...register('client.contact')} placeholder="Prénom Nom" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Email</label>
          <input type="email" {...register('client.email')} placeholder="contact@client.fr" className={inputCls} />
          {errors.client?.email && <p className={errCls}>{errors.client.email.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Adresse</label>
          <input {...register('client.adresse')} placeholder="Rue, ville, code postal" className={inputCls} />
        </div>
      </div>

      <button
        type="button"
        onClick={onSaveClient}
        className="mt-2 text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Sauvegarder dans le carnet clients
      </button>
    </section>
  )
}
