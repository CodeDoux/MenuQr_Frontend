import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminLoginPayload, AdminUtilisateur } from '../models/auth-admin';

const TOKEN_STORAGE_KEY = 'menuqr_admin_api_token';
const ADMIN_STORAGE_KEY = 'menuqr_admin_current';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly _currentAdmin = signal<AdminUtilisateur | null>(this.chargerDepuisStockage());

  readonly currentAdmin = this._currentAdmin.asReadonly();
  readonly isAuthenticated = computed(() => this._currentAdmin() !== null);

  constructor(private readonly http: HttpClient) {}

  async login(payload: AdminLoginPayload): Promise<AdminUtilisateur> {
    const reponse = await firstValueFrom(
      this.http.post<{ token: string; admin: { id: string; nom_complet: string; email: string } }>(
        `${environment.apiUrl}/admin/login`,
        { email: payload.email, password: payload.motDePasse }
      )
    );

    const admin: AdminUtilisateur = {
      id: reponse.admin.id, nomComplet: reponse.admin.nom_complet, email: reponse.admin.email,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, reponse.token);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    this._currentAdmin.set(admin);

    return admin;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/admin/logout`, {}));
    } finally {
      this._currentAdmin.set(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }

  private chargerDepuisStockage(): AdminUtilisateur | null {
    try {
      const brut = localStorage.getItem(ADMIN_STORAGE_KEY);
      return brut ? (JSON.parse(brut) as AdminUtilisateur) : null;
    } catch {
      return null;
    }
  }
}