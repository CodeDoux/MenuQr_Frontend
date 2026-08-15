import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../../core/services/orders.service';
import { Commande } from '../../../core/models/commande';

@Component({
  selector: 'app-vue-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vue-service.component.html',
})
export class VueServiceComponent {
  readonly commandesAServir;

  constructor(private readonly service: OrdersService) {
    this.commandesAServir = this.service.commandesAServir;
  }

  numeroCourt(id: string): string {
    return '#' + id.slice(-4).toUpperCase();
  }

  numeroTable(tableId: string | null | undefined): string {
    return tableId ? tableId.split('-')[1] : '—';
  }

  servir(c: Commande): void {
    this.service.terminerCommande(c.id);
  }
}
