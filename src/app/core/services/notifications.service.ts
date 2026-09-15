import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification';

const API = environment.apiUrl;
const INTERVALLE_RAFRAICHISSEMENT_MS = 60_000; // 60s — pas de push temps réel (décision actée V1)

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _notifications = signal<Notification[]>([]);

  readonly notifications = this._notifications.asReadonly();
  readonly nombreNonLues = computed(() => this._notifications().filter((n) => !n.estLu).length);

  constructor(private readonly http: HttpClient) {
    this.charger();
    setInterval(() => this.charger(), INTERVALLE_RAFRAICHISSEMENT_MS);
  }

  async charger(): Promise<void> {
    try {
      const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/notifications`));
      this._notifications.set(rep.data.map((n) => this.mapNotification(n)));
    } catch {
      // Échec silencieux (ex. token pas encore prêt au tout premier chargement) —
      // le prochain intervalle réessaiera.
    }
  }

  async marquerCommeLue(id: string): Promise<void> {
    this._notifications.update((liste) => liste.map((n) => (n.id === id ? { ...n, estLu: true } : n)));
    try {
      await firstValueFrom(this.http.patch(`${API}/notifications/${id}/lue`, {}));
    } catch {
      // Revert léger non géré ici — au pire, le prochain charger() resynchronisera l'état réel.
    }
  }

  async toutMarquerCommeLu(): Promise<void> {
    this._notifications.update((liste) => liste.map((n) => ({ ...n, estLu: true })));
    try {
      await firstValueFrom(this.http.patch(`${API}/notifications/tout-marquer-lu`, {}));
    } catch {
      // idem
    }
  }

  private mapNotification(api: any): Notification {
    return {
      id: api.id,
      utilisateurId: '',
      clientId: null,
      titre: api.titre,
      message: api.message,
      type: api.type,
      lien: api.lien,
      estLu: api.est_lu,
      dateEnvoie: api.date_envoi,
    };
  }
}