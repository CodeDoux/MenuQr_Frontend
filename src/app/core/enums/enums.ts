/**
 * Enums MenuQr V1 — source de vérité unique.
 * Correspond strictement au document validé `enums_menuqr_v1_final.md`.
 * Ne pas ajouter de valeur ici sans mise à jour du document de référence.
 */

export enum StatutRestaurant {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  INACTIF = 'INACTIF',
  FERME = 'FERME',
}

export enum StatutProduit {
  ACTIF = 'ACTIF',
  ARCHIVE = 'ARCHIVE',
}

export enum StatutVisite {
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
}

export enum StatutAddition {
  OUVERTE = 'OUVERTE',
  PARTIELLEMENT_PAYEE = 'PARTIELLEMENT_PAYEE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE',
}

export enum TypePaiement {
  COMMANDE = 'COMMANDE',
  ABONNEMENT = 'ABONNEMENT',
}

export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRME = 'CONFIRME',
  ECHOUE = 'ECHOUE',
  REMBOURSE = 'REMBOURSE',
  ANNULE = 'ANNULE',
}

export enum JourSemaine {
  LUNDI = 'LUNDI',
  MARDI = 'MARDI',
  MERCREDI = 'MERCREDI',
  JEUDI = 'JEUDI',
  VENDREDI = 'VENDREDI',
  SAMEDI = 'SAMEDI',
  DIMANCHE = 'DIMANCHE',
}

export enum MethodePaiement {
  ESPECES = 'ESPECES',
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  CARTE = 'CARTE',
  AUTRE = 'AUTRE',
}

export enum TypeReduction {
  POURCENTAGE = 'POURCENTAGE',
  MONTANT_FIXE = 'MONTANT_FIXE',
}

export enum CiblePromotion {
  PRODUIT = 'PRODUIT',
  COMMANDE_ENTIERE = 'COMMANDE_ENTIERE',
}

export enum TypeNotification {
  NOUVELLE_COMMANDE = 'NOUVELLE_COMMANDE',
  STATUT_COMMANDE_CHANGE = 'STATUT_COMMANDE_CHANGE',
  ABONNEMENT_EXPIRE_BIENTOT = 'ABONNEMENT_EXPIRE_BIENTOT',
  STOCK_RUPTURE = 'STOCK_RUPTURE',
  NOUVEL_EMPLOYE_INVITE = 'NOUVEL_EMPLOYE_INVITE',
}

export enum StatutEmploye {
  ACTIF = 'ACTIF',
  EN_CONGE = 'EN_CONGE',
  SUSPENDU = 'SUSPENDU',
  TERMINE = 'TERMINE',
}

export enum StatutAcces {
  INVITE = 'INVITE',
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  REVOQUE = 'REVOQUE',
}

export enum RoleCode {
  PROPRIETAIRE = 'PROPRIETAIRE',
  GERANT = 'GERANT',
  SERVEUR = 'SERVEUR',
  CUISINIER = 'CUISINIER',
  CAISSIER = 'CAISSIER',
  LIVREUR = 'LIVREUR',
}

export enum StatutSalle {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum StatutTable {
  LIBRE = 'LIBRE',
  OCCUPEE = 'OCCUPEE',
  HORS_SERVICE = 'HORS_SERVICE',
}

export enum TypeQRCode {
  TABLE = 'TABLE',
  EMPORTER = 'EMPORTER',
  LIVRAISON = 'LIVRAISON',
}

export enum ModeCommande {
  SUR_PLACE = 'SUR_PLACE',
  EMPORTER = 'EMPORTER',
  LIVRAISON = 'LIVRAISON',
}

export enum StatutCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  EN_PREPARATION = 'EN_PREPARATION',
  PRETE = 'PRETE',
  SERVIE = 'SERVIE',
  REMISE = 'REMISE',
  LIVREE = 'LIVREE',
  ANNULEE = 'ANNULEE',
}
