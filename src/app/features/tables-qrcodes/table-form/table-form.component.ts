import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableFormPayload, TableRestaurant } from '../../../core/models/table';
import { StatutTable } from '../../../core/enums/enums';

@Component({
  selector: 'app-table-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './table-form.component.html',
    styleUrl: './table-form.component.css',

})
export class TableFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() salleId = '';
  @Input() tableAEditer: TableRestaurant | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<TableFormPayload>();

  private readonly fb = new FormBuilder();
  readonly StatutTable = StatutTable;

  form = this.fb.group({
    numero: ['', [Validators.required, Validators.maxLength(10)]],
    capacite: [2, [Validators.required, Validators.min(1)]],
    statut: [StatutTable.LIBRE, Validators.required],
    zone: [''],
  });

  ngOnChanges(): void {
    if (this.tableAEditer) {
      this.form.patchValue({
        numero: this.tableAEditer.numero,
        capacite: this.tableAEditer.capacite,
        statut: this.tableAEditer.statut,
        zone: this.tableAEditer.zone ?? '',
      });
    } else {
      this.form.reset({ numero: '', capacite: 2, statut: StatutTable.LIBRE, zone: '' });
    }
  }

  get titre(): string {
    return this.tableAEditer ? 'Modifier la table' : 'Ajouter une table';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({
      salleId: this.salleId,
      numero: v.numero!,
      capacite: v.capacite!,
      statut: v.statut!,
      zone: v.zone || null,
    });
  }
}
