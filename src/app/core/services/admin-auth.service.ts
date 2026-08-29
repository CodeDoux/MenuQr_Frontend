import { Injectable, computed, signal } from '@angular/core';
import { AdminLoginPayload, AdminUtilisateur } from '../models/auth-admin';

/**
 * ⚠️ MOCK — Auth admin plateforme, volontairement séparée de AuthService
 * (comptes restaurant). Décision actée : login dédié, pas de rôle mêlé aux
 * comptes restaurant.
 */

const STORAGE_KEY = 'menuqr_admin_auth_mock';

const COMPTES_DEMO: Array<{ email: string; motDePasse: string; user: AdminUtilisateur }> = [
  {
    email: 'admin@menuqr.com',
    motDePasse: 'admin123',
    user: { id: 'admin-001', nomComplet: 'Équipe MenuQr', email: 'admin@menuqr.com' },
  },
];

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly _currentAdmin = signal<AdminUtilisateur | null>(this.chargerDepuisStockage());

  readonly currentAdmin = this._currentAdmin.asReadonly();
  readonly isAuthenticated = computed(() => this._currentAdmin() !== null);

  login(payload: AdminLoginPayload): Promise<AdminUtilisateur> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const compte = COMPTES_DEMO.find(
          (c) => c.email.toLowerCase() === payload.email.trim().toLowerCase() && c.motDePasse === payload.motDePasse
        );
        if (!compte) {
          reject(new Error('Email ou mot de passe incorrect.'));
          return;
        }
        this._currentAdmin.set(compte.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compte.user));
        resolve(compte.user);
      }, 500);
    });
  }

  logout(): void {
    this._currentAdmin.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private chargerDepuisStockage(): AdminUtilisateur | null {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      return brut ? (JSON.parse(brut) as AdminUtilisateur) : null;
    } catch {
      return null;
    }
  }
}