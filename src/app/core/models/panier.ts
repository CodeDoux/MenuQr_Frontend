import { ModeCommande } from "../enums/enums";

export interface CartItem {
  id: string;
  produitId: string;
  produitNom: string;
  varianteId?: string | null;
  varianteNom?: string | null;
  prixUnitaire: number;
  quantite: number;
  sousTotal: number;
}

export interface InfosEmporter {
  nom: string;
  telephone: string;
  heureRetrait?: string | null;
}

export interface AdresseLivraisonForm {
  adresseComplete: string;
  quartier?: string | null;
  ville?: string | null;
  indications?: string | null;
}

export type ModeSelectionne = ModeCommande | null;