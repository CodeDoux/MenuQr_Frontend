import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutCommande } from '../../../core/enums/enums';
import { OrdersService } from '../../../core/services/orders.service';
import { Commande } from '../../../core/models/commande';

const LABEL_MODE: Record<string, string> = {
  SUR_PLACE: 'Sur place', EMPORTER: 'À emporter', LIVRAISON: 'Livraison',
};

const LABEL_ACTION_SUIVANTE: Record<string, string> = {
  EN_ATTENTE: 'Confirmer',
  CONFIRMEE: 'Démarrer la préparation',
  EN_PREPARATION: 'Marquer prête',
};

@Component({
  selector: 'app-vue-cuisine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vue-cuisine.component.html',
})
export class VueCuisineComponent {
  readonly StatutCommande = StatutCommande;
  readonly LABEL_MODE = LABEL_MODE;
  readonly LABEL_ACTION_SUIVANTE = LABEL_ACTION_SUIVANTE;

  readonly enAttente;
  readonly confirmees;
  readonly enPreparation;
  readonly pretes;

  constructor(private readonly service: OrdersService) {
    const commandes = this.service.commandesCuisine;
    this.enAttente = () => commandes().filter((c) => c.statut === StatutCommande.EN_ATTENTE);
    this.confirmees = () => commandes().filter((c) => c.statut === StatutCommande.CONFIRMEE);
    this.enPreparation = () => commandes().filter((c) => c.statut === StatutCommande.EN_PREPARATION);
    this.pretes = () => commandes().filter((c) => c.statut === StatutCommande.PRETE);
  }

  numeroCourt(id: string): string {
    return '#' + id.slice(-4).toUpperCase();
  }

  avancer(c: Commande): void {
    this.service.avancerStatutCuisine(c.id).catch(() => alert('Une erreur est survenue.'));
  }

  annuler(c: Commande): void {
    if (confirm(`Annuler la commande ${this.numeroCourt(c.id)} ?`)) {
      this.service.annulerCommande(c.id).catch(() => alert('Une erreur est survenue.'));
    }
  }
}
