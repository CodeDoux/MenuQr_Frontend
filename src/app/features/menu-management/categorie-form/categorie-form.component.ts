import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Categorie, CategorieFormPayload } from '../../../core/models/categorie';

@Component({
  selector: 'app-categorie-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './categorie-form.component.html',
})
export class CategorieFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() menuId = '';
  @Input() categorieAEditer: Categorie | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<CategorieFormPayload>();

  private readonly fb = new FormBuilder();

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(60)]],
    description: [''],
    icone: [''],
    ordreAffichage: [1, [Validators.required, Validators.min(1)]],
    estActive: [true],
  });

  ngOnChanges(): void {
    if (this.categorieAEditer) {
      this.form.patchValue({
        nom: this.categorieAEditer.nom,
        description: this.categorieAEditer.description ?? '',
        icone: this.categorieAEditer.icone ?? '',
        ordreAffichage: this.categorieAEditer.ordreAffichage,
        estActive: this.categorieAEditer.estActive,
      });
    } else {
      this.form.reset({ nom: '', description: '', icone: '', ordreAffichage: 1, estActive: true });
    }
  }

  get titre(): string {
    return this.categorieAEditer ? 'Modifier la catégorie' : 'Créer une catégorie';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({
      menuId: this.menuId,
      nom: v.nom!,
      description: v.description || null,
      icone: v.icone || null,
      ordreAffichage: v.ordreAffichage!,
      estActive: v.estActive!,
    });
  }
}
