import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mon-profil.component.html',
})
export class MonProfilComponent {
  readonly currentUser;
  private readonly fb = new FormBuilder();

  formProfil = this.fb.group({
    nomComplet: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  formMotDePasse = this.fb.group({
    ancienMotDePasse: ['', Validators.required],
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required],
  });

  profilEnregistre = signal(false);
  motDePasseEnCours = signal(false);
  motDePasseMessage = signal<string | null>(null);

  constructor(private readonly auth: AuthService) {
    this.currentUser = this.auth.currentUser;
    const u = this.currentUser();
    if (u) this.formProfil.patchValue({ nomComplet: u.nomComplet, email: u.email });
  }

  enregistrerProfil(): void {
    if (this.formProfil.invalid) {
      this.formProfil.markAllAsTouched();
      return;
    }
    this.auth.modifierProfil(this.formProfil.value.nomComplet!, this.formProfil.value.email!);
    this.profilEnregistre.set(true);
    setTimeout(() => this.profilEnregistre.set(false), 2500);
  }

  async changerMotDePasse(): Promise<void> {
    this.motDePasseMessage.set(null);
    if (this.formMotDePasse.invalid) {
      this.formMotDePasse.markAllAsTouched();
      return;
    }
    if (this.formMotDePasse.value.nouveauMotDePasse !== this.formMotDePasse.value.confirmation) {
      this.motDePasseMessage.set('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    this.motDePasseEnCours.set(true);
    await this.auth.changerMotDePasse(
      this.formMotDePasse.value.ancienMotDePasse!,
      this.formMotDePasse.value.nouveauMotDePasse!
    );
    this.motDePasseEnCours.set(false);
    this.motDePasseMessage.set('✓ Mot de passe mis à jour (simulation).');
    this.formMotDePasse.reset();
  }
}