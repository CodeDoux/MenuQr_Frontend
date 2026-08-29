import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = new FormBuilder();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required]],
  });

  enCours = signal(false);
  erreur = signal<string | null>(null);
  restaurantsAChoisir = signal<{ id: string; nom: string }[] | null>(null);

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
      const resultat = await this.auth.login({
        email: this.form.value.email!,
        motDePasse: this.form.value.motDePasse!,
      });

      if ('choixRestaurant' in resultat) {
        this.restaurantsAChoisir.set(resultat.choixRestaurant);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } catch (e: any) {
      this.erreur.set(e?.error?.message ?? 'Email ou mot de passe incorrect.');
    } finally {
      this.enCours.set(false);
    }
  }

  async choisirRestaurant(restaurantId: string): Promise<void> {
    this.enCours.set(true);
    try {
      await this.auth.selectRestaurant(restaurantId);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.erreur.set('Impossible de sélectionner ce restaurant.');
    } finally {
      this.enCours.set(false);
    }
  }
}