import type { UseFormRegister } from 'react-hook-form'
import type { FormData } from '../../types/formSchema'

interface Props {
  index:    number
  register: UseFormRegister<FormData>
  onRemove: () => void
}

export default function LigneTitre({ index, register, onRemove }: Props) {
  return (
    <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2.5">
      <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8" />
      </svg>
      <input
        {...register(`lignes.${index}.description`)}
        placeholder="Titre de section…"
        className="flex-1 bg-transparent text-white text-sm font-semibold placeholder-gray-600 focus:outline-none"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-600 hover:text-gray-300 transition-colors ml-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
