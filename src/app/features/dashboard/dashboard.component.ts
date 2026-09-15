import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

const ICONE_MODE: Record<string, string> = {
  SUR_PLACE: '🍽️',
  EMPORTER: '🥡',
  LIVRAISON: '🛵',
};

const LABEL_MODE: Record<string, string> = {
  SUR_PLACE: 'Sur place',
  EMPORTER: 'À emporter',
  LIVRAISON: 'Livraison',
};

// Réutilise uniquement les tokens de couleur déjà définis dans le design system
const COULEUR_MODE: Record<string, string> = {
  SUR_PLACE: 'var(--color-ink)',
  EMPORTER: 'var(--color-warning)',
  LIVRAISON: 'var(--color-accent)',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly stats;
  readonly chargement;
  readonly currentUser;
  readonly Object = Object;
  readonly ICONE_MODE = ICONE_MODE;
  readonly LABEL_MODE = LABEL_MODE;
  readonly COULEUR_MODE = COULEUR_MODE;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly auth: AuthService
  ) {
    this.stats = this.dashboardService.stats;
    this.chargement = this.dashboardService.chargement;
    this.currentUser = this.auth.currentUser;
  }

  actualiser(): void {
    this.dashboardService.charger();
  }

  dateAujourdhui(): string {
    return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  initiales(): string {
    const nom = this.currentUser()?.restaurantNom ?? '';
    return nom.charAt(0).toUpperCase() || 'M';
  }

  formatMontant(valeur: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(valeur));
  }

  totalCommandesSemaine(): number {
    const repartition = this.stats()?.repartitionMode;
    if (!repartition) return 0;
    return repartition['SUR_PLACE'] + repartition['EMPORTER'] + repartition['LIVRAISON'];
  }

  pourcentage(valeur: number): number {
    const total = this.totalCommandesSemaine();
    return total === 0 ? 0 : Math.round((valeur / total) * 100);
  }

  /** Dégradé conique pur CSS pour l'anneau de progression — pas de librairie de graphiques. */
  anneauStyle(mode: string): Record<string, string> {
    const pct = this.pourcentage(this.stats()?.repartitionMode[mode] ?? 0);
    const couleur = this.COULEUR_MODE[mode];
    return {
      background: `conic-gradient(${couleur} ${pct}%, var(--color-border) ${pct}% 100%)`,
    };
  }

  medaille(rang: number): string {
    return rang === 0 ? '🥇' : rang === 1 ? '🥈' : rang === 2 ? '🥉' : `${rang + 1}`;
  }

  progressionProduit(quantite: number): number {
    const top = this.stats()?.topProduits ?? [];
    const max = Math.max(...top.map((p) => p.quantite), 1);
    return Math.round((quantite / max) * 100);
  }
}