import { StatutFacture } from "../enums/enums";

export interface Facture {
  id: string;
  numero: string;
  commandeId?: string | null;
  additionId?: string | null;
  montantHT: number;
  taxe: number;
  montantTTC: number;
  dateEmission: string;
  statut: StatutFacture;
}