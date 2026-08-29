import { Injectable, computed, signal } from '@angular/core';
import { Facture } from '../models/facture';
import { StatutFacture } from '../enums/enums';

function uid(): string {
  return `fac-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * ⚠️ Simplification : aucune notion de taxe/TVA n'est modélisée ailleurs
 * dans le projet — taxe = 0 systématiquement, montantHT = montantTTC.
 * Même règle d'exclusivité que Paiement : commandeId XOR additionId.
 */
@Injectable({ providedIn: 'root' })
export class FactureService {
  private readonly _factures = signal<Facture[]>([]);

  readonly factures = this._factures.asReadonly();
  readonly facturesTriees = computed(() =>
    [...this._factures()].sort((a, b) => (a.dateEmission < b.dateEmission ? 1 : -1))
  );

  genererFacture(input: { commandeId?: string | null; additionId?: string | null; montantTTC: number }): Facture {
    const numero = `FAC-${Date.now().toString().slice(-8)}`;
    const facture: Facture = {
      id: uid(), numero,
      commandeId: input.commandeId ?? null, additionId: input.additionId ?? null,
      montantHT: input.montantTTC, taxe: 0, montantTTC: input.montantTTC,
      dateEmission: nowIso(), statut: StatutFacture.PAYEE,
    };
    this._factures.update((liste) => [...liste, facture]);
    return facture;
  }

  factureParId(id: string) {
    return computed(() => this._factures().find((f) => f.id === id));
  }
}