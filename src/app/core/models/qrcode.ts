import { TypeQRCode } from "../enums/enums";

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