import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutAbonnement } from '../../../core/enums/enums';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { PlatformAdminService } from '../../../core/services/admin.service';

const LABEL_STATUT: Record<StatutAbonnement, string> = {
  ESSAI: 'Essai', ACTIF: 'Actif', EXPIRE: 'Expiré', SUSPENDU: 'Suspendu', ANNULE: 'Annulé',
};
const TONE_STATUT: Record<StatutAbonnement, BadgeTone> = {
  ESSAI: 'info', ACTIF: 'success', EXPIRE: 'danger', SUSPENDU: 'warning', ANNULE: 'neutral',
};

@Component({
  selector: 'app-subscriptions-overview',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './subscription-overview.component.html',
})
export class SubscriptionOverviewComponent {
  readonly restaurants;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly TONE_STATUT = TONE_STATUT;

  constructor(private readonly service: PlatformAdminService) {
    this.restaurants = this.service.restaurants;
  }
}