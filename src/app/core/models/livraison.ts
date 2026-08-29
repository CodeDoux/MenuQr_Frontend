import { StatutLivraison, StatutZone, TypeLivreur } from '../../core/enums/enums';

export interface ZoneLivraison {
  id: string;
  restaurantId: string;
  nom: string;
  description?: string | null;
  frais: number;
  tempsEstime?: number | null; // minutes
  distanceMax?: number | null; // km
  statut: StatutZone;
}

export interface Livraison {
  id: string;
  commandeId: string;
  // ⚠️ Simplification : adresse stockée directement ici plutôt que via une
  // classe AdresseLivraison séparée liée à un Client (le client reste anonyme
  // en V1, pas de compte/carnet d'adresses — cf. modèle client sans compte).
  adresseComplete: string;
  quartier?: string | null;
  indications?: string | null;
  nomClient: string;
  telephoneClient: string;
  typeLivreur?: TypeLivreur | null; // null tant que non affecté
  livreurEmployeId?: string | null;
  nomLivreurExterne?: string | null;
  telephoneLivreurExterne?: string | null;
  statut: StatutLivraison;
  zoneLivraisonId?: string | null;
  dateAffectation?: string | null;
  createdAt: string;
}

export type ZoneFormPayload = Pick<ZoneLivraison, 'nom' | 'description' | 'frais' | 'tempsEstime' | 'distanceMax' | 'statut'>;