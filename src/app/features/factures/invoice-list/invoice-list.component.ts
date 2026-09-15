import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { OrdersService } from '../../../core/services/orders.service';

const LABEL_STATUT: Record<string, string> = {
  EMISE: 'Émise', PAYEE: 'Payée', ANNULEE: 'Annulée',
};
const TONE_STATUT: Record<string, BadgeTone> = {
  EMISE: 'info', PAYEE: 'success', ANNULEE: 'neutral',
};

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeComponent],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css',
})
export class InvoiceListComponent {
  readonly factures;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly TONE_STATUT = TONE_STATUT;

  constructor(private readonly ordersService: OrdersService) {
    this.factures = this.ordersService.facturesTriees;
  }
}