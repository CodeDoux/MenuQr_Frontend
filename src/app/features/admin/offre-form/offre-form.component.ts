import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Offre, OffreFormPayload } from '../../../core/models/subcription';
import { StatutPlan } from '../../../core/enums/enums';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './offre-form.component.html',
})
export class OffreFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() offreAEditer: Offre | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<OffreFormPayload>();

  private readonly fb = new FormBuilder();
  readonly StatutPlan = StatutPlan;

  form = this.fb.group({
    nom: ['', Validators.required],
    description: [''],
    prixMensuel: [15000, [Validators.required, Validators.min(0)]],
    prixAnnuel: [null as number | null],
    dureeEssai: [14 as number | null],
    statut: [StatutPlan.ACTIF, Validators.required],
    ordreAffichage: [1, Validators.required],
    fonctionnalitesTexte: [''],
    limiteTables: [10, Validators.required],
    limiteEmployes: [5, Validators.required],
  });

  ngOnChanges(): void {
  if (this.offreAEditer) {
    const o: any = this.offreAEditer;
    this.form.patchValue({
      nom: o.nom,
      description: o.description ?? '',
      prixMensuel: o.prix_mensuel,
      prixAnnuel: o.prix_annuel ?? null,
      dureeEssai: o.duree_essai ?? null,
      statut: o.statut,
      ordreAffichage: o.ordre_affichage,
      fonctionnalitesTexte: (o.fonctionnalites ?? []).join('\n'),
      limiteTables: o.limites?.find((l: any) => l.nom === 'Tables')?.valeur ?? 10,
      limiteEmployes: o.limites?.find((l: any) => l.nom === 'Employés')?.valeur ?? 5,
    });
  } else {
    this.form.reset({
      nom: '', description: '', prixMensuel: 15000, prixAnnuel: null, dureeEssai: 14,
      statut: this.StatutPlan.ACTIF, ordreAffichage: 1, fonctionnalitesTexte: '',
      limiteTables: 10, limiteEmployes: 5,
    });
  }
}

  get titre(): string {
    return this.offreAEditer ? 'Modifier l\'offre' : 'Créer une offre';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.valider.emit({
      nom: v.nom!, description: v.description || null, prixMensuel: v.prixMensuel!,
      prixAnnuel: v.prixAnnuel, devise: 'FCFA', dureeEssai: v.dureeEssai,
      statut: v.statut!, ordreAffichage: v.ordreAffichage!,
      fonctionnalites: v.fonctionnalitesTexte!.split('\n').map((f) => f.trim()).filter(Boolean),
      limites: [
        { nom: 'Tables', valeur: v.limiteTables!, unite: 'tables' },
        { nom: 'Employés', valeur: v.limiteEmployes!, unite: 'employés' },
      ],
    });
  }
}