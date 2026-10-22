# JOTTALE — Concept, problème, proposition de valeur et limites

## 1. Problème utilisateur

Au Sénégal, un client Max it / Orange Money qui fait un transfert ou un achat de pass vit souvent ceci : chargement long, écran qui tourne, pas de SMS clair. Doit-il recommencer ? Va-t-il payer deux fois ? Où trouver la bonne info ? Le parcours actuel (historique, vérification d'opération, annulation partielle, assistance) existe mais est dispersé et peu guidé pour un utilisateur peu à l'aise.

Conséquence : doublons, stress, réclamations incomplètes (sans référence/montant/date).

## 2. Proposition de valeur

**JOTTALE ne refait pas l'historique ni le chatbot.** Il est le **parcours unifié entre l'incident et sa résolution** :

- **Comprendre** : diagnostic en 3 étapes, vocabulaire simple, FCFA, français naturel.
- **Éviter l'erreur en chaîne** : **Garde-fou** — « Avant de recommencer, vérifiez le statut de la première opération pour éviter un doublon. »
- **Préparer** : dossier local avec réf. `JOT-…`, timeline, prochaine action.
- **Suivre & partager** : résumé copiable/partageable, statuts (À vérifier → Préparé → Assistance → Résolution simulée).

Signature : *« Quand une opération bloque, tu sais quoi faire. »*

## 3. Fonctions Max it existantes (non dupliquées)

Historique, vérification d'opération, annulation de certains transferts, canaux d'assistance. JOTTALE **oriente vers elles** au lieu de les réinventer.

Sources consultées : `orange.sn/assistance` (tentative d'accès le 22/10/2026 — à confirmer selon connectivité). Le prototype ne prétend pas refléter exhaustivement l'offre Max it.

## 4. Architecture & choix

- Local-first, sans backend (démo jury).
- `localStorage` pour la persistance.
- Logique déterministe (3 cas : incertain / confirmé démo / échec démo) — pas de faux agent IA.
- Mobile-first 390px, charte Orange mesurée (orange #ff7900, blanc, anthracite, gris clair), Inter, contrastes AA.

## 5. Limites du prototype (assumées)

- Données 100% fictives, clairement étiquetées.
- Aucune vérification de solde, aucun remboursement/annulation réel.
- Dossier ≠ réclamation transmise à Orange.
- Ne collecte jamais PIN, OTP, CNI, mot de passe.

## 6. Ce qu'il faudrait pour un déploiement réel dans Max it

- **API officielle Orange** (à définir avec Orange — aucun endpoint inventé ici) exposant au minimum :
  - `verifyTransaction(ref)` → confirmed / failed / pending
  - `submitClaim(dossier)` → claimId officiel
- Auth Max it (OAuth / SDK mini-app), conforme RGPD / données Sénégal.
- Intégration historique temps réel + push statut.
- Interface `OrangeIntegrationPort` dans `src/lib.ts` prête à brancher sans modifier les vues.
- Tests d'accessibilité, i18n (wolof), mode hors-ligne partiel, analytics anonymes.

## 7. Trois améliorations prioritaires avant intégration

1. **Branchement API vérification temps réel** + garde-fou bloquant le bouton « Répéter » tant que pending.
2. **Soumission officielle du dossier** vers le système de ticketing Orange (avec accusé de réception).
3. **Accessibilité & langues** : lecture simplifiée / audio, wolof, contrastes renforcés, tests utilisateurs terrain ODC.
