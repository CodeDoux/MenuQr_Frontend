import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verification-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verification-email.component.html',
})
export class VerificationEmailComponent implements OnInit {
  statut = signal<'en_cours' | 'succes' | 'erreur'>('en_cours');
  messageErreur = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.statut.set('erreur');
      this.messageErreur.set('Lien invalide.');
      return;
    }

    try {
      await this.auth.verifierEmailAvecToken(email, token);
      this.statut.set('succes');
    } catch (e: any) {
      this.statut.set('erreur');
      this.messageErreur.set(e?.error?.errors?.token?.[0] ?? 'Ce lien est invalide ou a expiré.');
    }
  }
}