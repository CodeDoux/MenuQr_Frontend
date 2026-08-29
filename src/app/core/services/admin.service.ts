import { Injectable, computed, signal } from '@angular/core';
import { StatutAbonnement, StatutRestaurant } from '../enums/enums';
import { AdminCompte, AdminCompteFormPayload, RestaurantSummary } from '../models/admin';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * ⚠️ MOCK DATA. Restaurants au-delà de 'rest-001' sont purement fictifs
 * (fiches d'info pour peupler la vue admin) — l'app étant mono-tenant,
 * ils n'ont pas de vraies données opérationnelles derrière (pas de menus,
 * commandes, etc. réellement liés).
 */
@Injectable({ providedIn: 'root' })
export class PlatformAdminService {
  private readonly _restaurants = signal<RestaurantSummary[]>(this.seedRestaurants());
  private readonly _comptesAdmin = signal<AdminCompte[]>(this.seedComptesAdmin());

  readonly restaurants = this._restaurants.asReadonly();
  readonly comptesAdmin = this._comptesAdmin.asReadonly();

  readonly nbTotal = computed(() => this._restaurants().length);
  readonly nbActifs = computed(() => this._restaurants().filter((r) => r.statut === StatutRestaurant.ACTIF).length);
  readonly nbEnEssai = computed(() => this._restaurants().filter((r) => r.abonnementStatut === StatutAbonnement.ESSAI).length);
  readonly nbSuspendus = computed(() => this._restaurants().filter((r) => r.statut === StatutRestaurant.SUSPENDU).length);

  changerStatutRestaurant(id: string, statut: StatutRestaurant): void {
    this._restaurants.update((liste) => liste.map((r) => (r.id === id ? { ...r, statut } : r)));
  }

  creerCompteAdmin(payload: AdminCompteFormPayload): AdminCompte {
    const nouveau: AdminCompte = { id: uid('admin'), ...payload, actif: true };
    this._comptesAdmin.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  basculerActifCompte(id: string): void {
    this._comptesAdmin.update((liste) => liste.map((c) => (c.id === id ? { ...c, actif: !c.actif } : c)));
  }

  supprimerCompteAdmin(id: string): void {
    this._comptesAdmin.update((liste) => liste.filter((c) => c.id !== id));
  }

  private seedRestaurants(): RestaurantSummary[] {
    return [
      {
        id: 'rest-001', nom: 'Le Palais', email: 'proprietaire@lepalais.sn',
        statut: StatutRestaurant.ACTIF, dateInscription: '2025-06-01T00:00:00.000Z',
        offreNom: 'Starter', abonnementStatut: StatutAbonnement.ESSAI, dateFinAbonnement: '2026-08-30T00:00:00.000Z',
      },
      {
        id: 'rest-002', nom: 'Chez Fatou', email: 'contact@chezfatou.sn',
        statut: StatutRestaurant.ACTIF, dateInscription: '2025-03-15T00:00:00.000Z',
        offreNom: 'Pro', abonnementStatut: StatutAbonnement.ACTIF, dateFinAbonnement: '2026-09-15T00:00:00.000Z',
      },
      {
        id: 'rest-003', nom: 'Fast Burger Dakar', email: 'admin@fastburger.sn',
        statut: StatutRestaurant.SUSPENDU, dateInscription: '2025-01-10T00:00:00.000Z',
        offreNom: 'Starter', abonnementStatut: StatutAbonnement.EXPIRE, dateFinAbonnement: '2026-05-10T00:00:00.000Z',
      },
      {
        id: 'rest-004', nom: 'Le Gourmet', email: 'contact@legourmet.sn',
        statut: StatutRestaurant.ACTIF, dateInscription: '2025-11-02T00:00:00.000Z',
        offreNom: 'Business', abonnementStatut: StatutAbonnement.ACTIF, dateFinAbonnement: '2026-12-02T00:00:00.000Z',
      },
    ];
  }

  private seedComptesAdmin(): AdminCompte[] {
    return [{ id: 'admin-001', nomComplet: 'Équipe MenuQr', email: 'admin@menuqr.com', actif: true }];
  }
}