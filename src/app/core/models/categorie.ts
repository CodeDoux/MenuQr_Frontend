export interface Categorie {
   id: string;
  menuId: string;
  nom: string;
  description?: string | null;
  icone?: string | null;
  ordreAffichage: number;
  estActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategorieFormPayload = Pick<Categorie, 'nom' | 'description' | 'icone' | 'ordreAffichage' | 'estActive'> & { menuId: string };

