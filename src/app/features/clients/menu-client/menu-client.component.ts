import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { PublicOrderService } from '../../../core/services/public-order.service';
import { lireParamAncetre } from '../../../core/utils/route.utils';

@Component({
  selector: 'app-menu-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-client.component.html',
})
export class MenuClientComponent implements OnInit {
  readonly Math = Math;

  menus = signal<any[]>([]);
  produits = signal<any[]>([]);
  categorieActive = signal<string | null>(null);
  produitOuvert = signal<any | null>(null);
  varianteChoisie = signal<any | null>(null);
  quantiteChoisie = signal(1);
  noteChoisie = signal('');
  chargementInitial = signal(true);
  erreurChargement = signal<string | null>(null);

  readonly nombreArticles;
  readonly total;

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
      this.menus.set(donnees.menus);
      this.produits.set(donnees.produits);
      this.cart.initialiserContexte(donnees.tableId, null);
       this.cart.definirZonesLivraison(donnees.zonesLivraison);
      this.categorieActive.set(donnees.menus[0]?.categories?.[0]?.id ?? null);
    } catch {
      this.router.navigate(['/m', this.restaurantId, 'invalide']);
      return;
    } finally {
      this.chargementInitial.set(false);
    }
  }

  toutesCategories(): any[] {
    return this.menus().flatMap((m) => m.categories ?? []);
  }

  produitsDeLaCategorie(categorieId: string): any[] {
    return this.produits().filter((p) => p.categorie_ids?.includes(categorieId) && p.est_visible !== false);
  }

  ouvrirProduit(p: any): void {
    this.produitOuvert.set(p);
    this.varianteChoisie.set(p.variantes?.[0] ?? null);
    this.quantiteChoisie.set(1);
    this.noteChoisie.set('');
  }

  fermerProduit(): void {
    this.produitOuvert.set(null);
  }

  prixAffiche(p: any): number {
    return Number(this.varianteChoisie()?.prix ?? p.prix);
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
}