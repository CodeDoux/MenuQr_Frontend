import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { PublicOrderService } from '../../../core/services/public-order.service';
import { lireParamAncetre } from '../../../core/utils/route.utils';

const LABEL_JOUR: Record<string, string> = {
  LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi', JEUDI: 'Jeudi',
  VENDREDI: 'Vendredi', SAMEDI: 'Samedi', DIMANCHE: 'Dimanche',
};

const LABEL_METHODE: Record<string, string> = {
  ESPECES: 'Espèces', WAVE: 'Wave', ORANGE_MONEY: 'Orange Money', CARTE: 'Carte', AUTRE: 'Autre',
};

const ICONE_METHODE: Record<string, string> = {
  ESPECES: '💵', WAVE: '🟦', ORANGE_MONEY: '🟧', CARTE: '💳', AUTRE: '➕',
};

interface PromoProduit {
  typeReduction: string;
  valeur: number;
}

@Component({
  selector: 'app-menu-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-client.component.html',
})
export class MenuClientComponent implements OnInit {
  readonly Math = Math;
  readonly LABEL_JOUR = LABEL_JOUR;
  readonly LABEL_METHODE = LABEL_METHODE;
  readonly ICONE_METHODE = ICONE_METHODE;

  restaurantNom = '';
  restaurantAdresse: string | null = null;
  restaurantTelephone: string | null = null;
  restaurantDescription: string | null = null;
  horaires: { jour: string; ouverture: string | null; fermeture: string | null; ferme: boolean }[] = [];
  moyensPaiement: string[] = [];

  promotionsProduits: Record<string, PromoProduit> = {};
  promotionGlobale: { nom: string; typeReduction: string; valeur: number } | null = null;

  salleNom: string | null = null;
  tableNumero: string | null = null;

  menus = signal<any[]>([]);
  produits = signal<any[]>([]);
  categorieActive = signal<string | null>(null);
  recherche = signal('');

  produitOuvert = signal<any | null>(null);
  varianteChoisie = signal<any | null>(null);
  quantiteChoisie = signal(1);
  noteChoisie = signal('');

  infosOuvertes = signal(false);

  chargementInitial = signal(true);

  readonly nombreArticles;
  readonly total;
  readonly dernierCommandeId;

  restaurantId = '';
  code = '';

  constructor(
    private readonly cart: CartService,
    private readonly publicOrderService: PublicOrderService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.nombreArticles = this.cart.nombreArticles;
    this.total = this.cart.total;
    this.dernierCommandeId = this.cart.dernierCommandeId;
  }

  async ngOnInit(): Promise<void> {
    this.restaurantId = lireParamAncetre(this.route, 'restaurantId') ?? '';
    this.code = this.route.snapshot.queryParamMap.get('code') ?? '';

    if (!this.code) {
      this.router.navigate(['/m', this.restaurantId, 'invalide']);
      return;
    }

    try {
      const donnees = await this.publicOrderService.chargerMenu(this.code);
      this.restaurantNom = donnees.restaurantNom;
      this.restaurantAdresse = donnees.restaurantAdresse;
      this.restaurantTelephone = donnees.restaurantTelephone;
      this.restaurantDescription = donnees.restaurantDescription;
      this.horaires = donnees.horaires;
      this.moyensPaiement = donnees.moyensPaiement;
      this.promotionsProduits = donnees.promotionsProduits ?? {};
      this.promotionGlobale = donnees.promotionGlobale ?? null;
      this.salleNom = donnees.salleNom;
      this.tableNumero = donnees.tableNumero;
      this.menus.set(donnees.menus);
      this.produits.set(donnees.produits);
      this.cart.initialiserContexte(donnees.tableId, null);
      this.cart.definirZonesLivraison(donnees.zonesLivraison);
      this.cart.definirPromotions(this.promotionsProduits, this.promotionGlobale);
      this.categorieActive.set(donnees.menus[0]?.categories?.[0]?.id ?? null);
    } catch {
      this.router.navigate(['/m', this.restaurantId, 'invalide']);
      return;
    } finally {
      this.chargementInitial.set(false);
    }
  }

  initiale(): string {
    return this.restaurantNom.charAt(0).toUpperCase() || '?';
  }

  toutesCategories(): any[] {
    return this.menus().flatMap((m) => m.categories ?? []);
  }

  categorieActiveNom(): string {
    if (!this.categorieActive()) return 'Tous les plats';
    return this.toutesCategories().find((c) => c.id === this.categorieActive())?.nom ?? '';
  }

  produitsPopulaires(): any[] {
    return this.produits().filter((p) => p.est_populaire && p.est_disponible).slice(0, 10);
  }

  produitsAffiches(): any[] {
    const catId = this.categorieActive();
    const texte = this.recherche().trim().toLowerCase();
    return this.produits().filter((p) => {
      const matchCategorie = !catId || p.categorie_ids?.includes(catId);
      const matchTexte = !texte || p.nom.toLowerCase().includes(texte);
      return matchCategorie && matchTexte && p.est_visible !== false;
    });
  }

  /** Promo ciblée sur ce produit précis, s'il y en a une. */
  promoDeProduit(p: any): PromoProduit | null {
    return this.promotionsProduits[p.id] ?? null;
  }

  /** Prix après réduction, pour l'affichage (prix barré). */
  prixApresPromo(prix: number, promo: PromoProduit): number {
    const reduction = promo.typeReduction === 'POURCENTAGE' ? prix * (promo.valeur / 100) : promo.valeur;
    return Math.max(0, prix - reduction);
  }

  labelPromo(promo: PromoProduit): string {
    return promo.typeReduction === 'POURCENTAGE' ? `-${promo.valeur}%` : `-${promo.valeur} F`;
  }

  ouvrirProduit(p: any): void {
    if (!p.est_disponible) return;
    this.produitOuvert.set(p);
    this.varianteChoisie.set(p.variantes?.[0] ?? null);
    this.quantiteChoisie.set(1);
    this.noteChoisie.set('');
  }

  voirDetails(p: any, evt: Event): void {
    evt.stopPropagation();
    this.ouvrirProduit(p);
  }

  fermerProduit(): void {
    this.produitOuvert.set(null);
  }

  prixAffiche(p: any): number {
    return Number(this.varianteChoisie()?.prix ?? p.prix);
  }

  /** Prix après promo pour le tiroir détail — s'applique même si une
   *  variante est choisie (la promo porte sur le produit, pas une variante précise). */
  prixApresPromoAffiche(p: any): number {
    const prixBase = this.prixAffiche(p);
    const promo = this.promoDeProduit(p);
    return promo ? this.prixApresPromo(prixBase, promo) : prixBase;
  }

  ajoutRapide(p: any, evt: Event): void {
    evt.stopPropagation();
    if (!p.est_disponible) return;
    if (p.variantes?.length > 0) {
      this.ouvrirProduit(p);
      return;
    }
    this.cart.ajouter(p, null, 1, null);
  }

  ajouterAuPanier(): void {
    const p = this.produitOuvert();
    if (!p) return;
    this.cart.ajouter(p, this.varianteChoisie(), this.quantiteChoisie(), this.noteChoisie() || null);
    this.fermerProduit();
  }

  allerAuPanier(): void {
    this.router.navigate(['/m', this.restaurantId, 'panier'], { queryParams: { code: this.code } });
  }

  allerAuxCommandes(): void {
    const id = this.dernierCommandeId();
    if (id) {
      this.router.navigate(['/m', this.restaurantId, 'suivi', id], { queryParams: { code: this.code } });
    } else {
      alert('Vous n\'avez pas encore de commande en cours.');
    }
  }
}