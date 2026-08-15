import { CiblePromotion, TypeReduction } from '../../core/enums/enums';

export interface Promotion {
  id: string;
  restaurantId: string;
  nom: string;
  code?: string | null; // renseigné = le client doit le saisir ; NULL = automatique
  typeReduction: TypeReduction;
  valeur: number;
  cible: CiblePromotion;
  produitIds: string[]; // via PromotionProduit, pertinent seulement si cible = PRODUIT
  dateDebut: string;
  dateFin?: string | null;
  limiteUtilisation?: number | null;
  nombreUtilisations: number;
  estActive: boolean;
  createdAt: string;
}

export type PromotionFormPayload = Pick<
  Promotion,
  'nom' | 'code' | 'typeReduction' | 'valeur' | 'cible' | 'produitIds' | 'dateDebut' | 'dateFin' | 'limiteUtilisation' | 'estActive'
>;
