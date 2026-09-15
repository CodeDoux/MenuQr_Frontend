import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { RoleCode, StatutEmploye } from '../../../core/enums/enums';
import { AccesPlateforme, Employe, EmployeFormPayload, Poste } from '../../../core/models/employe';

@Component({
  selector: 'app-employe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './employe-form.component.html',
  styleUrl: './employe-form.component.css',
})
export class EmployeFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() employeAEditer: Employe | null = null;
  @Input() accesAEditer: AccesPlateforme | null = null;
  @Input() postesDisponibles: Poste[] = [];
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<EmployeFormPayload>();

  private readonly fb = new FormBuilder();
  readonly StatutEmploye = StatutEmploye;
  readonly RoleCode = RoleCode;

  form = this.fb.group({
    nomComplet: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    posteId: ['', Validators.required],
    matricule: [''],
    dateEmbauche: [''],
    statut: [StatutEmploye.ACTIF, Validators.required],
    notes: [''],
    accorderAcces: [false],
    role: [null as RoleCode | null],
  });

  ngOnChanges(): void {
    if (this.employeAEditer) {
      this.form.patchValue({
        nomComplet: this.employeAEditer.nomComplet,
        email: this.employeAEditer.email,
        posteId: this.employeAEditer.posteId,
        matricule: this.employeAEditer.matricule ?? '',
        dateEmbauche: this.employeAEditer.dateEmbauche ?? '',
        statut: this.employeAEditer.statut,
        notes: this.employeAEditer.notes ?? '',
        accorderAcces: !!this.accesAEditer,
        role: this.accesAEditer?.role ?? null,
      });
    } else {
      this.form.reset({
        nomComplet: '', email: '', posteId: '', matricule: '', dateEmbauche: '',
        statut: StatutEmploye.ACTIF, notes: '', accorderAcces: false, role: null,
      });
    }
  }

  get titre(): string {
    return this.employeAEditer ? 'Modifier l\'employé' : 'Ajouter un employé';
  }

  onSubmit(): void {
    if (this.form.get('accorderAcces')?.value && !this.form.get('role')?.value) {
      this.form.get('role')?.setErrors({ required: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({
      nomComplet: v.nomComplet!,
      email: v.email!,
      posteId: v.posteId!,
      matricule: v.matricule || null,
      dateEmbauche: v.dateEmbauche || null,
      statut: v.statut!,
      notes: v.notes || null,
      accorderAcces: v.accorderAcces!,
      role: v.accorderAcces ? v.role : null,
    });
  }
}
