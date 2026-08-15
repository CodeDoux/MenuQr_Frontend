import { Component, Signal, computed, signal } from '@angular/core';
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
})
export class ProduitListComponent {
  recherche = signal('');
  categorieFiltre = signal<string | undefined>(undefined);

  formOuvert = signal(false);
  produitEnEdition = signal<Produit | null>(null);

  readonly categories;
  produits!: Signal<Produit[]>;

  constructor(private readonly menuService: MenuManagementService) {
    this.categories = this.menuService.categories;
    this.produits = computed(() =>
      this.menuService.produitsFiltres(this.categorieFiltre(), this.recherche())()
    );
  }

  nomCategorie(id: string): string {
    return this.categories().find((c) => c.id === id)?.nom ?? '';
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
    if (enEdition) {
      this.menuService.modifierProduit(enEdition.id, payload);
    } else {
      this.menuService.creerProduit(payload);
    }
    this.formOuvert.set(false);
  }

  archiver(p: Produit): void {
    if (confirm(`Archiver "${p.nom}" ? Il n'apparaîtra plus sur le menu, mais reste visible dans l'historique des commandes.`)) {
      this.menuService.archiverProduit(p.id);
    }
  }

  basculerDisponibilite(p: Produit): void {
    this.menuService.basculerDisponibilite(p.id);
  }
}
