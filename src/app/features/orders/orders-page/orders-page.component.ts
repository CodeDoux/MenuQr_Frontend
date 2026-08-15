import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VueGlobaleComponent } from '../vue-globale/vue-globale.component';
import { VueCuisineComponent } from '../vue-cuisine/vue-cuisine.component';
import { VueServiceComponent } from '../vue-service/vue-service.component';
import { VueCaisseComponent } from '../vue-caisse/vue-caisse.component';


type Onglet = 'globale' | 'cuisine' | 'service' | 'caisse';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, VueGlobaleComponent, VueCuisineComponent, VueServiceComponent, VueCaisseComponent],
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
  onglet = signal<Onglet>('globale');

  readonly onglets: { id: Onglet; label: string }[] = [
    { id: 'globale', label: 'Vue globale' },
    { id: 'cuisine', label: 'Cuisine' },
    { id: 'service', label: 'Service' },
    { id: 'caisse', label: 'Caisse' },
  ];
}
