import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutRestaurant } from '../../../core/enums/enums';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { PlatformAdminService } from '../../../core/services/admin.service';
import { RestaurantSummary } from '../../../core/models/admin';
import { AuthService } from '../../../core/services/auth.service';

const LABEL_STATUT: Record<string, string> = {
  ACTIF: 'Actif', SUSPENDU: 'Suspendu', INACTIF: 'Inactif', FERME: 'Fermé',
};
const TONE_STATUT: Record<string, BadgeTone> = {
  ACTIF: 'success', SUSPENDU: 'warning', INACTIF: 'neutral', FERME: 'danger',
};

@Component({
  selector: 'app-restaurants-list',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './restaurants-list.component.html',
  styleUrl: './restaurants-list.component.css',
})
export class RestaurantsListComponent {
  readonly restaurants;
  readonly StatutRestaurant = StatutRestaurant;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly TONE_STATUT = TONE_STATUT;

  impersonationEnCours = signal<string | null>(null);

  constructor(
    private readonly service: PlatformAdminService,
    private readonly auth: AuthService
  ) {
    this.restaurants = this.service.restaurants;
  }

  changerStatut(r: RestaurantSummary, statut: StatutRestaurant): void {
    if (confirm(`Changer le statut de "${r.nom}" en "${LABEL_STATUT[statut]}" ?`)) {
      this.service.changerStatutRestaurant(r.id, statut);
    }
  }

  /** ⚠️ Action sensible et journalisée côté backend — quitte l'interface
   *  Admin pour ouvrir le tableau de bord du restaurant, connecté comme son Propriétaire. */
  async seConnecterEnTantQue(r: RestaurantSummary): Promise<void> {
    if (!confirm(`Te connecter temporairement à la place de "${r.nom}" ? Cette action est enregistrée dans le journal Admin.`)) {
      return;
    }
    this.impersonationEnCours.set(r.id);
    try {
      await this.auth.impersonerRestaurant(r.id);
      window.location.href = '/dashboard';
    } catch {
      alert('Impossible de se connecter à ce restaurant (aucun Propriétaire actif trouvé ?).');
      this.impersonationEnCours.set(null);
    }
  }
}