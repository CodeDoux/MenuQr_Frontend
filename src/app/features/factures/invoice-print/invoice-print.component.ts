import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-invoice-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-print.component.html',
})
export class InvoicePrintComponent implements OnInit {
  facture: any = null;
  restaurantInfos;
  chargement = true;

  constructor(
    private readonly ordersService: OrdersService,
    private readonly settingsService: SettingsService,
    private readonly route: ActivatedRoute
  ) {
    this.restaurantInfos = this.settingsService.restaurantInfos;
  }

  async ngOnInit(): Promise<void> {
    const factureId = this.route.snapshot.paramMap.get('id') ?? '';
    this.facture = await this.ordersService.chargerFacture(factureId);
    this.chargement = false;
  }

  /** ⚠️ Simplification : le backend ne renvoie pas encore le numéro de table
   *  pour une facture déjà réglée (les additions payées sortent de la liste
   *  des additions "ouvertes"). À affiner si besoin d'un vrai libellé précis. */
  clientLabel(): string {
    return this.facture?.commande_id ? 'Client' : 'Table (addition)';
  }

  imprimer(): void {
    window.print();
  }
}