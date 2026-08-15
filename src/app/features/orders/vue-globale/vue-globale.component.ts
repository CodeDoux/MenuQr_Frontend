import { Component } from '@angular/core';
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

@Component({
  selector: 'app-vue-globale',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './vue-globale.component.html',
})
export class VueGlobaleComponent {
  readonly commandes;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly TONE_STATUT = TONE_STATUT;
  readonly LABEL_MODE = LABEL_MODE;

  constructor(private readonly service: OrdersService) {
    this.commandes = this.service.commandesTriees;
  }

  numeroCourt(id: string): string {
    return '#' + id.slice(-4).toUpperCase();
  }
}
