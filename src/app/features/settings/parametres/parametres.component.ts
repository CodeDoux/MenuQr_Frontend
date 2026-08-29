import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JourSemaine } from '../../../core/enums/enums';
import { ZoneFormComponent } from '../../livraisons/zone-form/zone-form.component';
import { LIBELLE_METHODE, SettingsService } from '../../../core/services/settings.service';
import { ZoneFormPayload, ZoneLivraison } from '../../../core/models/livraison';
import { DeliveryService } from '../../../core/services/livraison.service';
import { Horaire, MoyenPaiement } from '../../../core/models/settings';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ZoneFormComponent],
  templateUrl: './parametres.component.html',
})
export class ParametresComponent {
  readonly horaires;
  readonly moyensPaiement;
  readonly zones;
  readonly LIBELLE_METHODE = LIBELLE_METHODE;
  readonly LIBELLE_JOUR = LIBELLE_JOUR;

  zoneFormOuvert = signal(false);
  zoneEnEdition = signal<ZoneLivraison | null>(null);

  private readonly fb = new FormBuilder();
  formRestaurant = this.fb.group({
    nom: ['', Validators.required],
    adresse: ['', Validators.required],
    telephone: ['', Validators.required],
    email: [''],
    description: [''],
  });
  restaurantEnregistre = false;

  constructor(
    private readonly service: SettingsService,
    private readonly deliveryService: DeliveryService
  ) {
    this.horaires = this.service.horaires;
    this.moyensPaiement = this.service.moyensPaiement;
    this.zones = this.deliveryService.zones;
    this.formRestaurant.patchValue(this.service.restaurantInfos());
  }

  ouvrirCreationZone(): void {
    this.zoneEnEdition.set(null);
    this.zoneFormOuvert.set(true);
  }
  ouvrirEditionZone(zone: ZoneLivraison): void {
    this.zoneEnEdition.set(zone);
    this.zoneFormOuvert.set(true);
  }

  enregistrerRestaurant(): void {
    if (this.formRestaurant.invalid) {
      this.formRestaurant.markAllAsTouched();
      return;
    }
    this.service.modifierRestaurantInfos({
      nom: this.formRestaurant.value.nom!,
      adresse: this.formRestaurant.value.adresse!,
      telephone: this.formRestaurant.value.telephone!,
      email: this.formRestaurant.value.email || null,
      description: this.formRestaurant.value.description || null,
    });
    this.restaurantEnregistre = true;
    setTimeout(() => (this.restaurantEnregistre = false), 2500);
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

  validerZone(payload: ZoneFormPayload): void {
    const enEdition = this.zoneEnEdition();
    const promesse = enEdition
      ? this.deliveryService.modifierZone(enEdition.id, payload)
      : this.deliveryService.creerZone(payload);

    promesse
      .then(() => this.zoneFormOuvert.set(false))
      .catch(() => alert('Une erreur est survenue lors de l\'enregistrement de la zone.'));
  }

  supprimerZone(zone: ZoneLivraison): void {
    if (confirm(`Supprimer la zone "${zone.nom}" ?`)) {
      this.deliveryService.supprimerZone(zone.id).catch(() => alert('Une erreur est survenue.'));
    }
  }
}