import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutRestaurant } from '../../../core/enums/enums';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { PlatformAdminService } from '../../../core/services/admin.service';
import { RestaurantSummary } from '../../../core/models/admin';

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

  constructor(private readonly service: PlatformAdminService) {
    this.restaurants = this.service.restaurants;
  }

  changerStatut(r: RestaurantSummary, statut: StatutRestaurant): void {
    if (confirm(`Changer le statut de "${r.nom}" en "${LABEL_STATUT[statut]}" ?`)) {
      this.service.changerStatutRestaurant(r.id, statut);
    }
  }
}