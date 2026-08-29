import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accept-invitation.component.html',
})
export class AcceptInvitationComponent implements OnInit {
  private readonly fb = new FormBuilder();
  form = this.fb.group({
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required],
  });

  employeId = '';
  invitation = signal<{ nomComplet: string; role: string; restaurantNom: string } | null>(null);
  invitationValide = signal(false);
  chargementInitial = signal(true);
  erreur = signal<string | null>(null);
  enCours = signal(false);

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.employeId = this.route.snapshot.paramMap.get('employeId') ?? '';
    const invitation = await this.auth.chargerInvitation(this.employeId);
    this.invitation.set(invitation);
    this.invitationValide.set(invitation !== null);
    this.chargementInitial.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.value.motDePasse !== this.form.value.confirmation) {
      this.erreur.set('La confirmation ne correspond pas.');
      return;
    }
    this.erreur.set(null);
    this.enCours.set(true);
    try {
      await this.auth.accepterInvitation(this.employeId, this.form.value.motDePasse!, this.form.value.confirmation!);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.erreur.set(e?.error?.message ?? 'Cette invitation n\'est plus valide.');
    } finally {
      this.enCours.set(false);
    }
  }
}