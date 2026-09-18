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
  user: { id: string; nom_complet: string; email: string; email_verifie?: boolean };
  restaurant: { id: string; nom: string };
  role: string;
  permissions: string[];
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

    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant, reponse.role, reponse.permissions);
  }

  async selectRestaurant(restaurantId: string): Promise<UtilisateurConnecte> {
    const reponse = await firstValueFrom(
      this.http.post<LoginResponseMonoRestaurant>(`${environment.apiUrl}/auth/select-restaurant`, {
        restaurant_id: restaurantId,
      })
    );

    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant, reponse.role, reponse.permissions);
  }


  /** Admin uniquement : se connecte TEMPORAIREMENT à la place d'un
   *  restaurant pour l'assister. Utilise le token ADMIN actuel pour
   *  l'appel (intercepteur), puis bascule sur le nouveau token restaurant
   *  reçu — mêmes clés de stockage qu'une connexion normale. */
  async impersonerRestaurant(restaurantId: string): Promise<UtilisateurConnecte> {
    const reponse = await firstValueFrom(
      this.http.post<LoginResponseMonoRestaurant>(
        `${environment.apiUrl}/admin/restaurants/${restaurantId}/impersonate`,
        {}
      )
    );
 
    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant, reponse.role, reponse.permissions);
  }

  private finaliserConnexion(
    token: string,
    user: { id: string; nom_complet: string; email: string; email_verifie?: boolean },
    restaurant: { id: string; nom: string },
    role: string,
    permissions: string[]
  ): UtilisateurConnecte {
    const utilisateur: UtilisateurConnecte = {
      id: user.id,
      nomComplet: user.nom_complet,
      email: user.email,
      emailVerifie: user.email_verifie ?? true, // true par défaut si absent (ex. anciens comptes)
      restaurantId: restaurant.id,
      restaurantNom: restaurant.nom,
      role: role as any,
      permissions: permissions,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(utilisateur));
    this._currentUser.set(utilisateur);

    return utilisateur;
  }

  hasPermission(code: string): boolean {
    return this._currentUser()?.permissions.includes(code) ?? false;
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

  private chargerDepuisStockage(): UtilisateurConnecte | null {
    try {
      const brut = localStorage.getItem(USER_STORAGE_KEY);
      return brut ? (JSON.parse(brut) as UtilisateurConnecte) : null;
    } catch {
      return null;
    }
  }

  // ============================================================
  // Vérification d'email — jamais bloquant, simple rappel (décision actée)
  // ============================================================

  /** Demande un nouveau lien de vérification pour l'utilisateur CONNECTÉ — envoyé par email désormais. */
  async demanderVerificationEmail(): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/renvoyer-verification-email`, {})
    );
  }

  /** Appelée depuis la page publique de vérification (lien cliqué). */
  async verifierEmailAvecToken(email: string, token: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/verifier-email`, { email, token })
    );

    // Si l'utilisateur est toujours connecté dans cet onglet, on met à jour
    // son état local pour faire disparaître le bandeau immédiatement.
    const utilisateurActuel = this._currentUser();
    if (utilisateurActuel && utilisateurActuel.email === email) {
      const misAJour = { ...utilisateurActuel, emailVerifie: true };
      this._currentUser.set(misAJour);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(misAJour));
    }
  }

  // ============================================================
  // ⚠️ MOCK — pas encore branchés sur l'API, à faire dans une prochaine étape
  // ============================================================

  async inscrireRestaurant(payload: {
    restaurantNom: string;
    restaurantAdresse: string;
    restaurantTelephone: string;
    nomComplet: string;
    email: string;
    motDePasse: string;
    confirmationMotDePasse: string;
  }): Promise<UtilisateurConnecte> {
    const offres = await firstValueFrom(
      this.http.get<{ data: any[] }>(`${environment.apiUrl}/offres`)
    );
    const offreId = offres.data[0]?.id;
    if (!offreId) {
      throw new Error('Aucune offre disponible pour le moment. Contactez le support.');
    }

    const reponse = await firstValueFrom(
      this.http.post<{
        token: string;
        user: { id: string; nom_complet: string; email: string; email_verifie?: boolean };
        restaurant: { id: string; nom: string };
        role: string;
        permissions: string[];
      }>(`${environment.apiUrl}/auth/register`, {
        nom_complet: payload.nomComplet,
        email: payload.email,
        password: payload.motDePasse,
        password_confirmation: payload.confirmationMotDePasse,
        restaurant_nom: payload.restaurantNom,
        restaurant_adresse: payload.restaurantAdresse,
        restaurant_telephone: payload.restaurantTelephone,
        offre_id: offreId,
      })
    );

    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant, reponse.role, reponse.permissions);
  }

  creerCompteInvite(input: { email: string; nomComplet: string; motDePasse: string; role: RoleCode; restaurantNom: string }): UtilisateurConnecte {
    const utilisateur: UtilisateurConnecte = {
      id: 'mock-' + Math.random().toString(36).slice(2, 10),
      nomComplet: input.nomComplet, email: input.email, emailVerifie: true,
      restaurantId: 'rest-001', restaurantNom: input.restaurantNom,
      role: input.role, permissions: [],
    };
    this._currentUser.set(utilisateur);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(utilisateur));
    return utilisateur;
  }

  async modifierProfil(nomComplet: string, email: string): Promise<void> {
    const rep = await firstValueFrom(
      this.http.put<{ user: { id: string; nom_complet: string; email: string } }>(
        `${environment.apiUrl}/auth/profil`,
        { nom_complet: nomComplet, email: email }
      )
    );
    const utilisateurActuel = this._currentUser();
    if (utilisateurActuel) {
      const misAJour = { ...utilisateurActuel, nomComplet: rep.user.nom_complet, email: rep.user.email };
      this._currentUser.set(misAJour);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(misAJour));
    }
  }

  async demanderReinitialisation(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/mot-de-passe-oublie`, { email })
    );
  }

  async reinitialiserMotDePasse(
    email: string,
    token: string,
    nouveauMotDePasse: string,
    confirmation: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/auth/reinitialiser-mot-de-passe`, {
        email, token,
        nouveau_mot_de_passe: nouveauMotDePasse,
        nouveau_mot_de_passe_confirmation: confirmation,
      })
    );
  }

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
        user: { id: string; nom_complet: string; email: string; email_verifie?: boolean };
        restaurant: { id: string; nom: string };
        role: string;
        permissions: string[];
      }>(`${environment.apiUrl}/invitations/${employeId}/accepter`, {
        password: motDePasse,
        password_confirmation: confirmation,
      })
    );

    return this.finaliserConnexion(reponse.token, reponse.user, reponse.restaurant, reponse.role, reponse.permissions);
  }

  async changerMotDePasse(
    motDePasseActuel: string,
    nouveauMotDePasse: string,
    confirmation: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.put(`${environment.apiUrl}/auth/mot-de-passe`, {
        mot_de_passe_actuel: motDePasseActuel,
        nouveau_mot_de_passe: nouveauMotDePasse,
        nouveau_mot_de_passe_confirmation: confirmation,
      })
    );
  }
}