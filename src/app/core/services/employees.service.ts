import { Injectable, computed, signal } from '@angular/core';
import { AccesPlateforme, Employe, EmployeFormPayload, Poste, PosteFormPayload } from '../models/employe';
import { StatutAcces, StatutEmploye } from '../enums/enums';

/** ⚠️ MOCK DATA — même principe que les autres services du projet. */

const RESTAURANT_ID_COURANT = 'rest-001';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly _postes = signal<Poste[]>(this.seedPostes());
  private readonly _acces = signal<AccesPlateforme[]>([]);
  private readonly _employes = signal<Employe[]>(this.seedEmployes());

  readonly postes = this._postes.asReadonly();
  readonly employes = this._employes.asReadonly();

  readonly employesAvecAcces = computed(() =>
    this._employes().map((e) => ({
      employe: e,
      poste: this._postes().find((p) => p.id === e.posteId),
      acces: this._acces().find((a) => a.id === e.accesPlateformeId),
    }))
  );

  // ============================================================
  // POSTES
  // ============================================================

  creerPoste(payload: PosteFormPayload): Poste {
    const nouveau: Poste = { id: uid('poste'), restaurantId: RESTAURANT_ID_COURANT, ...payload };
    this._postes.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  modifierPoste(id: string, payload: PosteFormPayload): void {
    this._postes.update((liste) => liste.map((p) => (p.id === id ? { ...p, ...payload } : p)));
  }

  supprimerPoste(id: string): void {
    const utilise = this._employes().some((e) => e.posteId === id);
    if (utilise) {
      throw new Error('Ce poste est encore assigné à au moins un employé.');
    }
    this._postes.update((liste) => liste.filter((p) => p.id !== id));
  }

  // ============================================================
  // EMPLOYÉS
  // ============================================================

  creerEmploye(payload: EmployeFormPayload): Employe {
    let accesId: string | null = null;

    if (payload.accorderAcces && payload.role) {
      const acces: AccesPlateforme = {
        id: uid('acces'),
        restaurantId: RESTAURANT_ID_COURANT,
        role: payload.role,
        statut: StatutAcces.INVITE,
        dateInvitation: nowIso(),
        dateAcceptation: null,
      };
      this._acces.update((liste) => [...liste, acces]);
      accesId = acces.id;
    }

    const nouveau: Employe = {
      id: uid('emp'),
      restaurantId: RESTAURANT_ID_COURANT,
      nomComplet: payload.nomComplet,
      email: payload.email,
      posteId: payload.posteId,
      accesPlateformeId: accesId,
      matricule: payload.matricule,
      dateEmbauche: payload.dateEmbauche,
      dateFin: null,
      statut: payload.statut,
      notes: payload.notes,
    };
    this._employes.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  modifierEmploye(id: string, payload: EmployeFormPayload): void {
    const employe = this._employes().find((e) => e.id === id);
    if (!employe) return;

    let accesId = employe.accesPlateformeId ?? null;

    if (payload.accorderAcces && payload.role) {
      if (accesId) {
        // Accès existant : on met juste à jour le rôle
        this._acces.update((liste) => liste.map((a) => (a.id === accesId ? { ...a, role: payload.role! } : a)));
      } else {
        // Nouvel octroi d'accès sur un employé qui n'en avait pas
        const acces: AccesPlateforme = {
          id: uid('acces'),
          restaurantId: RESTAURANT_ID_COURANT,
          role: payload.role,
          statut: StatutAcces.INVITE,
          dateInvitation: nowIso(),
          dateAcceptation: null,
        };
        this._acces.update((liste) => [...liste, acces]);
        accesId = acces.id;
      }
    } else if (!payload.accorderAcces && accesId) {
      // Retrait de l'accès
      this._acces.update((liste) => liste.map((a) => (a.id === accesId ? { ...a, statut: StatutAcces.REVOQUE } : a)));
    }

    this._employes.update((liste) =>
      liste.map((e) =>
        e.id === id
          ? {
              ...e,
              nomComplet: payload.nomComplet,
              email: payload.email,
              posteId: payload.posteId,
              accesPlateformeId: accesId,
              matricule: payload.matricule,
              dateEmbauche: payload.dateEmbauche,
              statut: payload.statut,
              notes: payload.notes,
            }
          : e
      )
    );
  }

  terminerEmploye(id: string): void {
    this._employes.update((liste) =>
      liste.map((e) => (e.id === id ? { ...e, statut: StatutEmploye.TERMINE, dateFin: nowIso() } : e))
    );
    const employe = this._employes().find((e) => e.id === id);
    if (employe?.accesPlateformeId) {
      this._acces.update((liste) =>
        liste.map((a) => (a.id === employe.accesPlateformeId ? { ...a, statut: StatutAcces.REVOQUE } : a))
      );
    }
  }

  renvoyerInvitation(accesId: string): void {
    this._acces.update((liste) =>
      liste.map((a) => (a.id === accesId ? { ...a, dateInvitation: nowIso() } : a))
    );
  }

  // ============================================================
  // Données de départ (mock)
  // ============================================================

  private seedPostes(): Poste[] {
    return [
      { id: 'poste-serveur', restaurantId: RESTAURANT_ID_COURANT, nom: 'Serveur', description: null, niveau: 1 },
      { id: 'poste-cuisinier', restaurantId: RESTAURANT_ID_COURANT, nom: 'Chef cuisinier', description: null, niveau: 2 },
      { id: 'poste-caissier', restaurantId: RESTAURANT_ID_COURANT, nom: 'Caissier', description: null, niveau: 1 },
      { id: 'poste-livreur', restaurantId: RESTAURANT_ID_COURANT, nom: 'Livreur', description: null, niveau: 1 },
    ];
  }

  private seedEmployes(): Employe[] {
    return [
      {
        id: 'emp-fatou', restaurantId: RESTAURANT_ID_COURANT, nomComplet: 'Fatou Ndiaye',
        email: 'serveur@lepalais.sn', posteId: 'poste-serveur', accesPlateformeId: null,
        matricule: 'EMP-001', dateEmbauche: '2025-01-10', dateFin: null,
        statut: StatutEmploye.ACTIF, notes: null,
      },
    ];
  }
}
