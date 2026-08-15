import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MethodePaiement, ModeCommande, StatutCommande } from '../../../core/enums/enums';
import { LIBELLE_METHODE, SettingsService } from '../../settings/services/settings.service';
import { OrdersService } from '../../orders/services/orders.service';

const LABEL_STATUT: Record<StatutCommande, string> = {
  EN_ATTENTE: 'En attente de confirmation', CONFIRMEE: 'Confirmée', EN_PREPARATION: 'En préparation',
  PRETE: 'Prête', SERVIE: 'Servie', REMISE: 'Remise', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};

const ETAPES = [StatutCommande.EN_ATTENTE, StatutCommande.CONFIRMEE, StatutCommande.EN_PREPARATION, StatutCommande.PRETE];

@Component({
  selector: 'app-suivi-commande',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suivi-commande.component.html',
})
export class SuiviCommandeComponent implements OnInit {
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly ETAPES = ETAPES;
  readonly LIBELLE_METHODE = LIBELLE_METHODE;

  commandeId = '';
  restaurantId = '';
  commande;
  autresCommandesVisite;
  moyensPaiementEnLigne;
  paiementConfirme = false;

  constructor(
    private readonly ordersService: OrdersService,
    private readonly settingsService: SettingsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.commande = this.ordersService.commandeParId('');
    this.autresCommandesVisite = this.ordersService.commandesDeLaVisite('');
    this.moyensPaiementEnLigne = () =>
      this.settingsService.moyensPaiement().filter((m) => m.estActif && m.methode !== MethodePaiement.ESPECES);
  }

  ngOnInit(): void {
    this.commandeId = this.route.snapshot.paramMap.get('commandeId') ?? '';
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') ?? '';
    this.commande = this.ordersService.commandeParId(this.commandeId);

    const c = this.commande();
    if (c?.visiteId) {
      this.autresCommandesVisite = this.ordersService.commandesDeLaVisite(c.visiteId);
    }
  }

  indexEtape(statut: StatutCommande): number {
    return ETAPES.indexOf(statut);
  }

  estAnnulee(statut: StatutCommande): boolean {
    return statut === StatutCommande.ANNULEE;
  }

  peutPayerEnLigne(): boolean {
    const c = this.commande();
    return !!c && !c.visiteId && c.mode !== ModeCommande.SUR_PLACE && !this.paiementConfirme;
  }

  payerEnLigne(methode: string): void {
    const c = this.commande();
    if (!c) return;
    this.ordersService.encaisserCommandeDirecte(c.id, methode);
    this.paiementConfirme = true;
  }

  actualiser(): void {
    // Rafraîchissement manuel (décision V1 : pas de temps réel) — force la re-lecture du signal
    this.commande = this.ordersService.commandeParId(this.commandeId);
  }

  retourMenu(): void {
    this.router.navigate(['/m', this.restaurantId]);
  }
}