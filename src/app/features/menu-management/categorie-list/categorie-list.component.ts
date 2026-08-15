import { Component, OnInit, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CategorieFormComponent } from '../categorie-form/categorie-form.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Menu } from '../../../core/models/menu';
import { Categorie, CategorieFormPayload } from '../../../core/models/categorie';
import { MenuManagementService } from '../../../core/services/menu-management.service';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, RouterModule, CategorieFormComponent, BadgeComponent],
  templateUrl: './categorie-list.component.html',
})
export class CategorieListComponent implements OnInit {
  menuId = '';
  menu = signal<Menu | undefined>(undefined);
  categories!: Signal<Categorie[]>;

  formOuvert = signal(false);
  categorieEnEdition = signal<Categorie | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly menuService: MenuManagementService
  ) {}

  ngOnInit(): void {
    this.menuId = this.route.snapshot.paramMap.get('menuId') ?? '';
    this.menu.set(this.menuService.menus().find((m) => m.id === this.menuId));
    this.categories = this.menuService.categoriesDuMenu(this.menuId);
  }

  ouvrirCreation(): void {
    this.categorieEnEdition.set(null);
    this.formOuvert.set(true);
  }

  ouvrirEdition(cat: Categorie): void {
    this.categorieEnEdition.set(cat);
    this.formOuvert.set(true);
  }

  fermerForm(): void {
    this.formOuvert.set(false);
  }

  valider(payload: CategorieFormPayload): void {
    const enEdition = this.categorieEnEdition();
    if (enEdition) {
      this.menuService.modifierCategorie(enEdition.id, payload);
    } else {
      this.menuService.creerCategorie(payload);
    }
    this.formOuvert.set(false);
  }

  supprimer(cat: Categorie): void {
    if (confirm(`Supprimer la catégorie "${cat.nom}" ? Les produits associés ne seront pas supprimés.`)) {
      this.menuService.supprimerCategorie(cat.id);
    }
  }
}
