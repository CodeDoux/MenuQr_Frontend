import { Injectable, computed, signal } from '@angular/core';
import { RoleCode } from '../enums/enums';
import { LoginPayload, UtilisateurConnecte } from '../models/auth';


/**
 * ⚠️ MOCK — Service d'authentification temporaire, en attendant l'API réelle.
 *
 * Le contrat public (login/logout/currentUser/isAuthenticated/hasPermission)
 * est pensé pour rester identique une fois branché sur un vrai backend :
 * seul le corps de `login()` changera (appel HTTP + stockage du vrai JWT
 * au lieu de cette simulation en mémoire/localStorage).
 *
 * ⚠️ Permissions par rôle : liste PROVISOIRE, non validée dans le diagramme
 * de classes (seuls quelques exemples de codes existent : commande.voir,
 * menu.creer, etc.). À ajuster dès que la liste complète des permissions
 * sera confirmée.
 */

const STORAGE_KEY = 'menuqr_auth_mock';

const PERMISSIONS_PAR_ROLE: Record<RoleCode, string[]> = {
  [RoleCode.PROPRIETAIRE]: [
    'menu.creer', 'menu.modifier', 'menu.supprimer',
    'commande.voir', 'commande.annuler',
    'paiement.effectuer', 'statistique.consulter',
    'livraison.modifier_statut', 'employe.gerer', 'abonnement.gerer',
  ],
  [RoleCode.GERANT]: [
    'menu.creer', 'menu.modifier',
    'commande.voir', 'commande.annuler',
    'statistique.consulter', 'livraison.modifier_statut', 'employe.gerer',
  ],
  [RoleCode.SERVEUR]: ['commande.voir', 'livraison.modifier_statut'],
  [RoleCode.CUISINIER]: ['commande.voir'],
  [RoleCode.CAISSIER]: ['commande.voir', 'paiement.effectuer'],
  [RoleCode.LIVREUR]: ['commande.voir', 'livraison.modifier_statut'],
};

/** Comptes de démonstration — à retirer une fois l'API branchée */
const COMPTES_DEMO: Array<{ email: string; motDePasse: string; user: UtilisateurConnecte }> = [
  {
    email: 'proprietaire@lepalais.sn',
    motDePasse: 'password123',
    user: {
      id: 'user-001', nomComplet: 'Amadou Diallo', email: 'proprietaire@lepalais.sn',
      restaurantId: 'rest-001', restaurantNom: 'Le Palais',
      role: RoleCode.PROPRIETAIRE, permissions: PERMISSIONS_PAR_ROLE[RoleCode.PROPRIETAIRE],
    },
  },
  {
    email: 'serveur@lepalais.sn',
    motDePasse: 'password123',
    user: {
      id: 'user-002', nomComplet: 'Fatou Ndiaye', email: 'serveur@lepalais.sn',
      restaurantId: 'rest-001', restaurantNom: 'Le Palais',
      role: RoleCode.SERVEUR, permissions: PERMISSIONS_PAR_ROLE[RoleCode.SERVEUR],
    },
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<UtilisateurConnecte | null>(this.chargerDepuisStockage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /** Simule un appel réseau (délai artificiel) puis résout/rejette selon les comptes de démo. */
  login(payload: LoginPayload): Promise<UtilisateurConnecte> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const compte = COMPTES_DEMO.find(
          (c) => c.email.toLowerCase() === payload.email.trim().toLowerCase() && c.motDePasse === payload.motDePasse
        );
        if (!compte) {
          reject(new Error('Email ou mot de passe incorrect.'));
          return;
        }
        this._currentUser.set(compte.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compte.user));
        resolve(compte.user);
      }, 500);
    });
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  hasPermission(code: string): boolean {
    return this._currentUser()?.permissions.includes(code) ?? false;
  }

  private chargerDepuisStockage(): UtilisateurConnecte | null {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      return brut ? (JSON.parse(brut) as UtilisateurConnecte) : null;
    } catch {
      return null;
    }
  }
}
