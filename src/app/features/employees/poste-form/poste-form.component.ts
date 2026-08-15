import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Poste, PosteFormPayload } from '../models/employees.models';

@Component({
  selector: 'app-poste-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './poste-form.component.html',
})
export class PosteFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() posteAEditer: Poste | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<PosteFormPayload>();

  private readonly fb = new FormBuilder();

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(60)]],
    description: [''],
    niveau: [1],
  });

  ngOnChanges(): void {
    if (this.posteAEditer) {
      this.form.patchValue({
        nom: this.posteAEditer.nom,
        description: this.posteAEditer.description ?? '',
        niveau: this.posteAEditer.niveau ?? 1,
      });
    } else {
      this.form.reset({ nom: '', description: '', niveau: 1 });
    }
  }

  get titre(): string {
    return this.posteAEditer ? 'Modifier le poste' : 'Créer un poste';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({ nom: v.nom!, description: v.description || null, niveau: v.niveau });
  }
}
