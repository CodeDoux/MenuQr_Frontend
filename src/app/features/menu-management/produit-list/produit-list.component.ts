import { Component, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitFormComponent } from '../produit-form/produit-form.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Produit, ProduitFormPayload } from '../../../core/models/produit';
import { MenuManagementService } from '../../../core/services/menu-management.service';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProduitFormComponent, BadgeComponent],
  templateUrl: './produit-list.component.html',
  styleUrl: './produit-list.component.css',
})
export class ProduitListComponent {
  recherche = signal('');
  categorieFiltre = signal<string | undefined>(undefined);

  formOuvert = signal(false);
  produitEnEdition = signal<Produit | null>(null);

  readonly categories: Signal<any[]>;
  readonly produits;
  readonly meta;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly menuService: MenuManagementService) {
    this.categories = this.menuService.categories;
    this.produits = this.menuService.produitsPage;
    this.meta = this.menuService.produitsMeta;
  }

  nomCategorie(id: string): string {
    return this.categories().find((c) => c.id === id)?.nom ?? '';
  }

  nomsCategories(p: Produit): string {
    return p.categorieIds.map((id) => this.nomCategorie(id)).join(', ');
  }

  /** Recherche avec anti-rebond — évite une requête à chaque frappe. */
  onRechercheChange(valeur: string): void {
    this.recherche.set(valeur);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.menuService.chargerProduits(1, 24, valeur, this.categorieFiltre() ?? null);
    }, 300);
  }

  filtrerParCategorie(id: string | undefined): void {
    this.categorieFiltre.set(id);
    this.menuService.chargerProduits(1, 24, this.recherche(), id ?? null);
  }

  allerPage(page: number): void {
    const m = this.meta();
    if (page < 1 || page > m.lastPage || page === m.currentPage) return;
    this.menuService.chargerProduits(page, m.perPage, this.recherche(), this.categorieFiltre() ?? null);
  }

  ouvrirCreation(): void {
    this.produitEnEdition.set(null);
    this.formOuvert.set(true);
  }

  ouvrirEdition(p: Produit): void {
    this.produitEnEdition.set(p);
    this.formOuvert.set(true);
  }

  fermerForm(): void {
    this.formOuvert.set(false);
  }

  valider(payload: ProduitFormPayload): void {
    const enEdition = this.produitEnEdition();
    const promesse = enEdition
      ? this.menuService.modifierProduit(enEdition.id, payload)
      : this.menuService.creerProduit(payload);

    promesse
      .then(() => this.formOuvert.set(false))
      .catch(() => alert('Une erreur est survenue lors de l\'enregistrement du produit.'));
  }

  archiver(p: Produit): void {
    if (confirm(`Archiver "${p.nom}" ? Il n'apparaîtra plus sur le menu, mais reste visible dans l'historique des commandes.`)) {
      this.menuService.archiverProduit(p.id).catch(() => alert('Une erreur est survenue lors de l\'archivage.'));
    }
  }

  basculerDisponibilite(p: Produit): void {
    this.menuService.basculerDisponibilite(p.id).catch(() => alert('Une erreur est survenue.'));
  }
}