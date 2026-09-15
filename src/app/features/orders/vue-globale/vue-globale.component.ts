import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { StatutCommande } from '../../../core/enums/enums';
import { OrdersService } from '../../../core/services/orders.service';

const LABEL_STATUT: Record<StatutCommande, string> = {
  EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', EN_PREPARATION: 'En préparation',
  PRETE: 'Prête', SERVIE: 'Servie', REMISE: 'Remise', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};

const TONE_STATUT: Record<StatutCommande, BadgeTone> = {
  EN_ATTENTE: 'neutral', CONFIRMEE: 'info', EN_PREPARATION: 'warning',
  PRETE: 'info', SERVIE: 'success', REMISE: 'success', LIVREE: 'success', ANNULEE: 'danger',
};

const LABEL_MODE: Record<string, string> = {
  SUR_PLACE: 'Sur place', EMPORTER: 'À emporter', LIVRAISON: 'Livraison',
};

const ICONE_MODE: Record<string, string> = {
  SUR_PLACE: '🍽️', EMPORTER: '🥡', LIVRAISON: '🛵',
};

@Component({
  selector: 'app-vue-globale',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './vue-globale.component.html',
  styleUrl: './vue-globale.component.css',
})
export class VueGlobaleComponent implements OnInit {
  readonly commandes;
  readonly meta;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly TONE_STATUT = TONE_STATUT;
  readonly LABEL_MODE = LABEL_MODE;
  readonly ICONE_MODE = ICONE_MODE;

  constructor(private readonly service: OrdersService) {
    this.commandes = this.service.commandesGlobalePage;
    this.meta = this.service.commandesGlobaleMeta;
  }

  ngOnInit(): void {
    this.service.chargerCommandesGlobale(1, 20).catch(() => {});
  }

  allerPage(page: number): void {
    const m = this.meta();
    if (page < 1 || page > m.lastPage || page === m.currentPage) return;
    this.service.chargerCommandesGlobale(page, m.perPage).catch(() => {});
  }

  numeroCourt(id: string): string {
    return '#' + id.slice(-4).toUpperCase();
  }
}