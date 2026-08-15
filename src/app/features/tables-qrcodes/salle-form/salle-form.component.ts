import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Salle, SalleFormPayload } from '../../../core/models/salle';
import { StatutSalle } from '../../../core/enums/enums';

@Component({
  selector: 'app-salle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './salle-form.component.html',
})
export class SalleFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() salleAEditer: Salle | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<SalleFormPayload>();

  private readonly fb = new FormBuilder();
  readonly StatutSalle = StatutSalle;

  form = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(60)]],
    ordre: [1, [Validators.required, Validators.min(1)]],
    statut: [StatutSalle.ACTIVE, Validators.required],
  });

  ngOnChanges(): void {
    if (this.salleAEditer) {
      this.form.patchValue({ ...this.salleAEditer });
    } else {
      this.form.reset({ description: '', ordre: 1, statut: StatutSalle.ACTIVE });
    }
  }

  get titre(): string {
    return this.salleAEditer ? 'Modifier la salle' : 'Créer une salle';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.valider.emit(this.form.getRawValue() as SalleFormPayload);
  }
}
