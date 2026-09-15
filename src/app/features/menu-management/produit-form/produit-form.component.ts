import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Produit, ProduitFormPayload } from '../../../core/models/produit';
import { Categorie } from '../../../core/models/categorie';
import { environment } from '../../../../environments/environment';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './produit-form.component.html',
  styleUrl: './produit-form.component.css',
})
export class ProduitFormComponent implements OnChanges {
  @Input() ouvert = false;
  @Input() produitAEditer: Produit | null = null;
  @Input() categoriesDisponibles: Categorie[] = [];
  @Output() fermer = new EventEmitter<void>();
  @Output() valider = new EventEmitter<ProduitFormPayload>();

  private readonly fb = new FormBuilder();
  uploadEnCours = signal(false);

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(80)]],
    description: [''],
    prix: [0, [Validators.required, Validators.min(0)]],
    tempsPreparation: [null as number | null],
    estDisponible: [true],
    estVisible: [true],
    estPopulaire: [false],
    categorieIds: this.fb.control<string[]>([], Validators.required),
    variantes: this.fb.array<ReturnType<typeof this.creerLigneVariante>>([]),
    images: this.fb.array<ReturnType<typeof this.creerLigneImage>>([]),
  });

  constructor(private readonly http: HttpClient) {}

  get variantes(): FormArray {
    return this.form.get('variantes') as FormArray;
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  private creerLigneVariante(nom = '', prix = 0, estDisponible = true) {
    return this.fb.group({
      nom: [nom, Validators.required],
      prix: [prix, [Validators.required, Validators.min(0)]],
      estDisponible: [estDisponible],
    });
  }

  private creerLigneImage(url = '', ordreAffichage = 1, estPrincipale = false) {
    return this.fb.group({
      url: [url, [Validators.required]],
      ordreAffichage: [ordreAffichage, [Validators.required, Validators.min(1)]],
      estPrincipale: [estPrincipale],
    });
  }

  ajouterVariante(): void {
    this.variantes.push(this.creerLigneVariante());
  }

  supprimerVariante(index: number): void {
    this.variantes.removeAt(index);
  }

  /** Déclenche le vrai sélecteur de fichiers du système d'exploitation. */
  declencherSelectionFichier(inputFichier: HTMLInputElement): void {
    inputFichier.click();
  }

  /** Téléverse le fichier choisi sur le serveur et ajoute l'image obtenue. */
  async onFichierChoisi(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) return;

    const formData = new FormData();
    formData.append('file', fichier);

    this.uploadEnCours.set(true);
    try {
      const reponse = await firstValueFrom(
        this.http.post<{ url: string }>(`${environment.apiUrl}/uploads/images`, formData)
      );
      const estPremiere = this.images.length === 0;
      this.images.push(this.creerLigneImage(reponse.url, this.images.length + 1, estPremiere));
    } catch {
      alert('Échec du téléversement de l\'image. Vérifie le format (jpg/png/webp) et la taille (max 5 Mo).');
    } finally {
      this.uploadEnCours.set(false);
      input.value = ''; // permet de resélectionner le même fichier si besoin
    }
  }

  supprimerImage(index: number): void {
    this.images.removeAt(index);
  }

  definirImagePrincipale(index: number): void {
    this.images.controls.forEach((ctrl, i) => ctrl.get('estPrincipale')!.setValue(i === index));
  }

  toggleCategorie(id: string, checked: boolean): void {
    const control = this.form.get('categorieIds')!;
    const courant: string[] = control.value ?? [];
    control.setValue(checked ? [...courant, id] : courant.filter((c) => c !== id));
  }

  estCategorieCochee(id: string): boolean {
    return (this.form.get('categorieIds')!.value ?? []).includes(id);
  }

  ngOnChanges(): void {
    this.variantes.clear();
    this.images.clear();

    if (this.produitAEditer) {
      const p = this.produitAEditer;
      this.form.patchValue({
        nom: p.nom,
        description: p.description ?? '',
        prix: p.prix,
        tempsPreparation: p.tempsPreparation ?? null,
        estDisponible: p.estDisponible,
        estVisible: p.estVisible,
        estPopulaire: p.estPopulaire,
        categorieIds: [...p.categorieIds],
      });
      p.variantes.forEach((v) => this.variantes.push(this.creerLigneVariante(v.nom, v.prix, v.estDisponible)));
      p.images.forEach((img) => this.images.push(this.creerLigneImage(img.url, img.ordreAffichage, img.estPrincipale)));
    } else {
      this.form.reset({
        nom: '', description: '', prix: 0, tempsPreparation: null,
        estDisponible: true, estVisible: true, estPopulaire: false, categorieIds: [],
      });
    }
  }

  get titre(): string {
    return this.produitAEditer ? 'Modifier le produit' : 'Créer un produit';
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
      prix: v.prix!,
      tempsPreparation: v.tempsPreparation,
      estDisponible: v.estDisponible!,
      estVisible: v.estVisible!,
      estPopulaire: v.estPopulaire!,
      categorieIds: v.categorieIds!,
      variantes: (v.variantes ?? []).map((ligne: any) => ({
        nom: ligne.nom,
        prix: ligne.prix,
        estDisponible: ligne.estDisponible,
      })),
      images: (v.images ?? []).map((ligne: any) => ({
        url: ligne.url,
        ordreAffichage: ligne.ordreAffichage,
        estPrincipale: ligne.estPrincipale,
      })),
    });
  }
}