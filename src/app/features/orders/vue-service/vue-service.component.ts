import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../../core/services/orders.service';
import { Commande } from '../../../core/models/orders';

@Component({
  selector: 'app-vue-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vue-service.component.html',
  styleUrl: './vue-service.component.css',
})
export class VueServiceComponent {
  readonly commandesAServir;

  constructor(private readonly service: OrdersService) {
    this.commandesAServir = this.service.commandesAServir;
  }

  numeroCourt(id: string): string {
    return '#' + id.slice(-4).toUpperCase();
  }

  numeroTable(c: Commande): string {
    return c.tableNumero ?? '—';
  }

  servir(c: Commande): void {
    this.service.terminerCommande(c.id).catch(() => alert('Une erreur est survenue.'));
  }
}