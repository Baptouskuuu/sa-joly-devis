import { useState } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import type { ProduitCatalogue } from '../types/catalogue'
import type { FormData } from '../types/formSchema'
import { getProduits, saveProduit } from '../utils/storage'

export function useProduitCatalogue(
  setValue: UseFormSetValue<FormData>,
  lignesValues: FormData['lignes'] | undefined,
) {
  const [savedProduits, setSavedProduits] = useState<ProduitCatalogue[]>(getProduits)
  const [openIdx, setOpenIdx]             = useState<number | null>(null)

  const getMatches = (i: number): ProduitCatalogue[] => {
    if (openIdx !== i) return []
    const desc = lignesValues?.[i]?.description ?? ''
    if (desc.length < 1) return []
    return savedProduits
      .filter(p => p.description.toLowerCase().includes(desc.toLowerCase()))
      .slice(0, 5)
  }

  const handleSelectProduit = (i: number, p: ProduitCatalogue) => {
    setValue(`lignes.${i}.description`,  p.description)
    setValue(`lignes.${i}.reference`,    p.reference)
    setValue(`lignes.${i}.unite`,        p.unite)
    setValue(`lignes.${i}.prixUnitaire`, p.prixUnitaire)
    setOpenIdx(null)
  }

  const handleSaveProduit = (i: number) => {
    const l = lignesValues?.[i]
    if (!l?.description) return
    const existing = savedProduits.find(p => p.description === l.description)
    saveProduit({
      id:           existing?.id ?? crypto.randomUUID(),
      description:  l.description,
      reference:    l.reference ?? '',
      unite:        l.unite ?? 'pièce',
      prixUnitaire: Number(l.prixUnitaire) || 0,
    })
    setSavedProduits(getProduits())
  }

  return { openIdx, setOpenIdx, getMatches, handleSelectProduit, handleSaveProduit }
}
