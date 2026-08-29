import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutAbonnement, StatutFactureAbonnement } from '../../../core/enums/enums';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { SubscriptionService } from '../../../core/services/subcription.service';
import { Offre } from '../../../core/models/subcription';

const LABEL_STATUT_ABO: Record<StatutAbonnement, string> = {
  ESSAI: 'Période d\'essai', ACTIF: 'Actif', EXPIRE: 'Expiré', SUSPENDU: 'Suspendu', ANNULE: 'Annulé',
};
const TONE_STATUT_ABO: Record<StatutAbonnement, BadgeTone> = {
  ESSAI: 'info', ACTIF: 'success', EXPIRE: 'danger', SUSPENDU: 'warning', ANNULE: 'neutral',
};
const LABEL_STATUT_FACTURE: Record<StatutFactureAbonnement, string> = {
  EN_ATTENTE: 'En attente', PAYEE: 'Payée', EN_RETARD: 'En retard', ANNULEE: 'Annulée',
};
const TONE_STATUT_FACTURE: Record<StatutFactureAbonnement, BadgeTone> = {
  EN_ATTENTE: 'warning', PAYEE: 'success', EN_RETARD: 'danger', ANNULEE: 'neutral',
};

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './abonnement.component.html',
})
export class AbonnementComponent {
  readonly offres;
  readonly abonnement;
  readonly offreActuelle;
  readonly joursRestantsEssai;
  readonly factures;
  readonly LABEL_STATUT_ABO = LABEL_STATUT_ABO;
  readonly TONE_STATUT_ABO = TONE_STATUT_ABO;
  readonly LABEL_STATUT_FACTURE = LABEL_STATUT_FACTURE;
  readonly TONE_STATUT_FACTURE = TONE_STATUT_FACTURE;

  constructor(private readonly service: SubscriptionService) {
    this.offres = this.service.offres;
    this.abonnement = this.service.abonnement;
    this.offreActuelle = this.service.offreActuelle;
    this.joursRestantsEssai = this.service.joursRestantsEssai;
    this.factures = this.service.factures;
  }

  estOffreActuelle(offre: Offre): boolean {
    return this.abonnement().offreId === offre.id;
  }

  choisirOffre(offre: Offre): void {
    if (this.estOffreActuelle(offre)) return;
    if (confirm(`Passer au plan "${offre.nom}" pour ${offre.prixMensuel} FCFA/mois ?`)) {
      this.service.changerOffre(offre.id);
    }
  }
}