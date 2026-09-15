import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { OrdersService } from '../../../core/services/orders.service';
import { Paiement } from '../../../core/models/orders';

const LABEL_STATUT: Record<string, string> = {
  EN_ATTENTE: 'En attente', CONFIRME: 'Confirmé', ECHOUE: 'Échoué', REMBOURSE: 'Remboursé', ANNULE: 'Annulé',
};
const TONE_STATUT: Record<string, BadgeTone> = {
  EN_ATTENTE: 'warning', CONFIRME: 'success', ECHOUE: 'danger', REMBOURSE: 'neutral', ANNULE: 'neutral',
};
const ICONE_METHODE: Record<string, string> = {
  ESPECES: '💵', WAVE: '🟦', ORANGE_MONEY: '🟧', CARTE: '💳', AUTRE: '➕',
};

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './payments-page.component.html',
  styleUrl: './payments-page.component.css',
})
export class PaymentsPageComponent {
  readonly paiements;
  readonly additions;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly TONE_STATUT = TONE_STATUT;
  readonly ICONE_METHODE = ICONE_METHODE;

  constructor(private readonly ordersService: OrdersService) {
    this.paiements = this.ordersService.paiementsTries;
    this.additions = this.ordersService.additions;
  }

  contexte(p: Paiement): string {
    if (p.commandeId) return `Commande #${p.commandeId.slice(-4).toUpperCase()}`;
    if (p.additionId) {
      const addition = this.additions().find((a) => a.id === p.additionId);
      return addition?.tableNumero ? `Table ${addition.tableNumero}` : 'Addition';
    }
    return '—';
  }

  /** Purement affichage — somme des paiements confirmés déjà présents dans la liste. */
  totalEncaisse(): number {
    return this.paiements()
      .filter((p) => p.statut === 'CONFIRME')
      .reduce((acc, p) => acc + p.montant, 0);
  }

  peutRembourser(p: Paiement): boolean {
    return p.statut === 'CONFIRME';
  }

  rembourser(p: Paiement): void {
    if (confirm(`Rembourser ce paiement de ${p.montant} FCFA ?`)) {
      this.ordersService.rembourserPaiement(p.id).catch(() => alert('Une erreur est survenue.'));
    }
  }
}