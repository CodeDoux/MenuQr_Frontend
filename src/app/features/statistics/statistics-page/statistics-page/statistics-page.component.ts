import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModeCommande } from '../../../../core/enums/enums';
import { StatisticsService } from '../../../../core/services/statistics.service';

const LABEL_MODE: Record<string, string> = {
  SUR_PLACE: 'Sur place', EMPORTER: 'À emporter', LIVRAISON: 'Livraison',
};

const MODES: ModeCommande[] = [ModeCommande.SUR_PLACE, ModeCommande.EMPORTER, ModeCommande.LIVRAISON];

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-page.component.html',
})
export class StatisticsPageComponent {
  readonly caJour;
  readonly caSemaine;
  readonly nombreCommandesTotal;
  readonly repartitionParMode;
  readonly topProduits;
  readonly LABEL_MODE = LABEL_MODE;
  readonly MODES = MODES;

  constructor(private readonly service: StatisticsService) {
    this.caJour = this.service.caJour;
    this.caSemaine = this.service.caSemaine;
    this.nombreCommandesTotal = this.service.nombreCommandesTotal;
    this.repartitionParMode = this.service.repartitionParMode;
    this.topProduits = this.service.topProduits;
  }

  totalRepartition(): number {
    const r = this.repartitionParMode();
    return r.SUR_PLACE + r.EMPORTER + r.LIVRAISON || 1;
  }

  pourcentage(valeur: number): number {
    return Math.round((valeur / this.totalRepartition()) * 100);
  }

  maxQuantiteTopProduits(): number {
    return Math.max(1, ...this.topProduits().map((p) => p.quantite));
  }
}