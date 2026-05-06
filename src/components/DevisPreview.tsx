import { forwardRef } from 'react'
import type { Devis } from '../types/devis'
import type { SettingsSociete } from '../types/settings'
import { formatDate, formatPrix } from '../utils/numero'
import { computeDevisTotals, ligneTotalHT } from '../utils/devis'

interface Props {
  devis: Devis
  settings: SettingsSociete
}

const DevisPreview = forwardRef<HTMLDivElement, Props>(({ devis, settings }, ref) => {
  const lignes = devis.lignes ?? []

  const totals = computeDevisTotals(devis)

  // Colonne remise : seulement si au moins une ligne a une remise > 0
  const colCount = 7 + (totals.hasRemiseLigne ? 1 : 0)

  // Numérotation des lignes article uniquement
  let artNum = 0

  return (
    <div ref={ref} className="bg-white w-full min-h-[297mm] p-12 text-gray-900 text-sm font-sans">

      {/* En-tête */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <img src="/logo.jpeg" alt={settings.nom} className="h-14 object-contain mb-2" />
          <p className="text-xs text-gray-500 whitespace-pre-line">{settings.adresse}</p>
          {settings.tel   && <p className="text-xs text-gray-500">{settings.tel}</p>}
          {settings.email && <p className="text-xs text-gray-500">{settings.email}</p>}
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">DEVIS</h1>
          <p className="text-xs text-gray-500 font-mono">{devis.numero}</p>
          <p className="text-xs text-gray-400 mt-1">
            Date : <span className="text-gray-700">{formatDate(devis.date)}</span>
          </p>
          <p className="text-xs text-gray-400">
            Validité : <span className="text-gray-700">{devis.validite}</span>
          </p>
        </div>
      </div>

      <div className="border-t-2 border-gray-900 mb-8" />

      {/* Destinataire */}
      <div className="mb-10 ml-auto w-64">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Destinataire</p>
        <p className="font-semibold text-gray-900">{devis.client?.nom || '—'}</p>
        {devis.client?.contact && <p className="text-gray-600">À l'attention de : {devis.client.contact}</p>}
        {devis.client?.email   && <p className="text-gray-500 text-xs">{devis.client.email}</p>}
        {devis.client?.adresse && (
          <p className="text-gray-500 text-xs mt-1 whitespace-pre-line">{devis.client.adresse}</p>
        )}
      </div>

      {/* Tableau */}
      <table className="w-full mb-6 text-sm">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="text-left px-3 py-2 font-medium w-8">#</th>
            <th className="text-left px-3 py-2 font-medium">Description</th>
            <th className="text-left px-3 py-2 font-medium">Réf.</th>
            <th className="text-right px-3 py-2 font-medium">Qté</th>
            <th className="text-right px-3 py-2 font-medium">Unité</th>
            <th className="text-right px-3 py-2 font-medium">P.U. HT</th>
            {totals.hasRemiseLigne && <th className="text-right px-3 py-2 font-medium">Remise</th>}
            <th className="text-right px-3 py-2 font-medium">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {lignes.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="text-center py-6 text-gray-300 italic">Aucune ligne</td>
            </tr>
          ) : lignes.map((ligne, i) => {
            const isArticle = (ligne.type ?? 'article') === 'article'

            if (!isArticle) {
              return (
                <tr key={ligne.id} className="print-titre">
                  <td
                    colSpan={colCount}
                    className="px-3 py-2 bg-gray-100 font-semibold text-gray-700 text-xs uppercase tracking-wider"
                  >
                    {ligne.description || '—'}
                  </td>
                </tr>
              )
            }

            artNum++
            const total  = ligneTotalHT(ligne)
            const remise = Number(ligne.remise) || 0

            return (
              <tr key={ligne.id} className={`print-row ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-3 py-2 text-gray-400 text-xs">{artNum}</td>
                <td className="px-3 py-2 text-gray-900">{ligne.description || '—'}</td>
                <td className="px-3 py-2 text-gray-400 text-xs font-mono">{ligne.reference}</td>
                <td className="px-3 py-2 text-right">{ligne.quantite}</td>
                <td className="px-3 py-2 text-right text-gray-500">{ligne.unite}</td>
                <td className="px-3 py-2 text-right">{formatPrix(Number(ligne.prixUnitaire))}</td>
                {totals.hasRemiseLigne && (
                  <td className="px-3 py-2 text-right text-orange-600">
                    {remise > 0 ? `${remise} %` : '—'}
                  </td>
                )}
                <td className="px-3 py-2 text-right font-medium">{formatPrix(total)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totaux */}
      <div className="print-totaux flex justify-end mb-8">
        <div className="w-72 space-y-1 text-sm">
          {totals.remiseLignes > 0 && (
            <>
              <div className="flex justify-between text-gray-600 py-1">
                <span>Sous-total HT</span>
                <span className="text-gray-900">{formatPrix(totals.totalBrutHT)}</span>
              </div>
              <div className="flex justify-between text-orange-600 py-1">
                <span>Remise articles</span>
                <span>− {formatPrix(totals.remiseLignes)}</span>
              </div>
            </>
          )}
          {totals.remiseGlobalePct > 0 && (
            <div className="flex justify-between text-orange-600 py-1">
              <span>Remise globale ({totals.remiseGlobalePct} %)</span>
              <span>− {formatPrix(totals.remiseGlobaleAmt)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600 py-1">
            <span>Total HT</span>
            <span className="font-medium text-gray-900">{formatPrix(totals.totalHT)}</span>
          </div>
          {totals.tauxTVANum !== null ? (
            <>
              <div className="flex justify-between text-gray-600 py-1">
                <span>TVA {totals.tauxTVANum === 0 ? '0' : totals.tauxTVANum} %</span>
                <span>{formatPrix(totals.tva)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t-2 border-gray-900 pt-2 mt-1">
                <span>Total TTC</span>
                <span>{formatPrix(totals.totalTTC)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-base font-bold border-t-2 border-gray-900 pt-2 mt-1">
                <span>Total</span>
                <span>{formatPrix(totals.totalHT)}</span>
              </div>
              <p className="text-xs text-gray-400 italic mt-1">TVA non applicable – art. 293B du CGI</p>
            </>
          )}
        </div>
      </div>

      {/* Conditions */}
      {(devis.delaiLivraison || devis.conditionsPaiement) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4 text-xs">
          {devis.delaiLivraison && (
            <div>
              <p className="text-gray-400 uppercase tracking-wider mb-1">Délai de livraison</p>
              <p className="text-gray-900">{devis.delaiLivraison}</p>
            </div>
          )}
          {devis.conditionsPaiement && (
            <div>
              <p className="text-gray-400 uppercase tracking-wider mb-1">Conditions de paiement</p>
              <p className="text-gray-900">{devis.conditionsPaiement}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {devis.notes && (
        <div className="mb-8 text-xs text-gray-600 border-l-2 border-gray-200 pl-4">
          <p className="text-gray-400 uppercase tracking-wider mb-1">Remarques</p>
          <p className="whitespace-pre-line">{devis.notes}</p>
        </div>
      )}

      {/* Signature */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bon pour accord</p>
          <p className="text-xs text-gray-500 mb-6">Date et signature du client :</p>
          <div className="border-b border-gray-200 w-48" />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{settings.nom}</p>
          <p className="text-xs text-gray-500">Responsable commercial</p>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-12 pt-4 border-t border-gray-100 text-center text-xs text-gray-300 space-y-0.5">
        <p>{settings.nom} — {settings.adresse.replace('\n', ', ')} — {settings.email}</p>
        {(settings.siret || settings.tva) && (
          <p>
            {settings.siret && `SIRET : ${settings.siret}`}
            {settings.siret && settings.tva && ' — '}
            {settings.tva && `TVA : ${settings.tva}`}
          </p>
        )}
        {settings.mentionsLegales && <p className="mt-1">{settings.mentionsLegales}</p>}
      </div>
    </div>
  )
})

DevisPreview.displayName = 'DevisPreview'
export default DevisPreview
