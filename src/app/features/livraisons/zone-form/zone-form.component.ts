import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ZoneFormPayload, ZoneLivraison } from '../../../core/models/livraison';
import { StatutZone } from '../../../core/enums/enums';

@Component({
  selector: 'app-zone-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './zone-form.component.html',
})
export class ZoneFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() zoneAEditer: ZoneLivraison | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<ZoneFormPayload>();

  private readonly fb = new FormBuilder();
  readonly StatutZone = StatutZone;

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(60)]],
    description: [''],
    frais: [1000, [Validators.required, Validators.min(0)]],
    tempsEstime: [30 as number | null],
    distanceMax: [null as number | null],
    statut: [StatutZone.ACTIVE, Validators.required],
  });

  ngOnChanges(): void {
    if (this.zoneAEditer) {
      this.form.patchValue({
        nom: this.zoneAEditer.nom, description: this.zoneAEditer.description ?? '',
        frais: this.zoneAEditer.frais, tempsEstime: this.zoneAEditer.tempsEstime ?? null,
        distanceMax: this.zoneAEditer.distanceMax ?? null, statut: this.zoneAEditer.statut,
      });
    } else {
      this.form.reset({ nom: '', description: '', frais: 1000, tempsEstime: 30, distanceMax: null, statut: StatutZone.ACTIVE });
    }
  }

  get titre(): string {
    return this.zoneAEditer ? 'Modifier la zone' : 'Créer une zone de livraison';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({
      nom: v.nom!, description: v.description || null, frais: v.frais!,
      tempsEstime: v.tempsEstime, distanceMax: v.distanceMax, statut: v.statut!,
    });
  }
}