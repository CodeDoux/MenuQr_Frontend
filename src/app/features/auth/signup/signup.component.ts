import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function motsDePasseIdentiques(control: AbstractControl): ValidationErrors | null {
  const mdp = control.get('motDePasse')?.value;
  const confirmation = control.get('confirmationMotDePasse')?.value;
  return mdp === confirmation ? null : { mismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  private readonly fb = new FormBuilder();

  form = this.fb.group(
    {
      restaurantNom: ['', Validators.required],
      restaurantAdresse: ['', Validators.required],
      restaurantTelephone: ['', Validators.required],
      nomComplet: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmationMotDePasse: ['', Validators.required],
    },
    { validators: motsDePasseIdentiques }
  );

  enCours = signal(false);
  erreur = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.hasError('mismatch')) {
        this.form.get('confirmationMotDePasse')?.setErrors({ mismatch: true });
      }
      return;
    }
    this.erreur.set(null);
    this.enCours.set(true);
    try {
      await this.auth.inscrireRestaurant({
        restaurantNom: this.form.value.restaurantNom!,
        restaurantAdresse: this.form.value.restaurantAdresse!,
        restaurantTelephone: this.form.value.restaurantTelephone!,
        nomComplet: this.form.value.nomComplet!,
        email: this.form.value.email!,
        motDePasse: this.form.value.motDePasse!,
        confirmationMotDePasse: this.form.value.confirmationMotDePasse!,
      });
      window.location.href = '/dashboard';
    } catch (e) {
      this.erreur.set((e as Error).message);
    } finally {
      this.enCours.set(false);
    }
  }
}