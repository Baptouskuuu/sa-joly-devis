import type { ReactNode } from 'react'

export const inputCls = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
export const labelCls = 'block text-xs font-medium text-gray-500 mb-1'
export const errCls   = 'text-xs text-red-500 mt-1'

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
      {children}
    </h2>
  )
}
