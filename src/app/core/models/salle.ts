/**
 * Modèles TypeScript — Domaine Salle / TableRestaurant / QRCode.
 * Dérivés strictement du diagramme de classes MenuQr V1 corrigé.
 */

import { StatutSalle, TypeQRCode } from "../enums/enums";
import { TableRestaurant } from "./table";

export interface Salle {
  id: string;
  restaurantId: string;
  description: string;
  ordre: number;
  statut: StatutSalle;
}



export interface QRCode {
  id: string;
  restaurantId: string;
  tableId?: string | null;
  code: string;
  url?: string | null;
  image?: string | null; // data URL générée côté client
  type: TypeQRCode;
  dateExpiration?: string | null;
  nombreScan: number;
  estActif: boolean;
  createdAt: string;
}

export type SalleFormPayload = Pick<Salle, 'description' | 'ordre' | 'statut'>;

export type TableFormPayload = Pick<TableRestaurant, 'numero' | 'capacite' | 'statut' | 'zone'> & { salleId: string };
