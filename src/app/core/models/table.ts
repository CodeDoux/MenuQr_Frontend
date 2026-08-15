import { StatutTable } from "../enums/enums";

export interface TableRestaurant {
  id: string;
  salleId: string;
  numero: string;
  capacite: number;
  statut: StatutTable;
  zone?: string | null;
}

export type TableFormPayload = Pick<TableRestaurant, 'numero' | 'capacite' | 'statut' | 'zone'> & { salleId: string };
