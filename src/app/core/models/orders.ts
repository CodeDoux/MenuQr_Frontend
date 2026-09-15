import { ModeCommande, StatutCommande } from '../../core/enums/enums';

export interface LigneCommande {
  id: string;
  commandeId: string;
  produitId: string;
  produitNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  notes?: string | null;
}

export interface Commande {
  id: string;
  visiteId?: string | null;
  tableId?: string | null;
  tableNumero?: string | null;
  mode: ModeCommande;
  statut: StatutCommande;
  sousTotal: number;
  fraisLivraison: number;
  remise: number;
  total: number;
  notes?: string | null;
  nomClient?: string | null;
  telephoneClient?: string | null;
  heureRetraitSouhaitee?: string | null;
  createdAt: string;
  updatedAt: string;
  lignes: LigneCommande[];
}

export interface AdditionAvecCommandes {
  id: string;
  visiteId: string;
  tableNumero?: string | null;
  sousTotal: number;
  remise: number;
  taxe: number;
  total: number;
  statut: string;
  commandes: Commande[];
  createdAt: string;
}

export interface Paiement {
  id: string;
  type: string;
  commandeId?: string | null;
  additionId?: string | null;
  montant: number;
  devise: string;
  methode: string;
  statut: string;
  reference?: string | null;
  datePaiement?: string | null;
}