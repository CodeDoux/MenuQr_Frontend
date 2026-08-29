import { StatutAbonnement, StatutRestaurant } from "../enums/enums";

/**
 * ⚠️ Projection simplifiée pour la vue admin — pas une classe du diagramme
 * telle quelle. Ne reflète pas les vraies données opérationnelles de chaque
 * restaurant (menus, commandes...), seulement les infos utiles à la
 * supervision plateforme.
 */
export interface RestaurantSummary {
  id: string;
  nom: string;
  email: string;
  statut: StatutRestaurant;
  dateInscription: string;
  offreNom: string;
  abonnementStatut: StatutAbonnement;
  dateFinAbonnement: string;
}

export interface AdminCompte {
  id: string;
  nomComplet: string;
  email: string;
  actif: boolean;
}

export type AdminCompteFormPayload = Pick<AdminCompte, 'nomComplet' | 'email'>;