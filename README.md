# devis.SA-JOLY

Générateur de devis pour SA JOLY — application React 100% frontend, sans backend.

**Live** → https://sa-joly-devis.vercel.app

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- react-hook-form v7 + zod v4
- react-to-print (export PDF)
- Three.js (splash screen shader)

## Fonctionnalités

- Création et édition de devis avec sauvegarde automatique (localStorage)
- Catalogue clients et produits avec autocomplétion
- Export PDF via impression navigateur
- Export / import JSON
- Lien client partageable (encodé en base64 dans l'URL, sans serveur)
- Dashboard avec KPIs (CA, taux de conversion, recherche)
- Splash screen animé (shader WebGL aurora)

## Développement

```bash
npm install
npm run dev
```

## Déploiement

```bash
vercel --prod --yes
```
