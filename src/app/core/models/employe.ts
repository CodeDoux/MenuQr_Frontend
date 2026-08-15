import { RoleCode, StatutAcces, StatutEmploye } from "../enums/enums";

export interface Poste {
  id: string;
  restaurantId: string;
  nom: string;
  description?: string | null;
  niveau?: number | null;
}

/** Représente l'accès applicatif — projection simplifiée de RestaurantUtilisateur */
export interface AccesPlateforme {
  id: string;
  restaurantId: string;
  role: RoleCode;
  statut: StatutAcces;
  dateInvitation?: string | null;
  dateAcceptation?: string | null;
}

export interface Employe {
  id: string;
  restaurantId: string;
  nomComplet: string; // projection depuis Utilisateur, pour affichage
  email: string; // idem
  posteId: string;
  accesPlateformeId?: string | null;
  matricule?: string | null;
  dateEmbauche?: string | null;
  dateFin?: string | null;
  statut: StatutEmploye;
  notes?: string | null;
}

export type PosteFormPayload = Pick<Poste, 'nom' | 'description' | 'niveau'>;

export type EmployeFormPayload = {
  nomComplet: string;
  email: string;
  posteId: string;
  matricule?: string | null;
  dateEmbauche?: string | null;
  statut: StatutEmploye;
  notes?: string | null;
  // Gestion de l'accès plateforme (optionnelle)
  accorderAcces: boolean;
  role?: RoleCode | null;
};
