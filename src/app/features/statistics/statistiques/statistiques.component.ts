import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../../core/services/statistics.service';

const LABEL_METHODE: Record<string, string> = {
  ESPECES: 'Espèces', WAVE: 'Wave', ORANGE_MONEY: 'Orange Money', CARTE: 'Carte', AUTRE: 'Autre',
};
const ICONE_METHODE: Record<string, string> = {
  ESPECES: '💵', WAVE: '🟦', ORANGE_MONEY: '🟧', CARTE: '💳', AUTRE: '➕',
};

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.component.html',
  styleUrl: './statistiques.component.css',
})
export class StatistiquesComponent {
  readonly data;
  readonly chargement;
  readonly periode;
  readonly Object = Object;
  readonly LABEL_METHODE = LABEL_METHODE;
  readonly ICONE_METHODE = ICONE_METHODE;

  constructor(private readonly service: StatisticsService) {
    this.data = this.service.data;
    this.chargement = this.service.chargement;
    this.periode = this.service.periode;
  }

  changerPeriode(jours: number): void {
    this.service.definirPeriode(jours);
  }

  formatMontant(valeur: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(valeur));
  }

  maxCa(): number {
    return Math.max(...(this.data()?.evolutionCa.map((e) => e.montant) ?? [0]), 1);
  }

  hauteurBarreCa(montant: number): number {
    return Math.max(4, Math.round((montant / this.maxCa()) * 100));
  }

  totalPaiements(): number {
    const rep = this.data()?.repartitionPaiement;
    if (!rep) return 0;
    return Object.values(rep).reduce((acc, v) => acc + v, 0);
  }

  pourcentagePaiement(montant: number): number {
    const total = this.totalPaiements();
    return total === 0 ? 0 : Math.round((montant / total) * 100);
  }

  maxCategorie(): number {
    return Math.max(...(this.data()?.topCategories.map((c) => c.quantite) ?? [0]), 1);
  }

  progressionCategorie(quantite: number): number {
    return Math.round((quantite / this.maxCategorie()) * 100);
  }

  maxHeure(): number {
    return Math.max(...(this.data()?.heuresPointe.map((h) => h.nbCommandes) ?? [0]), 1);
  }

  hauteurBarreHeure(nb: number): number {
    return Math.max(3, Math.round((nb / this.maxHeure()) * 100));
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  medaille(rang: number): string {
    return rang === 0 ? '🥇' : rang === 1 ? '🥈' : rang === 2 ? '🥉' : `${rang + 1}`;
  }
}