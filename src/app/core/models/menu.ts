export interface Menu {
  id: string;
  restaurantId: string;
  nom: string;
  description?: string | null;
  image?: string | null;
  ordreAffichage: number;
  estActif: boolean;
  dateDebut?: string | null;
  dateFin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MenuFormPayload = Pick<Menu, 'nom' | 'description' | 'image' | 'ordreAffichage' | 'estActif' | 'dateDebut' | 'dateFin'>;
