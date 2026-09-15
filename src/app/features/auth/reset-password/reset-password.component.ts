import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function motsDePasseIdentiques(control: AbstractControl): ValidationErrors | null {
  const nouveau = control.get('nouveauMotDePasse')?.value;
  const confirmation = control.get('confirmation')?.value;
  return nouveau === confirmation ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly fb = new FormBuilder();

  form = this.fb.group(
    {
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmation: ['', Validators.required],
    },
    { validators: motsDePasseIdentiques }
  );

  email = '';
  token = '';
  enCours = signal(false);
  erreur = signal<string | null>(null);
  succes = signal(false);
  lienInvalide = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.email || !this.token) {
      this.lienInvalide.set(true);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.hasError('mismatch')) {
        this.form.get('confirmation')?.setErrors({ mismatch: true });
      }
      return;
    }
    this.erreur.set(null);
    this.enCours.set(true);
    try {
      await this.auth.reinitialiserMotDePasse(
        this.email,
        this.token,
        this.form.value.nouveauMotDePasse!,
        this.form.value.confirmation!
      );
      this.succes.set(true);
      setTimeout(() => this.router.navigate(['/login']), 2000);
    } catch (e: any) {
      this.erreur.set(e?.error?.errors?.token?.[0] ?? 'Une erreur est survenue.');
    } finally {
      this.enCours.set(false);
    }
  }
}