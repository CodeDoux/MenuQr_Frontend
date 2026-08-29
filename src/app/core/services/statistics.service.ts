import { Injectable, computed } from '@angular/core';
import { OrdersService } from './orders.service';
import { ModeCommande, StatutCommande } from '../enums/enums';

/**
 * Les statistiques sont entièrement dérivées (computed) des commandes déjà
 * en mémoire dans OrdersService — pas de nouvelle entité de modèle, conforme
 * au contenu validé : CA jour/semaine, nb commandes, top produits,
 * répartition par mode.
 */
@Injectable({ providedIn: 'root' })
export class StatisticsService {
  constructor(private readonly ordersService: OrdersService) {}

  private readonly commandesValides = computed(() =>
    this.ordersService.commandes().filter((c) => c.statut !== StatutCommande.ANNULEE)
  );

  readonly caJour = computed(() => {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    return this.commandesValides()
      .filter((c) => new Date(c.createdAt) >= debutJour)
      .reduce((acc, c) => acc + c.total, 0);
  });

  readonly caSemaine = computed(() => {
    const ilYA7Jours = new Date(Date.now() - 7 * 86_400_000);
    return this.commandesValides()
      .filter((c) => new Date(c.createdAt) >= ilYA7Jours)
      .reduce((acc, c) => acc + c.total, 0);
  });

  readonly nombreCommandesTotal = computed(() => this.ordersService.commandes().length);

  readonly nombreParStatut = computed(() => {
    const compte: Record<string, number> = {};
    for (const c of this.ordersService.commandes()) {
      compte[c.statut] = (compte[c.statut] ?? 0) + 1;
    }
    return compte;
  });

  readonly repartitionParMode = computed(() => {
    const compte: Record<ModeCommande, number> = { SUR_PLACE: 0, EMPORTER: 0, LIVRAISON: 0 };
    for (const c of this.commandesValides()) {
      compte[c.mode]++;
    }
    return compte;
  });

  readonly topProduits = computed(() => {
    const compte: Record<string, { nom: string; quantite: number }> = {};
    for (const c of this.commandesValides()) {
      for (const l of c.lignes) {
        if (!compte[l.produitId]) compte[l.produitId] = { nom: l.produitNom, quantite: 0 };
        compte[l.produitId].quantite += l.quantite;
      }
    }
    return Object.values(compte)
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);
  });
}