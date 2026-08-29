import { Injectable, computed, signal } from '@angular/core';
import { JournalEntry } from '../models/journal-activite';
import { AuthService } from './auth.service';

const RESTAURANT_ID_COURANT = 'rest-001';

function uid(): string {
  return `log-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Journal des actions clés uniquement (décision actée) : changement de statut
 * de commande, paiement, remboursement, création/fin de contrat d'un employé.
 * Pas une traçabilité exhaustive de toutes les actions CRUD de l'app.
 */
@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly _entries = signal<JournalEntry[]>([]);

  readonly entries = this._entries.asReadonly();
  readonly entriesTriees = computed(() =>
    [...this._entries()].sort((a, b) => (a.date < b.date ? 1 : -1))
  );

  constructor(private readonly auth: AuthService) {}

  enregistrer(
    action: string,
    tableCible: string,
    idCible?: string | null,
    ancienneValeur?: string | null,
    nouvelleValeur?: string | null
  ): void {
    const utilisateur = this.auth.currentUser();
    const entree: JournalEntry = {
      id: uid(),
      utilisateurId: utilisateur?.id ?? 'system',
      utilisateurNom: utilisateur?.nomComplet ?? 'Système',
      restaurantId: RESTAURANT_ID_COURANT,
      action, tableCible, idCible: idCible ?? null,
      ancienneValeur: ancienneValeur ?? null, nouvelleValeur: nouvelleValeur ?? null,
      date: nowIso(),
    };
    this._entries.update((liste) => [...liste, entree]);
  }
}