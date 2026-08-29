import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationBellComponent } from '../../features/notifications/notification-bell/notification-bell.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-saas-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './saas-layout.component.html',
  styleUrl: './saas-layout.component.css',
})
export class SaasLayoutComponent {
  readonly currentUser;

  readonly navItems = [
    { label: 'Tableau de bord', icon: '◱', route: '/dashboard' },
    { label: 'Menus', icon: '☰', route: '/menus' },
    { label: 'Produits', icon: '◈', route: '/produits' },
    { label: 'Tables & QR', icon: '▦', route: '/tables' },
    { label: 'Commandes', icon: '▤', route: '/commandes' },
    { label: 'Livraisons', icon: '🛵', route: '/livraisons' },
    { label: 'Paiements', icon: '◈', route: '/paiements' },
    { label: 'Factures', icon: '▧', route: '/factures' },
    { label: 'Employés', icon: '◉', route: '/employes' },
    { label: 'Promotions', icon: '★', route: '/promotions' },
    { label: 'Statistiques', icon: '◧', route: '/statistiques' },
    { label: 'Abonnement', icon: '◆', route: '/abonnement' },
    { label: 'Journal d\'activité', icon: '☰', route: '/journal' },
    { label: 'Paramètres', icon: '⚙', route: '/parametres' },
  ];

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
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
    this.router.navigate(['/login']);
  }
}