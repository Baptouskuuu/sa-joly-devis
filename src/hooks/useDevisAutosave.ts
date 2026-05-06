import { useEffect, useRef } from 'react'
import type { Devis } from '../types/devis'

type Params = {
  baseDevis: Devis
  values: Record<string, unknown> | undefined
  onUpdate: (devis: Devis) => void
  delayMs?: number
}

export function useDevisAutosave({
  baseDevis,
  values,
  onUpdate,
  delayMs = 200,
}: Params) {
  const baseRef = useRef(baseDevis)

  useEffect(() => {
    baseRef.current = baseDevis
  }, [baseDevis])

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!values) return
      onUpdate({
        ...baseRef.current,
        ...values,
        updatedAt: new Date().toISOString(),
      } as Devis)
    }, delayMs)

    return () => window.clearTimeout(t)
  }, [delayMs, onUpdate, values])
}

