import { StatutProduit } from "../enums/enums";
import { Categorie } from "./categorie";
import { Promotion } from "./promotion";


export interface Produit {
    id: string;
      restaurantId: string;
      nom: string;
      description?: string | null;
      prix: number;
      estDisponible: boolean;
      estVisible: boolean;
      estPopulaire: boolean;
      tempsPreparation?: number | null; // en minutes
      statut: StatutProduit;
      createdAt: string;
      updatedAt: string;
      // Champs de commodité, résolus côté service à partir de CategorieProduit / Variante / ImageProduit
      // (pas des attributs du modèle de classes — c'est une projection pour l'UI)
      categorieIds: string[];
      variantes: Variante[];
      images: ImageProduit[];
}

export interface ImageProduit {
  id: string;
  produitId: string;
  url: string;
  ordreAffichage: number;
  estPrincipale: boolean;
}

export interface Variante {
  id: string;
  produitId: string;
  nom: string;
  prix: number;
  estDisponible: boolean;
}

export type ProduitFormPayload = Pick<Produit, 'nom' | 'description' | 'prix' | 'estDisponible' | 'estVisible' | 'estPopulaire' | 'tempsPreparation'> & {
  categorieIds: string[];
  variantes: Omit<Variante, 'id' | 'produitId'>[];
  images: Omit<ImageProduit, 'id' | 'produitId'>[];
};