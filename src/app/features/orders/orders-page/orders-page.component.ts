import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VueGlobaleComponent } from '../vue-globale/vue-globale.component';
import { VueCuisineComponent } from '../vue-cuisine/vue-cuisine.component';
import { VueServiceComponent } from '../vue-service/vue-service.component';
import { VueCaisseComponent } from '../vue-caisse/vue-caisse.component';
import { AuthService } from '../../../core/services/auth.service';

type Onglet = 'globale' | 'cuisine' | 'service' | 'caisse';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, VueGlobaleComponent, VueCuisineComponent, VueServiceComponent, VueCaisseComponent],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css',
})
export class OrdersPageComponent {
  onglet = signal<Onglet>('globale');

  readonly ongletsDisponibles: { id: Onglet; label: string }[];

  readonly ICONE_ONGLET: Record<string, string> = {
  globale: '📋', cuisine: '👨‍🍳', service: '🛎️', caisse: '💰',
};

  constructor(private readonly auth: AuthService) {
    const tousLesOnglets: { id: Onglet; label: string; permission: string }[] = [
      { id: 'globale', label: 'Vue globale', permission: 'commande.voir' },
      { id: 'cuisine', label: 'Cuisine', permission: 'commande.gerer_statut' },
      { id: 'service', label: 'Service', permission: 'commande.gerer_statut' },
      { id: 'caisse', label: 'Caisse', permission: 'paiement.effectuer' },
    ];

    this.ongletsDisponibles = tousLesOnglets.filter((o) => this.auth.hasPermission(o.permission));

    // Si l'onglet actif par défaut n'est pas autorisé pour ce rôle, bascule
    // automatiquement sur le premier onglet accessible (évite un écran vide).
    if (!this.ongletsDisponibles.some((o) => o.id === this.onglet())) {
      this.onglet.set(this.ongletsDisponibles[0]?.id ?? 'globale');
    }
  }
}