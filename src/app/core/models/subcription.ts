import { StatutAbonnement, StatutFactureAbonnement, StatutPlan } from '../../core/enums/enums';

export interface Offre {
  id: string;
  nom: string;
  description?: string | null;
  prixMensuel: number;
  prixAnnuel?: number | null;
  devise: string;
  dureeEssai?: number | null;
  statut: StatutPlan;
  ordreAffichage: number;
  // Simplification d'affichage de Fonctionnalite/OffreFonctionnalite et LimitePlan
  // (N:N réelles dans le modèle, gérées côté Admin MenuQR — non construit ici)
  fonctionnalites: string[];
  limites: { nom: string; valeur: number; unite: string }[];
}

export interface Abonnement {
  id: string;
  restaurantId: string;
  offreId: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutAbonnement;
  renouvellementAutomatique: boolean;
  dateProchainPaiement?: string | null;
}

export interface FactureAbonnement {
  id: string;
  abonnementId: string;
  numero: string;
  montant: number;
  dateEmission: string;
  dateEcheance: string;
  statut: StatutFactureAbonnement;
}

export type OffreFormPayload = Pick<
  Offre,
  'nom' | 'description' | 'prixMensuel' | 'prixAnnuel' | 'devise' | 'dureeEssai' | 'statut' | 'ordreAffichage' | 'fonctionnalites' | 'limites'
>;