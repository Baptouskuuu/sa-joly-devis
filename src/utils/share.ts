import type { Devis } from '../types/devis'
import type { SettingsSociete } from '../types/settings'

interface SharePayload {
  devis: Devis
  settings: SettingsSociete
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function encodeShare(devis: Devis, settings: SettingsSociete): string {
  return utf8ToBase64(JSON.stringify({ devis, settings } satisfies SharePayload))
}

export function decodeShare(encoded: string): SharePayload | null {
  try {
    return JSON.parse(base64ToUtf8(encoded)) as SharePayload
  } catch {
    return null
  }
}

export function buildShareUrl(devis: Devis, settings: SettingsSociete): string {
  return `${window.location.origin}/#/view/${encodeShare(devis, settings)}`
}

export function buildMailtoUrl(devis: Devis, settings: SettingsSociete): string {
  const shareUrl = buildShareUrl(devis, settings)
  const subject = encodeURIComponent(`Devis ${devis.numero} — ${settings.nom}`)
  const clientName = devis.client?.nom ? `\nBonjour ${devis.client.nom},\n\n` : '\nBonjour,\n\n'
  const body = encodeURIComponent(
    `${clientName}Veuillez trouver ci-dessous le lien vers votre devis ${devis.numero} :\n\n${shareUrl}\n\nN'hésitez pas à nous contacter pour toute question.\n\nCordialement,\n${settings.nom}`
  )
  const to = devis.client?.email ?? ''
  return `mailto:${to}?subject=${subject}&body=${body}`
}
