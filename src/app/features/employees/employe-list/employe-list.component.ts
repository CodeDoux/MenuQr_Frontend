import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosteFormComponent } from '../poste-form/poste-form.component';
import { EmployeFormComponent } from '../employe-form/employe-form.component';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { StatutAcces, StatutEmploye } from '../../../core/enums/enums';
import { AccesPlateforme, Employe, EmployeFormPayload, Poste, PosteFormPayload } from '../../../core/models/employe';
import { EmployeesService } from '../../../core/services/employees.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, PosteFormComponent, EmployeFormComponent, BadgeComponent],
  templateUrl: './employe-list.component.html',
  styleUrl: './employe-list.component.css',
})
export class EmployeeListComponent {
  readonly postes;
  readonly employesAvecAcces;

  posteFormOuvert = signal(false);
  posteEnEdition = signal<Poste | null>(null);

  employeFormOuvert = signal(false);
  employeEnEdition = signal<Employe | null>(null);
  accesEnEdition = signal<AccesPlateforme | null>(null);

  constructor(private readonly service: EmployeesService) {
    this.postes = this.service.postes;
    this.employesAvecAcces = this.service.employesAvecAcces;
  }

  nomPoste(id: string): string {
    return this.postes().find((p) => p.id === id)?.nom ?? '—';
  }

  toneStatutEmploye(statut: StatutEmploye): BadgeTone {
    if (statut === StatutEmploye.ACTIF) return 'success';
    if (statut === StatutEmploye.EN_CONGE) return 'info';
    if (statut === StatutEmploye.SUSPENDU) return 'warning';
    return 'neutral';
  }

  labelStatutEmploye(statut: StatutEmploye): string {
    return { ACTIF: 'Actif', EN_CONGE: 'En congé', SUSPENDU: 'Suspendu', TERMINE: 'Terminé' }[statut];
  }

  toneStatutAcces(statut: StatutAcces): BadgeTone {
    if (statut === StatutAcces.ACTIF) return 'success';
    if (statut === StatutAcces.INVITE) return 'info';
    if (statut === StatutAcces.SUSPENDU) return 'warning';
    return 'neutral';
  }

  labelStatutAcces(statut: StatutAcces): string {
    return { INVITE: 'Invité', ACTIF: 'Accès actif', SUSPENDU: 'Accès suspendu', REVOQUE: 'Accès révoqué' }[statut];
  }

  

 

  // ⚠️ Remplace uniquement ces méthodes dans employee-list.component.ts
// (le reste du fichier ne change pas).

  ouvrirCreationPoste(): void {
    this.posteEnEdition.set(null);
    this.posteFormOuvert.set(true);
  }
  ouvrirEditionPoste(poste: Poste): void {
    this.posteEnEdition.set(poste);
    this.posteFormOuvert.set(true);
  }
  validerPoste(payload: PosteFormPayload): void {
    const enEdition = this.posteEnEdition();
    const promesse = enEdition
      ? this.service.modifierPoste(enEdition.id, payload)
      : this.service.creerPoste(payload);

    promesse
      .then(() => this.posteFormOuvert.set(false))
      .catch(() => alert('Une erreur est survenue lors de l\'enregistrement du poste.'));
  }
  supprimerPoste(poste: Poste): void {
    if (confirm(`Supprimer le poste "${poste.nom}" ?`)) {
      this.service.supprimerPoste(poste.id).catch((e: Error) => alert(e.message));
    }
  }

  // --- Employés ---
  ouvrirCreationEmploye(): void {
    this.employeEnEdition.set(null);
    this.accesEnEdition.set(null);
    this.employeFormOuvert.set(true);
  }
  ouvrirEditionEmploye(employe: Employe, acces: AccesPlateforme | undefined): void {
    this.employeEnEdition.set(employe);
    this.accesEnEdition.set(acces ?? null);
    this.employeFormOuvert.set(true);
  }
  validerEmploye(payload: EmployeFormPayload): void {
    const enEdition = this.employeEnEdition();
    const promesse = enEdition
      ? this.service.modifierEmploye(enEdition.id, payload)
      : this.service.creerEmploye(payload);

    promesse
      .then(() => this.employeFormOuvert.set(false))
      .catch(() => alert('Une erreur est survenue lors de l\'enregistrement de l\'employé.'));
  }
  terminerEmploye(employe: Employe): void {
    if (confirm(`Marquer "${employe.nomComplet}" comme employé terminé ? Son accès plateforme sera révoqué.`)) {
      this.service.terminerEmploye(employe.id).catch(() => alert('Une erreur est survenue.'));
    }
  }
  renvoyerInvitation(employe: Employe): void {
    this.service.renvoyerInvitation(employe.id)
      .then(() => alert('Invitation renvoyée (simulation — aucun email réel envoyé pour l\'instant).'))
      .catch(() => alert('Une erreur est survenue.'));
  }
  copierLienInvitation(employe: Employe): void {
    const lien = `${window.location.origin}/invitation/${employe.id}`;
    navigator.clipboard?.writeText(lien).catch(() => {});
    alert(`Lien d'invitation (copié si possible) :\n${lien}`);
  }
}