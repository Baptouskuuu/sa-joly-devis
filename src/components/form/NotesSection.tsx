import type { UseFormRegister } from 'react-hook-form'
import type { FormData } from '../../types/formSchema'
import { SectionTitle, inputCls } from './formUtils'

interface Props {
  register: UseFormRegister<FormData>
}

export default function NotesSection({ register }: Props) {
  return (
    <section>
      <SectionTitle>Notes / Remarques</SectionTitle>
      <textarea
        {...register('notes')}
        rows={3}
        placeholder="Informations complémentaires, conditions particulières…"
        className={`${inputCls} resize-none`}
      />
    </section>
  )
}
