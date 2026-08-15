import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../orders/services/orders.service';
import { ModeCommande } from '../../../core/enums/enums';
import { AdresseLivraisonForm, InfosEmporter } from '../models/public-menu';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.component.html',
})
export class PanierComponent implements OnInit {

   private readonly cart = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly ModeCommande = ModeCommande;
  readonly items = this.cart.items;
  readonly total = this.cart.total;
  readonly mode = this.cart.mode;
  readonly tableId = this.cart.tableId;

  infos = signal<InfosEmporter>({ nom: '', telephone: '', heureRetrait: null });
  adresse = signal<AdresseLivraisonForm>({ adresseComplete: '', quartier: '', ville: '', indications: '' });
  notes = signal('');

  erreur = signal<string | null>(null);
  envoiEnCours = signal(false);

  restaurantId = '';

  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') ?? '';
    if (this.cart.estVide()) {
      this.router.navigate(['/m', this.restaurantId]);
    }
  }

  modifierInfos(champ: keyof InfosEmporter, valeur: string | null): void {
  this.infos.update((infos) => ({
    ...infos,
    [champ]: valeur
  }));
}

  modifierAdresse(champ: keyof AdresseLivraisonForm, valeur: string): void {
  this.adresse.update((adresse) => ({
    ...adresse,
    [champ]: valeur
  }));
}

  numeroTable(): string {
    const id = this.tableId();
    return id ? id.split('-')[1] : '';
  }

  choisirMode(m: ModeCommande): void {
    this.cart.definirMode(m);
    this.erreur.set(null);
  }

  incrementer(itemId: string): void {
    this.cart.modifierQuantite(itemId, 1);
  }
  decrementer(itemId: string): void {
    this.cart.modifierQuantite(itemId, -1);
  }
  retirer(itemId: string): void {
    this.cart.retirer(itemId);
  }

  retourMenu(): void {
    this.router.navigate(['/m', this.restaurantId]);
  }

  validerCommande(): void {
    const mode = this.mode();
    if (!mode) {
      this.erreur.set('Choisissez un mode de commande.');
      return;
    }
    if (mode === ModeCommande.EMPORTER && !this.tableId()) {
      if (!this.infos().nom || !this.infos().telephone) {
        this.erreur.set('Renseignez votre nom et votre téléphone pour le retrait.');
        return;
      }
    }
    if (mode === ModeCommande.LIVRAISON) {
      if (!this.adresse().adresseComplete) {
        this.erreur.set('Renseignez votre adresse de livraison.');
        return;
      }
    }

    this.erreur.set(null);
    this.envoiEnCours.set(true);

    const fraisLivraison = mode === ModeCommande.LIVRAISON ? 1000 : 0; // ⚠️ frais fixe simplifié — ZoneLivraison non encore branché

    const commande = this.ordersService.creerCommandeClient({
      tableId: this.tableId(),
      mode,
      items: this.items().map((i) => ({
        produitId: i.produitId, produitNom: i.produitNom,
        prixUnitaire: i.prixUnitaire, quantite: i.quantite,
      })),
      fraisLivraison,
      notes: this.notes() || null,
    });

    this.cart.vider();
    this.envoiEnCours.set(false);
    this.router.navigate(['/m', this.restaurantId, 'suivi', commande.id]);
  }
}