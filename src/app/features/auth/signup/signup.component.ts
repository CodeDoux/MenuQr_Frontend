import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private readonly fb = new FormBuilder();

  form = this.fb.group({
    restaurantNom: ['', Validators.required],
    nomComplet: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
  });

  enCours = signal(false);
  erreur = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.erreur.set(null);
    this.enCours.set(true);
    try {
      await this.auth.inscrireRestaurant({
        restaurantNom: this.form.value.restaurantNom!,
        nomComplet: this.form.value.nomComplet!,
        email: this.form.value.email!,
        motDePasse: this.form.value.motDePasse!,
      });
      this.router.navigate(['/dashboard']);
    } catch (e) {
      this.erreur.set((e as Error).message);
    } finally {
      this.enCours.set(false);
    }
  }
}