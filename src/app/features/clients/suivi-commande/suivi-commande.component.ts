import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StatutCommande } from '../../../core/enums/enums';
import { PublicOrderService } from '../../../core/services/public-order.service';
import { lireParamAncetre } from '../../../core/utils/route.utils';

const LABEL_STATUT: Record<string, string> = {
  EN_ATTENTE: 'En attente de confirmation', CONFIRMEE: 'Confirmée', EN_PREPARATION: 'En préparation',
  PRETE: 'Prête', SERVIE: 'Servie', REMISE: 'Remise', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};
const ETAPES = [StatutCommande.EN_ATTENTE, StatutCommande.CONFIRMEE, StatutCommande.EN_PREPARATION, StatutCommande.PRETE];

// ⚠️ Simplification temporaire : liste fixe des méthodes de paiement en ligne
// proposées au client. Idéalement, ça devrait venir des MoyenPaiement actifs
// du restaurant (endpoint public dédié à créer plus tard) plutôt que d'être
// figé ici — à revoir quand ce module sera branché.
const METHODES_PAIEMENT_EN_LIGNE = [
  { code: 'WAVE', libelle: 'Wave' },
  { code: 'ORANGE_MONEY', libelle: 'Orange Money' },
  { code: 'CARTE', libelle: 'Carte bancaire' },
];

@Component({
  selector: 'app-suivi-commande',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suivi-commande.component.html',
})
export class SuiviCommandeComponent implements OnInit {
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly ETAPES = ETAPES;
  readonly methodesPaiementEnLigne = METHODES_PAIEMENT_EN_LIGNE;
  additionTotal = signal<number | null>(null);
  additionSousTotal = signal<number | null>(null);
additionRemise = signal<number | null>(null);

  commandeId = '';
  restaurantId = '';
  code = '';
  commande = signal<any | null>(null);
  autresCommandesVisite = signal<any[]>([]);
  paiementConfirme = signal(false);
  chargement = signal(true);

  constructor(
    private readonly publicOrderService: PublicOrderService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.commandeId = this.route.snapshot.paramMap.get('commandeId') ?? '';
    this.restaurantId = lireParamAncetre(this.route, 'restaurantId') ?? '';
    this.code = this.route.snapshot.queryParamMap.get('code') ?? '';
    await this.actualiser();
  }

  async actualiser(): Promise<void> {
    this.chargement.set(true);
    try {
      const c = await this.publicOrderService.chargerCommande(this.commandeId);
      this.commande.set(c);
      if (c.visite_id) {
      const { commandes, additionSousTotal, additionRemise, additionTotal } =
      await this.publicOrderService.chargerCommandesDeLaVisite(this.commandeId);
      this.autresCommandesVisite.set(commandes);
      this.additionSousTotal.set(additionSousTotal);
      this.additionRemise.set(additionRemise);
      this.additionTotal.set(additionTotal);
    }
    } finally {
      this.chargement.set(false);
    }
  }

  aUneCommande(): boolean {
  return this.commande() !== null;
}

  indexEtape(statut: string): number {
    return ETAPES.indexOf(statut as StatutCommande);
  }

  estAnnulee(statut: string): boolean {
    return statut === 'ANNULEE';
  }

  montantAPayer(): number {
  const c = this.commande();
  if (!c) return 0;
  if (c.visite_id && this.additionTotal() !== null) {
    return this.additionTotal()!;
  }
  return Number(c.total);
}

/** Réduction réellement appliquée — celle de l'addition si sur place,
 *  sinon celle de la commande elle-même (Emporter/Livraison). */
remiseAffichee(): number {
  const c = this.commande();
  if (!c) return 0;
  if (c.visite_id && this.additionRemise() !== null) {
    return this.additionRemise()!;
  }
  return Number(c.remise ?? 0);
}

sousTotalAvantRemise(): number {
  const c = this.commande();
  if (!c) return 0;
  if (c.visite_id && this.additionSousTotal() !== null) {
    return this.additionSousTotal()!;
  }
  return Number(c.sous_total ?? c.total);
}

  peutPayer(): boolean {
    const c = this.commande();
    return !!c && !this.paiementConfirme() && c.statut !== 'ANNULEE';
  }

  async payerEnLigne(methode: string): Promise<void> {
    const c = this.commande();
    if (!c) return;
    await this.publicOrderService.payer(c.id, methode);
    this.paiementConfirme.set(true);
  }

  retourMenu(): void {
    this.router.navigate(['/m', this.restaurantId], { queryParams: { code: this.code } });
  }
}