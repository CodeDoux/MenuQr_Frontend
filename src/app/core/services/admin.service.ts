import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class PlatformAdminService {
  private readonly _restaurants = signal<any[]>([]);
  private readonly _comptesAdmin = signal<any[]>([]);

  readonly restaurants = this._restaurants.asReadonly();
  readonly comptesAdmin = this._comptesAdmin.asReadonly();

  readonly nbTotal = computed(() => this._restaurants().length);
  readonly nbActifs = computed(() => this._restaurants().filter((r) => r.statut === 'ACTIF').length);
  readonly nbEnEssai = computed(() => this._restaurants().filter((r) => r.abonnement_statut === 'ESSAI').length);
  readonly nbSuspendus = computed(() => this._restaurants().filter((r) => r.statut === 'SUSPENDU').length);

  constructor(private readonly http: HttpClient) {
    this.chargerRestaurants();
    this.chargerComptesAdmin();
  }

  private async chargerRestaurants(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/admin/restaurants`));
    this._restaurants.set(rep.data);
  }

  private async chargerComptesAdmin(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/admin/administrateurs`));
    this._comptesAdmin.set(rep.data);
  }

  async changerStatutRestaurant(id: string, statut: string): Promise<void> {
    const rep = await firstValueFrom(this.http.patch<{ data: any }>(`${API}/admin/restaurants/${id}/statut`, { statut }));
    this._restaurants.update((liste) => liste.map((r) => (r.id === id ? rep.data : r)));
  }

  async creerCompteAdmin(payload: { nomComplet: string; email: string }): Promise<void> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/admin/administrateurs`, { nom_complet: payload.nomComplet, email: payload.email })
    );
    this._comptesAdmin.update((liste) => [...liste, rep.data]);
  }

  async basculerActifCompte(id: string): Promise<void> {
    const rep = await firstValueFrom(this.http.patch<{ data: any }>(`${API}/admin/administrateurs/${id}/toggle-actif`, {}));
    this._comptesAdmin.update((liste) => liste.map((c) => (c.id === id ? rep.data : c)));
  }

  async supprimerCompteAdmin(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/admin/administrateurs/${id}`));
    this._comptesAdmin.update((liste) => liste.filter((c) => c.id !== id));
  }
}