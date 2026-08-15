import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Tableau de bord</h1>
        <p class="page-subtitle">Bienvenue sur MenuQr. Ce module sera développé à une prochaine étape.</p>
      </div>
    </div>
    <div class="card" style="padding: 1.5rem;">
      <p>Pour l'instant, rendez-vous sur <a routerLink="/menus">Menus</a> ou <a routerLink="/produits">Produits</a>
      pour tester la gestion de la carte du restaurant.</p>
    </div>
  `,
})
export class DashboardComponent {}
