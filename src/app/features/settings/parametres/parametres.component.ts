import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JourSemaine } from '../../../core/enums/enums';
import { Horaire, MoyenPaiement } from '../../../core/models/settings';
import { LIBELLE_METHODE, SettingsService } from '../../../core/services/settings.service';

const LIBELLE_JOUR: Record<JourSemaine, string> = {
  [JourSemaine.LUNDI]: 'Lundi',
  [JourSemaine.MARDI]: 'Mardi',
  [JourSemaine.MERCREDI]: 'Mercredi',
  [JourSemaine.JEUDI]: 'Jeudi',
  [JourSemaine.VENDREDI]: 'Vendredi',
  [JourSemaine.SAMEDI]: 'Samedi',
  [JourSemaine.DIMANCHE]: 'Dimanche',
};

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
})
export class ParametresComponent {
  readonly horaires;
  readonly moyensPaiement;
  readonly LIBELLE_METHODE = LIBELLE_METHODE;
  readonly LIBELLE_JOUR = LIBELLE_JOUR;

  constructor(private readonly service: SettingsService) {
    this.horaires = this.service.horaires;
    this.moyensPaiement = this.service.moyensPaiement;
  }

  toggleFerme(h: Horaire): void {
    this.service.modifierHoraire(h.id, {
      heureOuverture: h.estFerme ? '11:00' : null,
      heureFermeture: h.estFerme ? '22:00' : null,
      estFerme: !h.estFerme,
    });
  }

  changerHeure(h: Horaire, champ: 'heureOuverture' | 'heureFermeture', valeur: string): void {
    this.service.modifierHoraire(h.id, {
      heureOuverture: champ === 'heureOuverture' ? valeur : h.heureOuverture,
      heureFermeture: champ === 'heureFermeture' ? valeur : h.heureFermeture,
      estFerme: h.estFerme,
    });
  }

  toggleMoyenPaiement(m: MoyenPaiement): void {
    this.service.basculerMoyenPaiement(m.id);
  }

  changerIdentifiant(m: MoyenPaiement, valeur: string): void {
    this.service.modifierIdentifiantMarchand(m.id, valeur);
  }
}
