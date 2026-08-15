import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Produit, Variante } from '../../../core/models/produit';
import { MenuManagementService } from '../../menu-management/services/menu-management.service';
import { CartService } from '../services/cart.service';
import { ModeCommande } from '../../../core/enums/enums';

@Component({
  selector: 'app-menu-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-client.component.html',
})
export class MenuClientComponent implements OnInit {
 private readonly menuService = inject(MenuManagementService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly Math = Math;
  readonly menus = this.menuService.menusTries;
  readonly categories = this.menuService.categories;
  readonly produits = this.menuService.produits;

  categorieActive = signal<string | null>(null);
  produitOuvert = signal<Produit | null>(null);
  varianteChoisie = signal<Variante | null>(null);
  quantiteChoisie = signal(1);

  readonly nombreArticles = this.cart.nombreArticles;
  readonly total = this.cart.total;

  restaurantId = '';



  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') ?? '';

    // ⚠️ Mock : un seul restaurant existe ('rest-001'). Un autre id = QR invalide.
    if (this.restaurantId !== 'rest-001') {
      this.router.navigate(['/m', this.restaurantId, 'invalide']);
      return;
    }

    const tableId = this.route.snapshot.queryParamMap.get('table');
    const modeParam = this.route.snapshot.queryParamMap.get('mode') as ModeCommande | null;
    this.cart.initialiserContexte(tableId, modeParam);

    const premiereCategorieActive = this.categories()[0]?.id ?? null;
    this.categorieActive.set(premiereCategorieActive);
  }

  produitsDeLaCategorie(categorieId: string): Produit[] {
    return this.produits().filter((p) => p.estVisible && p.categorieIds.includes(categorieId));
  }

  ouvrirProduit(p: Produit): void {
    this.produitOuvert.set(p);
    this.varianteChoisie.set(p.variantes[0] ?? null);
    this.quantiteChoisie.set(1);
  }

  fermerProduit(): void {
    this.produitOuvert.set(null);
  }

  prixAffiche(p: Produit): number {
    return this.varianteChoisie()?.prix ?? p.prix;
  }

  ajouterAuPanier(): void {
    const p = this.produitOuvert();
    if (!p) return;
    this.cart.ajouter(p, this.varianteChoisie(), this.quantiteChoisie());
    this.fermerProduit();
  }

  allerAuPanier(): void {
    this.router.navigate(['/m', this.restaurantId, 'panier']);
  }
}