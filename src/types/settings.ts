export interface SettingsSociete {
  nom: string
  adresse: string
  tel: string
  email: string
  siret: string
  tva: string
  mentionsLegales: string
}

export const defaultSettings: SettingsSociete = {
  nom: 'SAS JOLY',
  adresse: 'Zone Industrielle\n59410 Aniche',
  tel: '',
  email: 'contact@sa-joly.com',
  siret: '',
  tva: '',
  mentionsLegales: '',
}
