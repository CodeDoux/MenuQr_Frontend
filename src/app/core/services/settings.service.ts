import { Injectable, signal } from '@angular/core';
import { JourSemaine, MethodePaiement } from '../../core/enums/enums';
import { Horaire, HoraireFormPayload, MoyenPaiement } from '../models/settings';

/** ⚠️ MOCK DATA — même principe que les autres services du projet. */

const RESTAURANT_ID_COURANT = 'rest-001';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const LIBELLE_METHODE: Record<MethodePaiement, string> = {
  [MethodePaiement.ESPECES]: 'Espèces',
  [MethodePaiement.WAVE]: 'Wave',
  [MethodePaiement.ORANGE_MONEY]: 'Orange Money',
  [MethodePaiement.CARTE]: 'Carte bancaire',
  [MethodePaiement.AUTRE]: 'Autre',
};

export { LIBELLE_METHODE };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _horaires = signal<Horaire[]>(this.seedHoraires());
  private readonly _moyensPaiement = signal<MoyenPaiement[]>(this.seedMoyensPaiement());

  readonly horaires = this._horaires.asReadonly();
  readonly moyensPaiement = this._moyensPaiement.asReadonly();

  modifierHoraire(id: string, payload: HoraireFormPayload): void {
    this._horaires.update((liste) => liste.map((h) => (h.id === id ? { ...h, ...payload } : h)));
  }

  basculerMoyenPaiement(id: string): void {
    this._moyensPaiement.update((liste) =>
      liste.map((m) => (m.id === id ? { ...m, estActif: !m.estActif } : m))
    );
  }

  modifierIdentifiantMarchand(id: string, identifiant: string): void {
    this._moyensPaiement.update((liste) =>
      liste.map((m) => (m.id === id ? { ...m, identifiantMarchand: identifiant || null } : m))
    );
  }

  private seedHoraires(): Horaire[] {
    const jours = [
      JourSemaine.LUNDI, JourSemaine.MARDI, JourSemaine.MERCREDI, JourSemaine.JEUDI,
      JourSemaine.VENDREDI, JourSemaine.SAMEDI, JourSemaine.DIMANCHE,
    ];
    return jours.map((jour) => ({
      id: uid('horaire'),
      restaurantId: RESTAURANT_ID_COURANT,
      jourSemaine: jour,
      heureOuverture: jour === JourSemaine.DIMANCHE ? null : '11:00',
      heureFermeture: jour === JourSemaine.DIMANCHE ? null : '22:00',
      estFerme: jour === JourSemaine.DIMANCHE,
    }));
  }

  private seedMoyensPaiement(): MoyenPaiement[] {
    return [
      { id: uid('mp'), restaurantId: RESTAURANT_ID_COURANT, methode: MethodePaiement.ESPECES, estActif: true, identifiantMarchand: null },
      { id: uid('mp'), restaurantId: RESTAURANT_ID_COURANT, methode: MethodePaiement.WAVE, estActif: true, identifiantMarchand: null },
      { id: uid('mp'), restaurantId: RESTAURANT_ID_COURANT, methode: MethodePaiement.ORANGE_MONEY, estActif: false, identifiantMarchand: null },
      { id: uid('mp'), restaurantId: RESTAURANT_ID_COURANT, methode: MethodePaiement.CARTE, estActif: false, identifiantMarchand: null },
      { id: uid('mp'), restaurantId: RESTAURANT_ID_COURANT, methode: MethodePaiement.AUTRE, estActif: false, identifiantMarchand: null },
    ];
  }
}
