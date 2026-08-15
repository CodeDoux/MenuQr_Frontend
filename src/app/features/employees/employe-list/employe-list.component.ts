import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeFormComponent } from '../employe-form/employe-form.component';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { AccesPlateforme, Employe, EmployeFormPayload, Poste, PosteFormPayload } from '../models/employees.models';
import { EmployeesService } from '../services/employees.service';
import { StatutAcces, StatutEmploye } from '../../../core/enums/enums';
import { PosteFormComponent } from '../poste-form/poste-form.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, PosteFormComponent, EmployeFormComponent, BadgeComponent],
  templateUrl: './employe-list.component.html',
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

  // --- Postes ---
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
    if (enEdition) this.service.modifierPoste(enEdition.id, payload);
    else this.service.creerPoste(payload);
    this.posteFormOuvert.set(false);
  }
  supprimerPoste(poste: Poste): void {
    try {
      if (confirm(`Supprimer le poste "${poste.nom}" ?`)) {
        this.service.supprimerPoste(poste.id);
      }
    } catch (e) {
      alert((e as Error).message);
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
    if (enEdition) this.service.modifierEmploye(enEdition.id, payload);
    else this.service.creerEmploye(payload);
    this.employeFormOuvert.set(false);
  }
  terminerEmploye(employe: Employe): void {
    if (confirm(`Marquer "${employe.nomComplet}" comme employé terminé ? Son accès plateforme sera révoqué.`)) {
      this.service.terminerEmploye(employe.id);
    }
  }
  renvoyerInvitation(acces: AccesPlateforme): void {
    this.service.renvoyerInvitation(acces.id);
    alert(`Invitation renvoyée (simulation — aucun email réel envoyé sans backend).`);
  }
}
