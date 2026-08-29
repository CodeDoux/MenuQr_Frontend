import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  readonly currentAdmin;

  readonly navItems = [
    { label: 'Dashboard', icon: '◱', route: '/admin/dashboard' },
    { label: 'Restaurants', icon: '🏬', route: '/admin/restaurants' },
    { label: 'Offres & Plans', icon: '◆', route: '/admin/offres' },
    { label: 'Abonnements', icon: '▧', route: '/admin/abonnements' },
    { label: 'Administrateurs', icon: '◉', route: '/admin/administrateurs' },
  ];

  constructor(
    private readonly auth: AdminAuthService,
    private readonly router: Router
  ) {
    this.currentAdmin = this.auth.currentAdmin;
  }

  deconnexion(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}