import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleCode } from '../enums/enums';
import { LoginPayload, UtilisateurConnecte } from '../models/auth';

const TOKEN_STORAGE_KEY = 'menuqr_api_token';
const USER_STORAGE_KEY = 'menuqr_current_user';

interface LoginResponseMonoRestaurant {
  token: string;
  user: { id: string; nom_complet: string; email: string };
  restaurant: { id: string; nom: string };
}

interface LoginResponseMultiRestaurant {
  pre_auth_token: string;
  restaurants: { id: string; nom: string }[];
}

/**
 * ⚠️ État hybride, temporaire : login/logout/selectRestaurant appellent
 * désormais la vraie API Laravel. Le reste (inscription, invitation, profil)
 * reste en mock en attendant d'être branché à son tour — pour ne pas casser
 * les composants qui en dépendent déjà.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<UtilisateurConnecte | null>(this.chargerDepuisStockage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor(private readonly http: HttpClient) {}

  // ============================================================
  // RÉEL — branché sur l'API Laravel
  // ============================================================

  async login(payload: LoginPayload): Promise<UtilisateurConnecte | { choixRestaurant: { id: string; nom: string }[] }> {
    const reponse = await firstValueFrom(
      this.http.post<LoginResponseMonoRestaurant | LoginResponseMultiRestaurant>(
        `${environment.apiUrl}/auth/login`,
        { email: payload.email, password: payload.motDePasse }
      )
    );

    if ('pre_auth_token' in reponse) {
      localStorage.setItem(TOKEN_STORAGE_KEY, reponse.pre_auth_token);
      return { choixRestaurant: reponse.restaurants };
    }

    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant);
  }

  async selectRestaurant(restaurantId: string): Promise<UtilisateurConnecte> {
    const reponse = await firstValueFrom(
      this.http.post<LoginResponseMonoRestaurant>(`${environment.apiUrl}/auth/select-restaurant`, {
        restaurant_id: restaurantId,
      })
    );

    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}));
    } finally {
      this._currentUser.set(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  private finaliserConnexion(
    token: string,
    user: { id: string; nom_complet: string; email: string },
    restaurant: { id: string; nom: string }
  ): UtilisateurConnecte {
    // ⚠️ Rôle/permissions pas encore renvoyés par /auth/login côté backend —
    // placeholder en attendant, pour ne pas casser sidebar/nav en attendant.
    const utilisateur: UtilisateurConnecte = {
      id: user.id,
      nomComplet: user.nom_complet,
      email: user.email,
      restaurantId: restaurant.id,
      restaurantNom: restaurant.nom,
      role: RoleCode.PROPRIETAIRE,
      permissions: [],
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(utilisateur));
    this._currentUser.set(utilisateur);

    return utilisateur;
  }

  hasPermission(code: string): boolean {
    // ⚠️ Toujours vrai temporairement (permissions pas encore renvoyées par
    // l'API) — à corriger dès que /auth/login inclura le rôle/permissions.
    return true;
  }

  private chargerDepuisStockage(): UtilisateurConnecte | null {
    try {
      const brut = localStorage.getItem(USER_STORAGE_KEY);
      return brut ? (JSON.parse(brut) as UtilisateurConnecte) : null;
    } catch {
      return null;
    }
  }

  // ============================================================
  // ⚠️ MOCK — pas encore branchés sur l'API, à faire dans une prochaine étape
  // ============================================================

  inscrireRestaurant(payload: { nomComplet: string; email: string; motDePasse: string; restaurantNom: string }): Promise<UtilisateurConnecte> {
    return new Promise((resolve) => {
      const utilisateur: UtilisateurConnecte = {
        id: 'mock-' + Math.random().toString(36).slice(2, 10),
        nomComplet: payload.nomComplet, email: payload.email,
        restaurantId: 'rest-001', restaurantNom: payload.restaurantNom,
        role: RoleCode.PROPRIETAIRE, permissions: [],
      };
      this._currentUser.set(utilisateur);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(utilisateur));
      setTimeout(() => resolve(utilisateur), 400);
    });
  }

  creerCompteInvite(input: { email: string; nomComplet: string; motDePasse: string; role: RoleCode; restaurantNom: string }): UtilisateurConnecte {
    const utilisateur: UtilisateurConnecte = {
      id: 'mock-' + Math.random().toString(36).slice(2, 10),
      nomComplet: input.nomComplet, email: input.email,
      restaurantId: 'rest-001', restaurantNom: input.restaurantNom,
      role: input.role, permissions: [],
    };
    this._currentUser.set(utilisateur);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(utilisateur));
    return utilisateur;
  }

  modifierProfil(nomComplet: string, email: string): void {
    const utilisateur = this._currentUser();
    if (!utilisateur) return;
    const maj = { ...utilisateur, nomComplet, email };
    this._currentUser.set(maj);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(maj));
  }

  changerMotDePasse(_ancien: string, _nouveau: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  demanderReinitialisation(_email: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 600));
  }

  reinitialiserMotDePasse(_token: string, _nouveau: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 600));
  }

  // ⚠️ Ajoute ces 2 méthodes dans la section "RÉEL" de auth.service.ts
// (juste après selectRestaurant, par exemple), et RETIRE l'ancienne méthode
// mock `creerCompteInvite` de la section MOCK plus bas (remplacée par
// `accepterInvitation` ci-dessous, qui appelle le vrai backend).

  async chargerInvitation(employeId: string): Promise<{ nomComplet: string; role: string; restaurantNom: string } | null> {
    try {
      const rep = await firstValueFrom(
        this.http.get<{ nom_complet: string; role: string; restaurant_nom: string }>(
          `${environment.apiUrl}/invitations/${employeId}`
        )
      );
      return { nomComplet: rep.nom_complet, role: rep.role, restaurantNom: rep.restaurant_nom };
    } catch {
      return null;
    }
  }

  async accepterInvitation(employeId: string, motDePasse: string, confirmation: string): Promise<UtilisateurConnecte> {
    const reponse = await firstValueFrom(
      this.http.post<{
        token: string;
        user: { id: string; nom_complet: string; email: string };
        restaurant: { id: string; nom: string };
      }>(`${environment.apiUrl}/invitations/${employeId}/accepter`, {
        password: motDePasse,
        password_confirmation: confirmation,
      })
    );

    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant);
  }
}