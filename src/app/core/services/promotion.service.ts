import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private readonly _promotions = signal<any[]>([]);
  readonly promotions = this._promotions.asReadonly();

  constructor(private readonly http: HttpClient) {
    this.charger();
  }

  private async charger(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/promotions`));
    this._promotions.set(rep.data.map((p) => this.mapPromotion(p)));
  }

  async creerPromotion(payload: any): Promise<any> {
    const rep = await firstValueFrom(this.http.post<{ data: any }>(`${API}/promotions`, this.payloadVersApi(payload)));
    const nouvelle = this.mapPromotion(rep.data);
    this._promotions.update((liste) => [nouvelle, ...liste]);
    return nouvelle;
  }

  async modifierPromotion(id: string, payload: any): Promise<void> {
    const rep = await firstValueFrom(this.http.put<{ data: any }>(`${API}/promotions/${id}`, this.payloadVersApi(payload)));
    const maj = this.mapPromotion(rep.data);
    this._promotions.update((liste) => liste.map((p) => (p.id === id ? maj : p)));
  }

  async supprimerPromotion(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/promotions/${id}`));
    this._promotions.update((liste) => liste.filter((p) => p.id !== id));
  }

  private mapPromotion(api: any) {
    return {
      id: api.id, nom: api.nom, code: api.code,
      typeReduction: api.type_reduction, valeur: Number(api.valeur), cible: api.cible,
      produitIds: api.produit_ids ?? [],
      dateDebut: api.date_debut, dateFin: api.date_fin,
      limiteUtilisation: api.limite_utilisation, nombreUtilisations: api.nombre_utilisations,
      estActive: api.est_active, createdAt: api.created_at,
    };
  }

  private payloadVersApi(payload: any) {
    return {
      nom: payload.nom, code: payload.code || null,
      type_reduction: payload.typeReduction, valeur: payload.valeur, cible: payload.cible,
      produit_ids: payload.cible === 'PRODUIT' ? payload.produitIds : [],
      date_debut: payload.dateDebut, date_fin: payload.dateFin || null,
      limite_utilisation: payload.limiteUtilisation || null, est_active: payload.estActive,
    };
  }
}