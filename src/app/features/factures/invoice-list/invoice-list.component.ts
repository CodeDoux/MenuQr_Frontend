import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { OrdersService } from '../../../core/services/orders.service';

const TONE_STATUT: Record<string, BadgeTone> = {
  EMISE: 'info', PAYEE: 'success', ANNULEE: 'neutral',
};

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeComponent],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent {
  readonly factures;
  readonly TONE_STATUT = TONE_STATUT;

  constructor(private readonly ordersService: OrdersService) {
    this.factures = this.ordersService.facturesTriees;
  }
}