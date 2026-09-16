import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StatutAbonnement, StatutFactureAbonnement } from '../../../core/enums/enums';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { SubscriptionService } from '../../../core/services/subcription.service';
import { Offre } from '../../../core/models/subcription';

const LABEL_STATUT_ABO: Record<string, string> = {
  ESSAI: 'Période d\'essai', ACTIF: 'Actif', EXPIRE: 'Expiré', SUSPENDU: 'Suspendu', ANNULE: 'Annulé',
};
const TONE_STATUT_ABO: Record<string, BadgeTone> = {
  ESSAI: 'info', ACTIF: 'success', EXPIRE: 'danger', SUSPENDU: 'warning', ANNULE: 'neutral',
};
const LABEL_STATUT_FACTURE: Record<string, string> = {
  EN_ATTENTE: 'En attente', PAYEE: 'Payée', EN_RETARD: 'En retard', ANNULEE: 'Annulée',
};
const TONE_STATUT_FACTURE: Record<string, BadgeTone> = {
  EN_ATTENTE: 'warning', PAYEE: 'success', EN_RETARD: 'danger', ANNULEE: 'neutral',
};

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './abonnement.component.html',
  styleUrl: './abonnement.component.css',
})
export class AbonnementComponent implements OnInit {
  readonly offres;
  readonly abonnement;
  readonly offreActuelle;
  readonly joursRestantsEssai;
  readonly factures;
  readonly LABEL_STATUT_ABO = LABEL_STATUT_ABO;
  readonly TONE_STATUT_ABO = TONE_STATUT_ABO;
  readonly LABEL_STATUT_FACTURE = LABEL_STATUT_FACTURE;
  readonly TONE_STATUT_FACTURE = TONE_STATUT_FACTURE;

  enPaiement = signal(false);
  verificationRetour = signal(false);

  constructor(
    private readonly service: SubscriptionService,
    private readonly route: ActivatedRoute
  ) {
    this.offres = this.service.offres;
    this.abonnement = this.service.abonnement;
    this.offreActuelle = this.service.offreActuelle;
    this.joursRestantsEssai = this.service.joursRestantsEssai;
    this.factures = this.service.factures;
  }

  estOffreActuelle(offre: Offre): boolean {
    return this.abonnement()?.offre?.id === offre.id;
  }

  choisirOffre(offre: Offre): void {
    if (this.estOffreActuelle(offre)) return;
    if (confirm(`Passer au plan "${offre.nom}" pour ${offre.prixMensuel} FCFA/mois ?`)) {
      this.service.changerOffre(offre.id);
    }
  }

  async payer(): Promise<void> {
    this.enPaiement.set(true);
    try {
      const url = await this.service.payerAbonnement();
      window.location.href = url;
    } catch {
      alert('Une erreur est survenue lors de la préparation du paiement.');
      this.enPaiement.set(false);
    }
  }

  ngOnInit(): void {
    this.service.chargerAbonnement().catch(() => {});
    this.service.chargerFactures().catch(() => {});

    // Retour depuis PayDunya : le webhook peut mettre quelques secondes à
    // confirmer le paiement — on revérifie plusieurs fois avant d'abandonner.
    if (this.route.snapshot.queryParamMap.get('paiement') === 'retour') {
      this.verificationRetour.set(true);
      this.rafraichirPeriodiquement();
    }
  }

  private async rafraichirPeriodiquement(tentative: number = 0): Promise<void> {
    if (tentative >= 6) {
      this.verificationRetour.set(false);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await Promise.all([
      this.service.chargerAbonnement().catch(() => {}),
      this.service.chargerFactures().catch(() => {}),
    ]);

    const derniereFacture = this.factures()[0];
    if (derniereFacture?.statut === 'PAYEE') {
      this.verificationRetour.set(false);
      return;
    }
    this.rafraichirPeriodiquement(tentative + 1);
  }
}