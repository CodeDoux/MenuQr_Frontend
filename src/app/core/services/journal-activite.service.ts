import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JournalEntry } from '../models/journal-activite';

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

/**
 * Journal des actions clés uniquement (décision actée) : changement de statut
 * de commande, paiement, remboursement, création/fin de contrat d'un employé.
 * Pas une traçabilité exhaustive de toutes les actions CRUD de l'app.
 *
 * L'enregistrement se fait côté SERVEUR (automatique) — ce service ne fait
 * que LIRE le journal via l'API, désormais paginé.
 */
@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly _entries = signal<JournalEntry[]>([]);
  private readonly _meta = signal<PaginationMeta>({ currentPage: 1, lastPage: 1, perPage: 30, total: 0 });

  readonly entries = this._entries.asReadonly();
  readonly meta = this._meta.asReadonly();
  readonly entriesTriees = computed(() =>
    [...this._entries()].sort((a, b) => (a.date < b.date ? 1 : -1))
  );

  constructor(private readonly http: HttpClient) {
    this.chargerPage(1);
  }

  async chargerPage(page: number = 1, perPage: number = 30): Promise<void> {
    const rep = await firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/journal`, { params: { page, per_page: perPage } })
    );
    this._entries.set(rep.data.map((e: any) => this.mapEntree(e)));
    this._meta.set({
      currentPage: rep.meta.current_page,
      lastPage: rep.meta.last_page,
      perPage: rep.meta.per_page,
      total: rep.meta.total,
    });
  }

  /** @deprecated Ne fait plus rien — la journalisation est automatique côté serveur. */
  enregistrer(
    _action: string,
    _tableCible: string,
    _idCible?: string | null,
    _ancienneValeur?: string | null,
    _nouvelleValeur?: string | null
  ): void {
    // no-op volontaire
  }

  private mapEntree(api: any): JournalEntry {
    return {
      id: api.id,
      utilisateurId: '',
      utilisateurNom: api.utilisateur_nom ?? 'Système',
      restaurantId: '',
      action: api.action,
      tableCible: api.table_cible,
      idCible: api.id_cible,
      ancienneValeur: api.ancienne_valeur,
      nouvelleValeur: api.nouvelle_valeur,
      date: api.date,
    };
  }
}