import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export const LIBELLE_METHODE: Record<string, string> = {
  ESPECES: 'Espèces', WAVE: 'Wave', ORANGE_MONEY: 'Orange Money', CARTE: 'Carte bancaire', AUTRE: 'Autre',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _restaurantInfos = signal({
    nom: '', adresse: '', telephone: '', email: null as string | null,
    description: null as string | null, logo: null as string | null,
  });
  readonly restaurantInfos = this._restaurantInfos.asReadonly();

  private readonly _horaires = signal<any[]>([]);
  private readonly _moyensPaiement = signal<any[]>([]);
  readonly horaires = this._horaires.asReadonly();
  readonly moyensPaiement = this._moyensPaiement.asReadonly();

  constructor(private readonly http: HttpClient) {
    this.chargerHoraires();
    this.chargerMoyensPaiement();
    this.chargerRestaurantInfos();
  }

   private async chargerRestaurantInfos(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<any>(`${API}/restaurant`));
    this._restaurantInfos.set({
      nom: rep.nom, adresse: rep.adresse, telephone: rep.telephone,
      email: rep.email, description: rep.description, logo: rep.logo,
    });
  }
  private async chargerHoraires(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/horaires`));
    this._horaires.set(rep.data.map((h) => this.mapHoraire(h)));
  }

  private async chargerMoyensPaiement(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/moyens-paiement`));
    this._moyensPaiement.set(rep.data.map((m) => this.mapMoyen(m)));
  }

  /** Accepte soit un objet payload, soit des paramètres séparés — compatible avec les deux styles d'appel. */
  async modifierRestaurantInfos(payload: {
    nom: string; adresse: string; telephone: string;
    email: string | null; description: string | null;
  }): Promise<void> {
    const rep = await firstValueFrom(this.http.put<any>(`${API}/restaurant`, payload));
    this._restaurantInfos.set({
      nom: rep.nom, adresse: rep.adresse, telephone: rep.telephone,
      email: rep.email, description: rep.description, logo: rep.logo,
    });
  }

  async modifierHoraire(id: string, payload: { heureOuverture?: string | null; heureFermeture?: string | null; estFerme: boolean }): Promise<void> {
    const rep = await firstValueFrom(
      this.http.put<{ data: any }>(`${API}/horaires/${id}`, {
        heure_ouverture: payload.heureOuverture ?? null, heure_fermeture: payload.heureFermeture ?? null, est_ferme: payload.estFerme,
      })
    );
    const maj = this.mapHoraire(rep.data);
    this._horaires.update((liste) => liste.map((h) => (h.id === id ? maj : h)));
  }

  async basculerMoyenPaiement(id: string): Promise<void> {
    const moyen = this._moyensPaiement().find((m) => m.id === id);
    if (!moyen) return;
    await this.majMoyen(id, !moyen.estActif, moyen.identifiantMarchand);
  }

  async modifierIdentifiantMarchand(id: string, valeur: string): Promise<void> {
    const moyen = this._moyensPaiement().find((m) => m.id === id);
    if (!moyen) return;
    await this.majMoyen(id, moyen.estActif, valeur);
  }

  private async majMoyen(id: string, estActif: boolean, identifiantMarchand: string | null): Promise<void> {
    const rep = await firstValueFrom(
      this.http.put<{ data: any }>(`${API}/moyens-paiement/${id}`, { est_actif: estActif, identifiant_marchand: identifiantMarchand })
    );
    const maj = this.mapMoyen(rep.data);
    this._moyensPaiement.update((liste) => liste.map((m) => (m.id === id ? maj : m)));
  }

  private mapHoraire(api: any) {
    return { id: api.id, jourSemaine: api.jour_semaine, heureOuverture: api.heure_ouverture, heureFermeture: api.heure_fermeture, estFerme: api.est_ferme };
  }

  private mapMoyen(api: any) {
    return { id: api.id, methode: api.methode, estActif: api.est_actif, identifiantMarchand: api.identifiant_marchand };
  }
}