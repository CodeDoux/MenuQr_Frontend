import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { JournalAdminService } from '../../../core/services/journal-admin.service';

const LABEL_ACTION: Record<string, string> = {
  changement_statut_restaurant: 'Statut restaurant modifié',
  creation_offre: 'Offre créée',
  modification_offre: 'Offre modifiée',
  suppression_offre: 'Offre supprimée',
  creation_admin: 'Admin créé',
  toggle_actif_admin: 'Statut admin modifié',
  suppression_admin: 'Admin supprimé',
  impersonation: 'Connexion en tant que restaurant',
};
const TONE_ACTION: Record<string, BadgeTone> = {
  changement_statut_restaurant: 'warning',
  creation_offre: 'success', modification_offre: 'info', suppression_offre: 'danger',
  creation_admin: 'success', toggle_actif_admin: 'warning', suppression_admin: 'danger',
  impersonation: 'danger',
};

@Component({
  selector: 'app-journal-admin',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './journal-admin.component.html',
  styleUrl: './journal-admin.component.css',
})
export class JournalAdminComponent {
  readonly entries;
  readonly meta;
  readonly LABEL_ACTION = LABEL_ACTION;
  readonly TONE_ACTION = TONE_ACTION;

  constructor(private readonly service: JournalAdminService) {
    this.entries = this.service.entries;
    this.meta = this.service.meta;
  }

  labelAction(code: string): string {
    return this.LABEL_ACTION[code] ?? code;
  }

  toneAction(code: string): BadgeTone {
    return this.TONE_ACTION[code] ?? 'neutral';
  }

  allerPage(page: number): void {
    const m = this.meta();
    if (page < 1 || page > m.lastPage || page === m.currentPage) return;
    this.service.chargerPage(page, m.perPage).catch(() => {});
  }

  formatValeur(valeur: string | null): string {
    if (!valeur) return '';
    try {
      const obj = JSON.parse(valeur);
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
    } catch {
      return valeur;
    }
  }
}