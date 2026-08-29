import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffreFormComponent } from '../offre-form/offre-form.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Offre, OffreFormPayload } from '../../../core/models/subcription';
import { SubscriptionService } from '../../../core/services/subcription.service';

@Component({
  selector: 'app-offers-management',
  standalone: true,
  imports: [CommonModule, OffreFormComponent, BadgeComponent],
  templateUrl: './offre-management.component.html',
})
export class OffreManagementComponent implements OnInit{
  readonly offres;

  formOuvert = signal(false);
  offreEnEdition = signal<Offre | null>(null);

  constructor(private readonly service: SubscriptionService) {
    this.offres = this.service.offres;
  }
 ngOnInit(): void {
    this.service.chargerOffresAdmin().catch(() => {
      console.error('Impossible de charger les offres.');
    });
  }

  ouvrirCreation(): void {
    this.offreEnEdition.set(null);
    this.formOuvert.set(true);
  }
  ouvrirEdition(o: Offre): void {
    this.offreEnEdition.set(o);
    this.formOuvert.set(true);
  }
  valider(payload: OffreFormPayload): void {
    const enEdition = this.offreEnEdition();
    if (enEdition) this.service.modifierOffre(enEdition.id, payload);
    else this.service.creerOffre(payload);
    this.formOuvert.set(false);
  }
  supprimer(o: Offre): void {
    if (confirm(`Supprimer l'offre "${o.nom}" ? Les restaurants déjà abonnés ne seront pas affectés rétroactivement.`)) {
      this.service.supprimerOffre(o.id);
    }
  }
}