import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

/**
 * ⚠️ offres et abonnement.offre viennent bruts de l'API (snake_case :
 * prix_mensuel, duree_essai, etc.) — pas mappés en camelCase ici,
 * contrairement aux autres modules. Adapte le template en conséquence.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly _offres = signal<any[]>([]);
  private readonly _abonnement = signal<any | null>(null);
  private readonly _factures = signal<any[]>([]);

  readonly offres = this._offres.asReadonly();
  readonly abonnement = this._abonnement.asReadonly();
  readonly factures = this._factures.asReadonly();

  readonly joursRestantsEssai = computed(() => {
    const abo = this._abonnement();
    if (!abo?.dateFin) return 0;
    const diffMs = new Date(abo.dateFin).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  });

  readonly offreActuelle = computed(() => this._abonnement()?.offre ?? null);

  // ============================================================
  // Module Admin MenuQR — vrai CRUD (auth admin séparée, cf. AdminAuthService)
  // ============================================================

  async creerOffre(payload: any): Promise<void> {
    const rep = await firstValueFrom(this.http.post<{ data: any }>(`${API}/admin/offres`, this.offrePayloadVersApi(payload)));
    this._offres.update((liste) => [...liste, rep.data]);
  }

  async modifierOffre(id: string, payload: any): Promise<void> {
    const rep = await firstValueFrom(this.http.put<{ data: any }>(`${API}/admin/offres/${id}`, this.offrePayloadVersApi(payload)));
    this._offres.update((liste) => liste.map((o) => (o.id === id ? rep.data : o)));
  }

  async supprimerOffre(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/admin/offres/${id}`));
    this._offres.update((liste) => liste.filter((o) => o.id !== id));
  }

  /** Liste complète (tous statuts) pour la page Admin — la liste publique
   *  ne renvoie que les offres ACTIF, insuffisant pour la gestion. */
  async chargerOffresAdmin(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/admin/offres`));
    this._offres.set(rep.data);
  }

  private offrePayloadVersApi(payload: any) {
    return {
      nom: payload.nom, description: payload.description,
      prix_mensuel: payload.prixMensuel ?? payload.prix_mensuel,
      prix_annuel: payload.prixAnnuel ?? payload.prix_annuel ?? null,
      duree_essai: payload.dureeEssai ?? payload.duree_essai ?? null,
      statut: payload.statut, ordre_affichage: payload.ordreAffichage ?? payload.ordre_affichage,
      fonctionnalites: payload.fonctionnalites ?? [],
      limites: payload.limites ?? [],
    };
  }

  constructor(private readonly http: HttpClient) {
    this.chargerOffres();
    // ⚠️ abonnement/factures ne sont plus chargés automatiquement : ce
    // service est partagé avec la page Admin (session admin, pas restaurant),
    // ce qui provoquait un 401 systématique sur ces endpoints restaurant-
    // authentifiés. La page Abonnement (restaurant) doit désormais appeler
    // explicitement chargerAbonnement()/chargerFactures() dans son ngOnInit.
  }

  private async chargerOffres(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/offres`));
    this._offres.set(rep.data);
  }

  async chargerAbonnement(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any }>(`${API}/abonnement`));
    this._abonnement.set(this.mapAbonnement(rep.data));
  }

  async chargerFactures(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/factures-abonnement`));
    this._factures.set(rep.data);
  }

  async changerOffre(offreId: string): Promise<void> {
    const rep = await firstValueFrom(this.http.put<{ data: any }>(`${API}/abonnement`, { offre_id: offreId }));
    this._abonnement.set(this.mapAbonnement(rep.data));
  }

  async annulerAbonnement(): Promise<void> {
    const rep = await firstValueFrom(this.http.patch<{ data: any }>(`${API}/abonnement/annuler`, {}));
    this._abonnement.set(this.mapAbonnement(rep.data));
  }

  async reactiverAbonnement(): Promise<void> {
    const rep = await firstValueFrom(this.http.patch<{ data: any }>(`${API}/abonnement/reactiver`, {}));
    this._abonnement.set(this.mapAbonnement(rep.data));
  }

  private mapAbonnement(api: any) {
    return {
      id: api.id, offre: api.offre, dateDebut: api.date_debut, dateFin: api.date_fin,
      statut: api.statut, renouvellementAutomatique: api.renouvellement_automatique,
      dateProchainPaiement: api.date_prochain_paiement,
    };
  }
}