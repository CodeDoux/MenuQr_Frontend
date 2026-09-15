import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { PlatformAdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, BadgeComponent],
  templateUrl: './admin-accounts.component.html',
  styleUrl: './admin-accounts.component.css',
})
export class AdminAccountsComponent {
  readonly comptes;
  formOuvert = signal(false);
  private readonly fb = new FormBuilder();

  form = this.fb.group({
    nomComplet: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private readonly service: PlatformAdminService) {
    this.comptes = this.service.comptesAdmin;
  }

  ouvrirCreation(): void {
    this.form.reset();
    this.formOuvert.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.service.creerCompteAdmin({ nomComplet: this.form.value.nomComplet!, email: this.form.value.email! });
    this.formOuvert.set(false);
  }

  basculerActif(id: string): void {
    this.service.basculerActifCompte(id);
  }

  supprimer(id: string, nom: string): void {
    if (confirm(`Supprimer le compte admin "${nom}" ?`)) {
      this.service.supprimerCompteAdmin(id);
    }
  }
}