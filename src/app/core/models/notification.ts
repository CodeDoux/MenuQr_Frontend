import { TypeNotification } from "../enums/enums";

export interface Notification {
  id: string;
  utilisateurId?: string | null;
  clientId?: string | null;
  titre: string;
  message: string;
  type: TypeNotification;
  lien?: string | null;
  estLu: boolean;
  dateEnvoie: string;
}
