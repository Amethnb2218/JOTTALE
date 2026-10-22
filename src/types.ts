export type OperationType = 'transfert' | 'credit_pass' | 'autre'
export type ResultatVisible = 'incertain' | 'confirme' | 'echec'
export type StatutDossier = 'a_verifier' | 'prepare' | 'assistance' | 'simule_resolu'

export interface DiagnosticData {
  type: OperationType
  dateApprox: string
  montant: string
  reference: string
  resultat: ResultatVisible
  description: string
}

export interface TimelineEvent {
  date: string
  label: string
  done: boolean
}

export interface Dossier {
  id: string
  ref: string
  createdAt: string
  type: OperationType
  montant: string
  dateOp: string
  referenceSaisie: string
  resultat: ResultatVisible
  description: string
  statut: StatutDossier
  timeline: TimelineEvent[]
}

export type View = 'home' | 'diagnostic' | 'analyse' | 'dossier' | 'dossiers' | 'detail'
