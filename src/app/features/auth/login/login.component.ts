import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
      await this.auth.login({
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

  remplirDemo(email: string): void {
    this.form.patchValue({ email, motDePasse: 'password123' });
  }
}
