import { ModeCommande, StatutAddition, StatutCommande, StatutPaiement, StatutVisite, TypePaiement } from '../../core/enums/enums';

export interface Visite {
  id: string;
  restaurantId: string;
  clientId?: string | null;
  tableId?: string | null;
  dateDebut: string;
  dateFin?: string | null;
  statut: StatutVisite;
}

export interface LigneCommande {
  id: string;
  commandeId: string;
  produitId: string;
  produitNom: string; // projection pour affichage, résolue depuis Produit au moment de la commande
  quantite: number;
  prixUnitaire: number; // historisé (RM09) — indépendant du prix courant du produit
  sousTotal: number;
  notes?: string | null;
}

export interface Commande {
  id: string;
  clientId?: string | null;
  visiteId?: string | null;
  tableId?: string | null;
  mode: ModeCommande;
  statut: StatutCommande;
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  lignes: LigneCommande[];
}

export interface Addition {
  id: string;
  visiteId: string;
  sousTotal: number;
  remise: number;
  taxe: number;
  total: number;
  statut: StatutAddition;
  createdAt: string;
}

export interface Paiement {
  id: string;
  type: TypePaiement;
  commandeId?: string | null;
  additionId?: string | null;
  montant: number;
  devise: string;
  methode: string;
  statut: StatutPaiement;
  reference?: string | null;
  datePaiement?: string | null;
}
