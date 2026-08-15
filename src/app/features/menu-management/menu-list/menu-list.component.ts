import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuFormComponent } from '../menu-form/menu-form.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Menu, MenuFormPayload } from '../../../core/models/menu';
import { MenuManagementService } from '../../../core/services/menu-management.service';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuFormComponent, BadgeComponent],
  templateUrl: './menu-list.component.html',
})
export class MenuListComponent {
  formOuvert = signal(false);
  menuEnEdition = signal<Menu | null>(null);
  readonly menus;

  constructor(private readonly menuService: MenuManagementService) {
    this.menus = this.menuService.menusTries;
  }

  nombreCategories(menuId: string): number {
    return this.menuService.categoriesDuMenu(menuId)().length;
  }

  ouvrirCreation(): void {
    this.menuEnEdition.set(null);
    this.formOuvert.set(true);
  }

  ouvrirEdition(menu: Menu, evt: Event): void {
    evt.stopPropagation();
    evt.preventDefault();
    this.menuEnEdition.set(menu);
    this.formOuvert.set(true);
  }

  fermerForm(): void {
    this.formOuvert.set(false);
  }

  valider(payload: MenuFormPayload): void {
    const enEdition = this.menuEnEdition();
    if (enEdition) {
      this.menuService.modifierMenu(enEdition.id, payload);
    } else {
      this.menuService.creerMenu(payload);
    }
    this.formOuvert.set(false);
  }

  supprimer(menu: Menu, evt: Event): void {
    evt.stopPropagation();
    evt.preventDefault();
    const confirmation = confirm(`Supprimer le menu "${menu.nom}" et toutes ses catégories ?`);
    if (confirmation) {
      this.menuService.supprimerMenu(menu.id);
    }
  }
}
