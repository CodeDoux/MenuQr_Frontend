import { Injectable, computed, signal } from '@angular/core';
import { TypeNotification } from '../../core/enums/enums';
import { Notification } from '../models/notification';

/**
 * ⚠️ MOCK DATA + version simplifiée V1 (décision actée) : pas de push/email/SMS,
 * juste un centre de notifications in-app consulté au rafraîchissement.
 */

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function ilYA(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _notifications = signal<Notification[]>(this.seed());

  readonly notifications = this._notifications.asReadonly();
  readonly nombreNonLues = computed(() => this._notifications().filter((n) => !n.estLu).length);

  marquerCommeLue(id: string): void {
    this._notifications.update((liste) => liste.map((n) => (n.id === id ? { ...n, estLu: true } : n)));
  }

  toutMarquerCommeLu(): void {
    this._notifications.update((liste) => liste.map((n) => ({ ...n, estLu: true })));
  }

  private seed(): Notification[] {
    return [
      {
        id: uid('notif'), utilisateurId: 'user-001', clientId: null,
        titre: 'Nouvelle commande', message: 'Commande #126 reçue — Table 12',
        type: TypeNotification.NOUVELLE_COMMANDE, lien: '/commandes', estLu: false, dateEnvoie: ilYA(4),
      },
      {
        id: uid('notif'), utilisateurId: 'user-001', clientId: null,
        titre: 'Rupture de stock', message: 'Le produit "Thiéboudiène" est marqué en rupture',
        type: TypeNotification.STOCK_RUPTURE, lien: '/produits', estLu: false, dateEnvoie: ilYA(45),
      },
      {
        id: uid('notif'), utilisateurId: 'user-001', clientId: null,
        titre: 'Essai bientôt terminé', message: 'Votre période d\'essai se termine dans 12 jours',
        type: TypeNotification.ABONNEMENT_EXPIRE_BIENTOT, lien: '/parametres', estLu: true, dateEnvoie: ilYA(500),
      },
    ];
  }
}
