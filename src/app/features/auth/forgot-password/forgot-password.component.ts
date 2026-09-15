import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = new FormBuilder();
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  enCours = signal(false);
  envoye = signal(false);
  lienReinitialisation = signal<string | null>(null);

  constructor(private readonly auth: AuthService) {}

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enCours.set(true);
    const lien = await this.auth.demanderReinitialisation(this.form.value.email!);
    this.lienReinitialisation.set(lien);
    this.enCours.set(false);
    this.envoye.set(true);
  }

  copierLien(): void {
    const lien = this.lienReinitialisation();
    if (lien) navigator.clipboard?.writeText(lien).catch(() => {});
  }
}