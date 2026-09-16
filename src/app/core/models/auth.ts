import { RoleCode } from "../enums/enums";

/**
 * Représente l'utilisateur connecté, tel qu'exposé au reste du frontend.
 * Combine Utilisateur + RestaurantUtilisateur + Role + permissions résolues
 * (projection pratique pour l'UI — pas une classe du diagramme telle quelle).
 */
export interface UtilisateurConnecte {
  id: string;
  nomComplet: string;
  email: string;
  restaurantId: string;
  restaurantNom: string;
  role: RoleCode;
  permissions: string[];
  emailVerifie: boolean;
}

export interface LoginPayload {
  email: string;
  motDePasse: string;
}
