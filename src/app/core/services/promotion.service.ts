import { Injectable, signal } from '@angular/core';
import { CiblePromotion, TypeReduction } from '../../core/enums/enums';
import { Promotion, PromotionFormPayload } from '../models/promotion';

/** ⚠️ MOCK DATA — même principe que les autres services du projet. */

const RESTAURANT_ID_COURANT = 'rest-001';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private readonly _promotions = signal<Promotion[]>(this.seed());

  readonly promotions = this._promotions.asReadonly();

  creerPromotion(payload: PromotionFormPayload): Promotion {
    const nouvelle: Promotion = {
      id: uid('promo'),
      restaurantId: RESTAURANT_ID_COURANT,
      ...payload,
      nombreUtilisations: 0,
      createdAt: nowIso(),
    };
    this._promotions.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  modifierPromotion(id: string, payload: PromotionFormPayload): void {
    this._promotions.update((liste) =>
      liste.map((p) => (p.id === id ? { ...p, ...payload } : p))
    );
  }

  supprimerPromotion(id: string): void {
    this._promotions.update((liste) => liste.filter((p) => p.id !== id));
  }

  private seed(): Promotion[] {
    return [
      {
        id: 'promo-weekend', restaurantId: RESTAURANT_ID_COURANT, nom: 'Weekend Pizza',
        code: null, typeReduction: TypeReduction.POURCENTAGE, valeur: 20,
        cible: CiblePromotion.PRODUIT, produitIds: ['prod-pizza'],
        dateDebut: nowIso(), dateFin: null, limiteUtilisation: null, nombreUtilisations: 0,
        estActive: true, createdAt: nowIso(),
      },
    ];
  }
}
