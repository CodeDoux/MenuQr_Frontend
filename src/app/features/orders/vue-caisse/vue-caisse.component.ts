import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LIBELLE_METHODE, SettingsService } from '../../../core/services/settings.service';
import { OrdersService } from '../../../core/services/orders.service';
import { RouterModule } from '@angular/router';

const LABEL_MODE: Record<string, string> = {
  SUR_PLACE: 'Sur place', EMPORTER: 'À emporter', LIVRAISON: 'Livraison',
};

const ICONE_METHODE: Record<string, string> = {
  ESPECES: '💵', WAVE: '🟦', ORANGE_MONEY: '🟧', CARTE: '💳', AUTRE: '➕',
};

@Component({
  selector: 'app-vue-caisse',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vue-caisse.component.html',
  styleUrl: './vue-caisse.component.css',
})
export class VueCaisseComponent {
  readonly additionsOuvertes;
  readonly commandesDirectes;
  readonly moyensPaiementActifs;
  readonly LIBELLE_METHODE = LIBELLE_METHODE;
  readonly ICONE_METHODE = ICONE_METHODE;
  readonly LABEL_MODE = LABEL_MODE;

  additionEnEncaissement = signal<string | null>(null);
  commandeEnEncaissement = signal<string | null>(null);
  methodeChoisie = signal<string>('');

  constructor(
    private readonly service: OrdersService,
    private readonly settingsService: SettingsService
  ) {
    this.additionsOuvertes = this.service.additionsOuvertes;
    this.commandesDirectes = this.service.commandesAEncaisserDirectement;
    this.moyensPaiementActifs = () => this.settingsService.moyensPaiement().filter((m) => m.estActif);
  }

  numeroCourt(id: string): string {
    return '#' + id.slice(-4).toUpperCase();
  }

  ouvrirEncaissementAddition(additionId: string): void {
    this.additionEnEncaissement.set(additionId);
    this.commandeEnEncaissement.set(null);
    this.methodeChoisie.set(this.moyensPaiementActifs()[0]?.methode ?? '');
  }

  ouvrirEncaissementDirect(commandeId: string): void {
    this.commandeEnEncaissement.set(commandeId);
    this.additionEnEncaissement.set(null);
    this.methodeChoisie.set(this.moyensPaiementActifs()[0]?.methode ?? '');
  }

  fermerEncaissement(): void {
    this.additionEnEncaissement.set(null);
    this.commandeEnEncaissement.set(null);
  }

  confirmerEncaissement(): void {
    const methode = this.methodeChoisie();
    if (!methode) return;

    const promesse = this.additionEnEncaissement()
      ? this.service.encaisserAddition(this.additionEnEncaissement()!, methode)
      : this.commandeEnEncaissement()
        ? this.service.encaisserCommandeDirecte(this.commandeEnEncaissement()!, methode)
        : Promise.resolve();

    promesse
      .then(() => this.fermerEncaissement())
      .catch(() => alert('Une erreur est survenue lors de l\'encaissement.'));
  }
}