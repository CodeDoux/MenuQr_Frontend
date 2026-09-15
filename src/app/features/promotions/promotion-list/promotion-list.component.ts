import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionFormComponent } from '../promotion-form/promotion-form.component';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { CiblePromotion, TypeReduction } from '../../../core/enums/enums';
import { PromotionsService } from '../../../core/services/promotion.service';
import { Promotion, PromotionFormPayload } from '../../../core/models/promotion';
import { MenuManagementService } from '../../../core/services/menu-management.service';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, PromotionFormComponent, BadgeComponent],
  templateUrl: './promotion-list.component.html',
  styleUrl: './promotion-list.component.css',
})
export class PromotionListComponent {
  readonly promotions;
  readonly produits;

  formOuvert = signal(false);
  promotionEnEdition = signal<Promotion | null>(null);

  constructor(
    private readonly service: PromotionsService,
    private readonly menuService: MenuManagementService
  ) {
    this.promotions = this.service.promotions;
    this.produits = this.menuService.produitsTous;
    this.menuService.chargerTousLesProduits();
  }

  libelleReduction(p: Promotion): string {
    return p.typeReduction === TypeReduction.POURCENTAGE ? `-${p.valeur}%` : `-${p.valeur} F`;
  }

  libelleCible(p: Promotion): string {
    if (p.cible === CiblePromotion.COMMANDE_ENTIERE) return 'Commande entière';
    const noms = p.produitIds.map((id) => this.produits().find((prod) => prod.id === id)?.nom).filter(Boolean);
    return noms.length ? noms.join(', ') : '—';
  }

  toneActive(p: Promotion): BadgeTone {
    return p.estActive ? 'success' : 'neutral';
  }

  ouvrirCreation(): void {
    this.promotionEnEdition.set(null);
    this.formOuvert.set(true);
  }
  ouvrirEdition(p: Promotion): void {
    this.promotionEnEdition.set(p);
    this.formOuvert.set(true);
  }
  valider(payload: PromotionFormPayload): void {
    const enEdition = this.promotionEnEdition();
    if (enEdition) this.service.modifierPromotion(enEdition.id, payload);
    else this.service.creerPromotion(payload);
    this.formOuvert.set(false);
  }
  supprimer(p: Promotion): void {
    if (confirm(`Supprimer la promotion "${p.nom}" ?`)) {
      this.service.supprimerPromotion(p.id);
    }
  }
}
