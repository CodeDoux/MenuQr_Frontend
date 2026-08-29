import { Injectable, computed, signal } from '@angular/core';
import { StatutAbonnement, StatutFactureAbonnement, StatutPlan } from '../../core/enums/enums';
import { Abonnement, FactureAbonnement, Offre, OffreFormPayload } from '../models/subcription';

/** ⚠️ MOCK DATA — même principe que les autres services du projet. */

const RESTAURANT_ID_COURANT = 'rest-001';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function dansNJours(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly _offres = signal<Offre[]>(this.seedOffres());
  private readonly _abonnement = signal<Abonnement>(this.seedAbonnement());
  private readonly _factures = signal<FactureAbonnement[]>([]);

  readonly offres = this._offres.asReadonly();
  readonly abonnement = this._abonnement.asReadonly();
  readonly factures = this._factures.asReadonly();

  readonly offreActuelle = computed(() => this._offres().find((o) => o.id === this._abonnement().offreId));

  readonly joursRestantsEssai = computed(() => {
    const a = this._abonnement();
    if (a.statut !== StatutAbonnement.ESSAI) return null;
    const diff = new Date(a.dateFin).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  });

  // ============================================================
  // ADMIN — CRUD des offres (gestion plateforme)
  // ============================================================

  creerOffre(payload: OffreFormPayload): Offre {
    const nouvelle: Offre = { id: `offre-${Math.random().toString(36).slice(2, 10)}`, ...payload };
    this._offres.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  modifierOffre(id: string, payload: OffreFormPayload): void {
    this._offres.update((liste) => liste.map((o) => (o.id === id ? { ...o, ...payload } : o)));
  }

  supprimerOffre(id: string): void {
    this._offres.update((liste) => liste.filter((o) => o.id !== id));
  }

  changerOffre(offreId: string): void {
    this._abonnement.update((a) => ({
      ...a,
      offreId,
      statut: StatutAbonnement.ACTIF,
      dateDebut: nowIso(),
      dateFin: dansNJours(30),
      dateProchainPaiement: dansNJours(30),
    }));

    const offre = this._offres().find((o) => o.id === offreId);
    if (offre) {
      this._factures.update((liste) => [
        {
          id: uid('fact'), abonnementId: this._abonnement().id,
          numero: `INV-${Date.now().toString().slice(-6)}`,
          montant: offre.prixMensuel, dateEmission: nowIso(), dateEcheance: dansNJours(15),
          statut: StatutFactureAbonnement.EN_ATTENTE,
        },
        ...liste,
      ]);
    }
  }

  private seedOffres(): Offre[] {
    return [
      {
        id: 'offre-starter', nom: 'Starter', description: 'Pour démarrer sereinement',
        prixMensuel: 15000, prixAnnuel: 150000, devise: 'FCFA', dureeEssai: 14,
        statut: StatutPlan.ACTIF, ordreAffichage: 1,
        fonctionnalites: ['1 menu', 'QR codes illimités', 'Support par email'],
        limites: [{ nom: 'Tables', valeur: 5, unite: 'tables' }, { nom: 'Employés', valeur: 3, unite: 'employés' }],
      },
      {
        id: 'offre-pro', nom: 'Pro', description: 'Pour les restaurants en croissance',
        prixMensuel: 35000, prixAnnuel: 350000, devise: 'FCFA', dureeEssai: 14,
        statut: StatutPlan.ACTIF, ordreAffichage: 2,
        fonctionnalites: ['Menus illimités', 'QR codes illimités', 'Statistiques avancées', 'Support prioritaire'],
        limites: [{ nom: 'Tables', valeur: 20, unite: 'tables' }, { nom: 'Employés', valeur: 10, unite: 'employés' }],
      },
      {
        id: 'offre-business', nom: 'Business', description: 'Pour les grandes structures',
        prixMensuel: 65000, prixAnnuel: 650000, devise: 'FCFA', dureeEssai: 14,
        statut: StatutPlan.ACTIF, ordreAffichage: 3,
        fonctionnalites: ['Tout Pro, en illimité', 'Multi-restaurants', 'Support dédié'],
        limites: [{ nom: 'Tables', valeur: -1, unite: 'illimité' }, { nom: 'Employés', valeur: -1, unite: 'illimité' }],
      },
    ];
  }

  private seedAbonnement(): Abonnement {
    return {
      id: uid('abo'), restaurantId: RESTAURANT_ID_COURANT, offreId: 'offre-starter',
      dateDebut: nowIso(), dateFin: dansNJours(12),
      statut: StatutAbonnement.ESSAI, renouvellementAutomatique: false, dateProchainPaiement: null,
    };
  }
}