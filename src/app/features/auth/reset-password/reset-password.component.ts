import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly fb = new FormBuilder();
  form = this.fb.group({
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required],
  });

  enCours = signal(false);
  erreur = signal<string | null>(null);
  token = '';

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.value.nouveauMotDePasse !== this.form.value.confirmation) {
      this.erreur.set('La confirmation ne correspond pas.');
      return;
    }
    this.erreur.set(null);
    this.enCours.set(true);
    await this.auth.reinitialiserMotDePasse(this.token, this.form.value.nouveauMotDePasse!);
    this.enCours.set(false);
    this.router.navigate(['/login']);
  }
}