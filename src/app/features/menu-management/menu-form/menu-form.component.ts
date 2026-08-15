import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Menu, MenuFormPayload } from '../../../core/models/menu';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './menu-form.component.html',
})
export class MenuFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() menuAEditer: Menu | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<MenuFormPayload>();

  private readonly fb = new FormBuilder();

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(80)]],
    description: [''],
    image: [''],
    ordreAffichage: [1, [Validators.required, Validators.min(1)]],
    estActif: [true],
    dateDebut: [''],
    dateFin: [''],
  });

  ngOnChanges(): void {
    if (this.menuAEditer) {
      this.form.patchValue({
        nom: this.menuAEditer.nom,
        description: this.menuAEditer.description ?? '',
        image: this.menuAEditer.image ?? '',
        ordreAffichage: this.menuAEditer.ordreAffichage,
        estActif: this.menuAEditer.estActif,
        dateDebut: this.menuAEditer.dateDebut ?? '',
        dateFin: this.menuAEditer.dateFin ?? '',
      });
    } else {
      this.form.reset({ nom: '', description: '', image: '', ordreAffichage: 1, estActif: true, dateDebut: '', dateFin: '' });
    }
  }

  get titre(): string {
    return this.menuAEditer ? 'Modifier le menu' : 'Créer un menu';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({
      nom: v.nom!,
      description: v.description || null,
      image: v.image || null,
      ordreAffichage: v.ordreAffichage!,
      estActif: v.estActif!,
      dateDebut: v.dateDebut || null,
      dateFin: v.dateFin || null,
    });
  }
}
