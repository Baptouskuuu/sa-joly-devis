import { useState } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import type { ClientCatalogue } from '../types/catalogue'
import type { FormData } from '../types/formSchema'
import { getClients, saveClient } from '../utils/storage'

export function useClientCatalogue(
  setValue: UseFormSetValue<FormData>,
  clientValues: FormData['client'] | undefined,
) {
  const [savedClients, setSavedClients] = useState<ClientCatalogue[]>(getClients)
  const [showDrop, setShowDrop]         = useState(false)

  const clientNom     = clientValues?.nom ?? ''
  const clientMatches = showDrop && clientNom.length >= 1
    ? savedClients.filter(c => c.nom.toLowerCase().includes(clientNom.toLowerCase())).slice(0, 6)
    : []

  const handleSelectClient = (c: ClientCatalogue) => {
    setValue('client.nom',     c.nom)
    setValue('client.contact', c.contact)
    setValue('client.email',   c.email)
    setValue('client.adresse', c.adresse)
    setShowDrop(false)
  }

  const handleSaveClient = () => {
    if (!clientValues?.nom) return
    const existing = savedClients.find(c => c.nom === clientValues.nom)
    saveClient({
      id:      existing?.id ?? crypto.randomUUID(),
      nom:     clientValues.nom,
      contact: clientValues.contact ?? '',
      email:   clientValues.email ?? '',
      adresse: clientValues.adresse ?? '',
    })
    setSavedClients(getClients())
  }

  return { showDrop, setShowDrop, clientMatches, handleSelectClient, handleSaveClient }
}
