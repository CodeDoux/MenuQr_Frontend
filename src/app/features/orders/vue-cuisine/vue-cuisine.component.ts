import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatutCommande } from '../../../core/enums/enums';
import { OrdersService } from '../../../core/services/orders.service';
import { Commande } from '../../../core/models/commande';

const LABEL_MODE: Record<string, string> = {
  SUR_PLACE: 'Sur place', EMPORTER: 'À emporter', LIVRAISON: 'Livraison',
};
const ICONE_MODE: Record<string, string> = {
  SUR_PLACE: '🍽️', EMPORTER: '🥡', LIVRAISON: '🛵',
};

const LABEL_ACTION_SUIVANTE: Record<string, string> = {
  EN_ATTENTE: 'Confirmer',
  CONFIRMEE: 'Démarrer la préparation',
  EN_PREPARATION: 'Marquer prête',
};

const SEUIL_URGENCE_MINUTES = 15;

@Component({
  selector: 'app-vue-cuisine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vue-cuisine.component.html',
  styleUrl: './vue-cuisine.component.css',
})
export class VueCuisineComponent {
  readonly StatutCommande = StatutCommande;
  readonly LABEL_MODE = LABEL_MODE;
  readonly ICONE_MODE = ICONE_MODE;
  readonly LABEL_ACTION_SUIVANTE = LABEL_ACTION_SUIVANTE;

  readonly enAttente;
  readonly confirmees;
  readonly enPreparation;
  readonly pretes;

  readonly colonnes: {
    id: string; titre: string; icone: string;
    commandes: () => Commande[]; annulable: boolean; actionVisible: boolean;
  }[];

  constructor(private readonly service: OrdersService) {
    const commandes = this.service.commandesCuisine;
    this.enAttente = () => commandes().filter((c) => c.statut === StatutCommande.EN_ATTENTE);
    this.confirmees = () => commandes().filter((c) => c.statut === StatutCommande.CONFIRMEE);
    this.enPreparation = () => commandes().filter((c) => c.statut === StatutCommande.EN_PREPARATION);
    this.pretes = () => commandes().filter((c) => c.statut === StatutCommande.PRETE);

    this.colonnes = [
      { id: 'attente', titre: 'En attente', icone: '⏳', commandes: this.enAttente, annulable: true, actionVisible: true },
      { id: 'confirmees', titre: 'Confirmées', icone: '✅', commandes: this.confirmees, annulable: false, actionVisible: true },
      { id: 'preparation', titre: 'En préparation', icone: '🔥', commandes: this.enPreparation, annulable: false, actionVisible: true },
      { id: 'pretes', titre: 'Prêtes', icone: '🔔', commandes: this.pretes, annulable: false, actionVisible: false },
    ];
  }

  numeroCourt(id: string): string {
    return '#' + id.slice(-4).toUpperCase();
  }

  tempsEcoule(dateStr: string): string {
    const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diffMin < 1) return 'à l\'instant';
    if (diffMin < 60) return `${diffMin} min`;
    const h = Math.floor(diffMin / 60);
    const reste = diffMin % 60;
    return `${h}h${reste ? reste : ''}`;
  }

  estUrgent(dateStr: string): boolean {
    const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return diffMin >= SEUIL_URGENCE_MINUTES;
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