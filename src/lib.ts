import type { DiagnosticData, Dossier, StatutDossier, ResultatVisible, OperationType } from './types'

const STORAGE_KEY = 'jottale_dossiers_v1'

export function loadDossiers(): Dossier[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
export function saveDossiers(d: Dossier[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

export function genRef(): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const c = letters[Math.floor(Math.random()*letters.length)] + letters[Math.floor(Math.random()*letters.length)]
  return `JOT-${c}${n}`
}
export function todayISO(): string { return new Date().toISOString().slice(0,10) }
export function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('fr-SN',{day:'2-digit',month:'long',year:'numeric'}) } catch{ return iso }
}
export function formatMontant(v:string): string {
  if(!v) return '—'
  const n = parseInt(v.replace(/\s/g,''),10)
  if(isNaN(n)) return v
  return n.toLocaleString('fr-FR') + ' FCFA'
}

export function labelType(t:OperationType): string {
  if(t==='transfert') return 'Transfert Orange Money'
  if(t==='credit_pass') return 'Achat crédit / Pass'
  return 'Autre opération'
}
export function labelResultat(r:ResultatVisible): string {
  if(r==='incertain') return 'Incertain'
  if(r==='confirme') return 'Confirmé (données démo)'
  return 'Échec signalé (données démo)'
}
export function labelStatut(s:StatutDossier): {label:string,color:string,bg:string} {
  if(s==='a_verifier') return {label:'À vérifier',color:'#92400e',bg:'#fef3c7'}
  if(s==='prepare') return {label:'Dossier préparé',color:'#1e40af',bg:'#dbeafe'}
  if(s==='assistance') return {label:'Assistance à contacter',color:'#7c2d12',bg:'#ffedd5'}
  return {label:'Résolution simulée',color:'#14532d',bg:'#dcfce7'}
}

export function buildTimeline(resultat: ResultatVisible, statut: StatutDossier) {
  const base = [
    { label: 'Incident signalé', done: true },
    { label: 'Vérification historique Max it', done: statut !== 'a_verifier' || resultat !== 'incertain' ? true : false },
    { label: 'Dossier préparé', done: statut==='prepare' || statut==='assistance' || statut==='simule_resolu' },
    { label: 'Assistance contactée (simulé)', done: statut==='assistance' || statut==='simule_resolu' },
    { label: 'Résolution simulée', done: statut==='simule_resolu' },
  ]
  return base.map((e)=> ({...e, date: todayISO(), label: e.label }))
}

export function createDossier(data: DiagnosticData, statutOverride?: StatutDossier): Dossier {
  const ref = genRef()
  const now = new Date().toISOString()
  let statut: StatutDossier = statutOverride || 'a_verifier'
  if(!statutOverride){
    if(data.resultat==='incertain') statut='a_verifier'
    else if(data.resultat==='echec') statut='assistance'
    else statut='prepare'
  }
  return {
    id: Date.now().toString(36)+Math.random().toString(36).slice(2,5),
    ref, createdAt: now,
    type: data.type, montant: data.montant, dateOp: data.dateApprox,
    referenceSaisie: data.reference, resultat: data.resultat, description: data.description,
    statut,
    timeline: buildTimeline(data.resultat, statut)
  }
}

export function resumeText(d: Dossier): string {
  return [
    `JOTTALE — Résumé d'incident (prototype de démonstration)`,
    `Référence : ${d.ref}`,
    `Date de création : ${formatDate(d.createdAt.slice(0,10))}`,
    `Type : ${labelType(d.type)}`,
    d.montant ? `Montant : ${formatMontant(d.montant)}` : null,
    `Date approximative : ${d.dateOp || '—'}`,
    d.referenceSaisie ? `Référence saisie : ${d.referenceSaisie}` : null,
    `Résultat observé : ${labelResultat(d.resultat)}`,
    d.description ? `Description : ${d.description}` : null,
    `Statut : ${labelStatut(d.statut).label}`,
    ``,
    `⚠ Données de démonstration uniquement. Aucune vérification sur un compte réel n'a été effectuée.`,
    `Pour une réclamation réelle : utilisez l'assistance Max it / Orange Money (historique, vérification d'opération, service client).`,
  ].filter(Boolean).join('\n')
}

// Intégration future (interface propre, aucun endpoint inventé)
export interface OrangeIntegrationPort {
  verifyTransaction?(ref:string): Promise<{status:'confirmed'|'failed'|'pending'|'unknown'}>
  submitClaim?(dossier: Dossier): Promise<{claimId:string}>
}
