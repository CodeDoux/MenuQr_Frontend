import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalService } from '../../../core/services/journal-activite.service';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';

const LABEL_ACTION: Record<string, string> = {
  changement_statut_commande: 'Statut commande modifié',
  paiement: 'Paiement encaissé',
  remboursement: 'Remboursement',
  creation_employe: 'Employé créé',
  fin_contrat_employe: 'Fin de contrat',
};
const ICONE_ACTION: Record<string, string> = {
  changement_statut_commande: '🧾',
  paiement: '💰',
  remboursement: '↩️',
  creation_employe: '👤',
  fin_contrat_employe: '🚪',
};
const TONE_ACTION: Record<string, BadgeTone> = {
  changement_statut_commande: 'info',
  paiement: 'success',
  remboursement: 'danger',
  creation_employe: 'info',
  fin_contrat_employe: 'neutral',
};

const ICONE_CIBLE: Partial<Record<string, string>> = {
  commandes: '🧾', paiements: '💰', employes: '👤',
};

@Component({
  selector: 'app-journal-page',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './journal-page.component.html',
  styleUrl: './journal-page.component.css',
})
export class JournalPageComponent {
  readonly entries;
  readonly meta;
  readonly LABEL_ACTION = LABEL_ACTION;
  readonly ICONE_ACTION = ICONE_ACTION;
  readonly TONE_ACTION = TONE_ACTION;
  readonly ICONE_CIBLE = ICONE_CIBLE;

  constructor(private readonly service: JournalService) {
    this.entries = this.service.entriesTriees;
    this.meta = this.service.meta;
  }

  allerPage(page: number): void {
    const m = this.meta();
    if (page < 1 || page > m.lastPage || page === m.currentPage) return;
    this.service.chargerPage(page, m.perPage).catch(() => {});
  }

  labelAction(code: string): string {
    return this.LABEL_ACTION[code] ?? code;
  }

  toneAction(code: string): BadgeTone {
    return this.TONE_ACTION[code] ?? 'neutral';
  }

  formatValeur(valeur: any): string {
    if (valeur === null || valeur === undefined || valeur === '') return '';
    if (typeof valeur === 'object') {
      return Object.entries(valeur).map(([cle, val]) => `${cle}: ${val}`).join(', ');
    }
    return String(valeur);
  }

  aDetail(e: any): boolean {
    return !!(e.ancienneValeur || e.nouvelleValeur);
  }
}