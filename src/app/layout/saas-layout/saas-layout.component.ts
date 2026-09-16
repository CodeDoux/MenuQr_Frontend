import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationBellComponent } from '../../features/notifications/notification-bell/notification-bell.component';
import { AuthService } from '../../core/services/auth.service';
import { signal } from '@angular/core'; // déjà importé normalement


@Component({
  selector: 'app-saas-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './saas-layout.component.html',
  styleUrl: './saas-layout.component.css',
})
export class SaasLayoutComponent {
  readonly currentUser;

  readonly navItemsBruts = [
    { label: 'Dashboard', icon: '◱', route: '/dashboard', permission: null },
    { label: 'Menus', icon: '📖', route: '/menus', permission: null },
    { label: 'Produits', icon: '🍽️', route: '/produits', permission: null },
    { label: 'Tables & QR', icon: '⬛', route: '/tables', permission: null },
    { label: 'Commandes', icon: '🧾', route: '/commandes', permission: 'commande.voir' },
    { label: 'Livraisons', icon: '🛵', route: '/livraisons', permission: 'livraison.gerer' },
    { label: 'Employés', icon: '👥', route: '/employes', permission: 'employe.gerer' },
    { label: 'Promotions', icon: '🏷️', route: '/promotions', permission: 'promotion.gerer' },
    { label: 'Statistiques', icon: '📊', route: '/statistiques', permission: 'statistique.consulter' },
    { label: 'Abonnement', icon: '💳', route: '/abonnement', permission: 'abonnement.gerer' },
    { label: 'Paiements', icon: '💰', route: '/paiements', permission: 'facture.consulter' },
    { label: 'Factures', icon: '📄', route: '/factures', permission: 'facture.consulter' },
    { label: 'Journal', icon: '📋', route: '/journal', permission: 'journal.consulter' },
    { label: 'Paramètres', icon: '⚙️', route: '/parametres', permission: 'parametre.gerer' },
  ];

  readonly navItems;
  lienVerification = signal<string | null>(null);

  async demanderVerification(): Promise<void> {
    const lien = await this.auth.demanderVerificationEmail();
    this.lienVerification.set(lien);
  }

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    this.navItems = this.navItemsBruts.filter(
      (item) => item.permission === null || this.auth.hasPermission(item.permission)
    );
    this.currentUser = this.auth.currentUser;
  }

  initiales(): string {
    const nom = this.currentUser()?.nomComplet ?? '';
    return nom
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

 deconnexion(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}