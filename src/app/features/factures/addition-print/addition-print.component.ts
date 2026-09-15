import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-addition-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addition-print.component.html',
})
export class AdditionPrintComponent implements OnInit {
  addition: any = null;
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
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.addition = await this.ordersService.chargerAddition(id);
    this.chargement = false;
  }

  imprimer(): void {
    window.print();
  }
}