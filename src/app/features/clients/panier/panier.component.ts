import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeCommande } from '../../../core/enums/enums';
import { AdresseLivraisonForm, InfosEmporter } from '../../../core/models/panier';
import { PublicOrderService } from '../../../core/services/public-order.service';
import { CartService } from '../../../core/services/cart.service';
import { lireParamAncetre } from '../../../core/utils/route.utils';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.component.html',
})
export class PanierComponent implements OnInit {
  readonly ModeCommande = ModeCommande;
  readonly items;
  readonly total;
  readonly mode;
  readonly tableId;
  readonly zonesLivraison;

  infos = signal<InfosEmporter>({ nom: '', telephone: '', heureRetrait: null });
  adresse = signal<AdresseLivraisonForm>({ adresseComplete: '', quartier: '', ville: '', indications: '' });
  notes = signal('');
  zoneChoisieId = signal<string | null>(null);

  erreur = signal<string | null>(null);
  envoiEnCours = signal(false);

  restaurantId = '';
  code = '';

  constructor(
    private readonly cart: CartService,
    private readonly publicOrderService: PublicOrderService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.items = this.cart.items;
    this.total = this.cart.total;
    this.mode = this.cart.mode;
    this.tableId = this.cart.tableId;
    this.zonesLivraison = this.cart.zonesLivraison;
  }

  ngOnInit(): void {
    this.restaurantId = lireParamAncetre(this.route, 'restaurantId') ?? '';
    this.code = this.route.snapshot.queryParamMap.get('code') ?? '';
    if (this.cart.estVide()) {
      this.router.navigate(['/m', this.restaurantId], { queryParams: { code: this.code } });
    }
  }

  choisirMode(m: ModeCommande): void {
    this.cart.definirMode(m);
    this.erreur.set(null);
  }

  incrementer(itemId: string): void { this.cart.modifierQuantite(itemId, 1); }
  decrementer(itemId: string): void { this.cart.modifierQuantite(itemId, -1); }
  retirer(itemId: string): void { this.cart.retirer(itemId); }

  majNom(v: string): void { this.infos.set({ ...this.infos(), nom: v }); }
  majTelephone(v: string): void { this.infos.set({ ...this.infos(), telephone: v }); }
  majAdresseComplete(v: string): void { this.adresse.set({ ...this.adresse(), adresseComplete: v }); }
  majQuartier(v: string): void { this.adresse.set({ ...this.adresse(), quartier: v }); }
  majIndications(v: string): void { this.adresse.set({ ...this.adresse(), indications: v }); }

  retourMenu(): void {
    this.router.navigate(['/m', this.restaurantId], { queryParams: { code: this.code } });
  }

  async validerCommande(): Promise<void> {
    const mode = this.mode();
    if (!mode) {
      this.erreur.set('Choisissez un mode de commande.');
      return;
    }
    if (mode === ModeCommande.EMPORTER && !this.tableId() && (!this.infos().nom || !this.infos().telephone)) {
      this.erreur.set('Renseignez votre nom et votre téléphone pour le retrait.');
      return;
    }

    let infosLivraison = null;
    if (mode === ModeCommande.LIVRAISON) {
      if (!this.adresse().adresseComplete || !this.infos().nom || !this.infos().telephone) {
        this.erreur.set('Renseignez votre nom, téléphone et adresse de livraison.');
        return;
      }
      if (!this.zoneChoisieId()) {
        this.erreur.set('Choisissez votre zone de livraison.');
        return;
      }
      infosLivraison = {
        nomClient: this.infos().nom, telephoneClient: this.infos().telephone,
        adresseComplete: this.adresse().adresseComplete, quartier: this.adresse().quartier,
        indications: this.adresse().indications, zoneLivraisonId: this.zoneChoisieId()!,
      };
    }

    this.erreur.set(null);
    this.envoiEnCours.set(true);

    try {
      const commande = await this.publicOrderService.creerCommande(
        this.code, mode,
        this.items().map((i) => ({
          produitId: i.produitId, varianteId: i.varianteId ?? null,
          quantite: i.quantite, notes: i.notes ?? null,
        })),
        this.notes() || null,
        infosLivraison
      );

      this.cart.vider();
      this.router.navigate(['/m', this.restaurantId, 'suivi', commande.id], { queryParams: { code: this.code } });
    } catch {
      this.erreur.set('Une erreur est survenue lors de l\'envoi de la commande.');
    } finally {
      this.envoiEnCours.set(false);
    }
  }

  numeroTable(): string {
  return this.tableId() ? 'table' : '';
}

majHeureRetrait(v: string): void {
  this.infos.set({ ...this.infos(), heureRetrait: v });
}
}