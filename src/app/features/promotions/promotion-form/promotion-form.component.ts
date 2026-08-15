import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CiblePromotion, TypeReduction } from '../../../core/enums/enums';
import { Promotion, PromotionFormPayload } from '../../models/promotion.model';
import { Produit } from '../../../core/models/produit';

@Component({
  selector: 'app-promotion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './promotion-form.component.html',
})
export class PromotionFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() promotionAEditer: Promotion | null = null;
  @Input() produitsDisponibles: Produit[] = [];
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<PromotionFormPayload>();

  private readonly fb = new FormBuilder();
  readonly TypeReduction = TypeReduction;
  readonly CiblePromotion = CiblePromotion;

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(80)]],
    utiliseCode: [false],
    code: [''],
    typeReduction: [TypeReduction.POURCENTAGE, Validators.required],
    valeur: [10, [Validators.required, Validators.min(0)]],
    cible: [CiblePromotion.PRODUIT, Validators.required],
    produitIds: this.fb.control<string[]>([]),
    dateDebut: ['', Validators.required],
    dateFin: [''],
    limiteUtilisation: [null as number | null],
    estActive: [true],
  });

  ngOnChanges(): void {
    if (this.promotionAEditer) {
      const p = this.promotionAEditer;
      this.form.patchValue({
        nom: p.nom,
        utiliseCode: !!p.code,
        code: p.code ?? '',
        typeReduction: p.typeReduction,
        valeur: p.valeur,
        cible: p.cible,
        produitIds: [...p.produitIds],
        dateDebut: p.dateDebut.slice(0, 10),
        dateFin: p.dateFin ? p.dateFin.slice(0, 10) : '',
        limiteUtilisation: p.limiteUtilisation ?? null,
        estActive: p.estActive,
      });
    } else {
      this.form.reset({
        nom: '', utiliseCode: false, code: '', typeReduction: TypeReduction.POURCENTAGE,
        valeur: 10, cible: CiblePromotion.PRODUIT, produitIds: [],
        dateDebut: new Date().toISOString().slice(0, 10), dateFin: '',
        limiteUtilisation: null, estActive: true,
      });
    }
  }

  toggleProduit(id: string, checked: boolean): void {
    const control = this.form.get('produitIds')!;
    const courant: string[] = control.value ?? [];
    control.setValue(checked ? [...courant, id] : courant.filter((c) => c !== id));
  }

  estProduitCoche(id: string): boolean {
    return (this.form.get('produitIds')!.value ?? []).includes(id);
  }

  get titre(): string {
    return this.promotionAEditer ? 'Modifier la promotion' : 'Créer une promotion';
  }

  onSubmit(): void {
    if (this.form.get('cible')?.value === CiblePromotion.PRODUIT && (this.form.get('produitIds')?.value ?? []).length === 0) {
      alert('Sélectionnez au moins un produit pour cette promotion.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({
      nom: v.nom!,
      code: v.utiliseCode ? (v.code || null) : null,
      typeReduction: v.typeReduction!,
      valeur: v.valeur!,
      cible: v.cible!,
      produitIds: v.cible === CiblePromotion.PRODUIT ? v.produitIds! : [],
      dateDebut: new Date(v.dateDebut!).toISOString(),
      dateFin: v.dateFin ? new Date(v.dateFin).toISOString() : null,
      limiteUtilisation: v.limiteUtilisation,
      estActive: v.estActive!,
    });
  }
}
