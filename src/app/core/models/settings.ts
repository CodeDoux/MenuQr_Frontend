import { JourSemaine, MethodePaiement } from '../../core/enums/enums';

export interface Horaire {
  id: string;
  restaurantId: string;
  jourSemaine: JourSemaine;
  heureOuverture?: string | null; // format HH:mm
  heureFermeture?: string | null;
  estFerme: boolean;
}

export interface MoyenPaiement {
  id: string;
  restaurantId: string;
  methode: MethodePaiement;
  estActif: boolean;
  identifiantMarchand?: string | null;
}

export type HoraireFormPayload = Pick<Horaire, 'heureOuverture' | 'heureFermeture' | 'estFerme'>;
