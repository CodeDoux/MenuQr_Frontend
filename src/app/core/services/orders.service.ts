import { Injectable, computed, signal } from '@angular/core';
import { Addition, Commande, LigneCommande, Paiement, Visite } from '../models/commande';
import { ModeCommande, StatutAddition, StatutCommande, StatutPaiement, StatutVisite, TypePaiement } from '../enums/enums';

/**
 * ⚠️ MOCK DATA — en attendant l'API réelle ET la zone client (qui créera les
 * vraies commandes). Les données de départ simulent des commandes déjà en
 * cours pour pouvoir tester le flux cuisine → service → caisse.
 *
 * Règle d'exclusivité Paiement (Correction #3 du diagramme) : un paiement a
 * soit commandeId (paiement direct, EMPORTER/LIVRAISON sans visite), soit
 * additionId (paiement groupé, SUR_PLACE), jamais les deux.
 */

const RESTAURANT_ID_COURANT = 'rest-001';
const DEVISE = 'FCFA';

const ORDRE_STATUTS_CUISINE = [
  StatutCommande.EN_ATTENTE,
  StatutCommande.CONFIRMEE,
  StatutCommande.EN_PREPARATION,
  StatutCommande.PRETE,
];

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function calculerTotal(lignes: LigneCommande[], fraisLivraison = 0, remise = 0): { sousTotal: number; total: number } {
  const sousTotal = lignes.reduce((acc, l) => acc + l.sousTotal, 0);
  return { sousTotal, total: sousTotal + fraisLivraison - remise };
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly _visites = signal<Visite[]>([]);
  private readonly _commandes = signal<Commande[]>([]);
  private readonly _additions = signal<Addition[]>([]);
  private readonly _paiements = signal<Paiement[]>([]);

  readonly visites = this._visites.asReadonly();
  readonly commandes = this._commandes.asReadonly();
  readonly additions = this._additions.asReadonly();
  readonly paiements = this._paiements.asReadonly();

  constructor() {
    this.seed();
  }

  // ============================================================
  // VUE GLOBALE
  // ============================================================

  readonly commandesTriees = computed(() =>
    [...this._commandes()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );

  // ============================================================
  // VUE CUISINE
  // ============================================================

  /** Commandes actives (pas encore au statut final, pas annulées), triées par ancienneté */
  readonly commandesCuisine = computed(() =>
    this._commandes()
      .filter((c) => ORDRE_STATUTS_CUISINE.includes(c.statut))
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  );

  avancerStatutCuisine(commandeId: string): void {
    this._commandes.update((liste) =>
      liste.map((c) => {
        if (c.id !== commandeId) return c;
        const indexActuel = ORDRE_STATUTS_CUISINE.indexOf(c.statut);
        if (indexActuel === -1 || indexActuel === ORDRE_STATUTS_CUISINE.length - 1) return c;
        return { ...c, statut: ORDRE_STATUTS_CUISINE[indexActuel + 1], updatedAt: nowIso() };
      })
    );
  }

  annulerCommande(commandeId: string): void {
    this._commandes.update((liste) =>
      liste.map((c) => (c.id === commandeId ? { ...c, statut: StatutCommande.ANNULEE, updatedAt: nowIso() } : c))
    );
  }

  // ============================================================
  // VUE SERVICE
  // ============================================================

  /** Commandes SUR_PLACE prêtes à servir, groupées par table */
  readonly commandesAServir = computed(() =>
    this._commandes().filter((c) => c.mode === ModeCommande.SUR_PLACE && c.statut === StatutCommande.PRETE)
  );

  /** Marque une commande comme terminée selon son mode (SERVIE / REMISE / LIVREE) */
  terminerCommande(commandeId: string): void {
    this._commandes.update((liste) =>
      liste.map((c) => {
        if (c.id !== commandeId) return c;
        const statutFinal =
          c.mode === ModeCommande.SUR_PLACE ? StatutCommande.SERVIE :
          c.mode === ModeCommande.EMPORTER ? StatutCommande.REMISE :
          StatutCommande.LIVREE;
        return { ...c, statut: statutFinal, updatedAt: nowIso() };
      })
    );
  }

  // ============================================================
  // VUE CAISSE
  // ============================================================

  /** Additions ouvertes, avec leurs commandes et la table associée */
  readonly additionsOuvertes = computed(() =>
    this._additions()
      .filter((a) => a.statut === StatutAddition.OUVERTE)
      .map((addition) => {
        const visite = this._visites().find((v) => v.id === addition.visiteId);
        const commandes = this._commandes().filter((c) => c.visiteId === addition.visiteId && c.statut !== StatutCommande.ANNULEE);
        return { addition, visite, commandes };
      })
  );

  /** Commandes EMPORTER/LIVRAISON sans visite, prêtes/terminées, pas encore payées */
  readonly commandesAEncaisserDirectement = computed(() => {
    const commandeIdsPayees = new Set(
      this._paiements().filter((p) => p.commandeId && p.statut === StatutPaiement.CONFIRME).map((p) => p.commandeId)
    );
    return this._commandes().filter(
      (c) =>
        !c.visiteId &&
        c.mode !== ModeCommande.SUR_PLACE &&
        [StatutCommande.PRETE, StatutCommande.REMISE, StatutCommande.LIVREE].includes(c.statut) &&
        !commandeIdsPayees.has(c.id)
    );
  });

  encaisserAddition(additionId: string, methode: string): void {
    const addition = this._additions().find((a) => a.id === additionId);
    if (!addition) return;

    const paiement: Paiement = {
      id: uid('pay'),
      type: TypePaiement.COMMANDE,
      commandeId: null,
      additionId: addition.id,
      montant: addition.total,
      devise: DEVISE,
      methode,
      statut: StatutPaiement.CONFIRME,
      reference: null,
      datePaiement: nowIso(),
    };
    this._paiements.update((liste) => [...liste, paiement]);
    this._additions.update((liste) =>
      liste.map((a) => (a.id === additionId ? { ...a, statut: StatutAddition.PAYEE } : a))
    );
  }

  encaisserCommandeDirecte(commandeId: string, methode: string): void {
    const commande = this._commandes().find((c) => c.id === commandeId);
    if (!commande) return;

    const paiement: Paiement = {
      id: uid('pay'),
      type: TypePaiement.COMMANDE,
      commandeId: commande.id,
      additionId: null,
      montant: commande.total,
      devise: DEVISE,
      methode,
      statut: StatutPaiement.CONFIRME,
      reference: null,
      datePaiement: nowIso(),
    };
    this._paiements.update((liste) => [...liste, paiement]);
  }

  rembourserPaiement(paiementId: string): void {
    this._paiements.update((liste) =>
      liste.map((p) => (p.id === paiementId ? { ...p, statut: StatutPaiement.REMBOURSE } : p))
    );
  }

  paiementDeLAddition(additionId: string): Paiement | undefined {
    return this._paiements().find((p) => p.additionId === additionId && p.statut === StatutPaiement.CONFIRME);
  }

  paiementDeLaCommande(commandeId: string): Paiement | undefined {
    return this._paiements().find((p) => p.commandeId === commandeId && p.statut === StatutPaiement.CONFIRME);
  }

  // ============================================================
  // ZONE CLIENT — création de commande (ferme la boucle avec cuisine/service/caisse)
  // ============================================================

  commandeParId(id: string) {
    return computed(() => this._commandes().find((c) => c.id === id));
  }

  commandesDeLaVisite(visiteId: string) {
    return computed(() => this._commandes().filter((c) => c.visiteId === visiteId));
  }

  /**
   * Crée une commande depuis le parcours client (menu numérique → panier).
   * Si un tableId est fourni (contexte QR de table), rattache la commande à la
   * visite en cours de cette table (RM08 : une visite peut contenir plusieurs
   * commandes) et met à jour/crée l'addition ouverte correspondante.
   * Sinon, commande autonome (EMPORTER/LIVRAISON sans visite), payable
   * directement plus tard (vue caisse ou paiement en ligne depuis le suivi).
   */
  creerCommandeClient(input: {
    tableId?: string | null;
    mode: ModeCommande;
    items: { produitId: string; produitNom: string; prixUnitaire: number; quantite: number }[];
    fraisLivraison?: number;
    notes?: string | null;
  }): Commande {
    const commandeId = uid('cmd');
    const lignes = this.lignesDepuis(commandeId, input.items);
    const totaux = calculerTotal(lignes, input.fraisLivraison ?? 0);

    let visiteId: string | null = null;
    let commandeTableId: string | null = null;

    if (input.tableId) {
      let visite = this._visites().find(
        (v) => v.tableId === input.tableId && v.statut === StatutVisite.EN_COURS
      );
      if (!visite) {
        visite = {
          id: uid('visite'), restaurantId: RESTAURANT_ID_COURANT, clientId: null,
          tableId: input.tableId, dateDebut: nowIso(), dateFin: null, statut: StatutVisite.EN_COURS,
        };
        this._visites.update((liste) => [...liste, visite!]);
      }
      visiteId = visite.id;
      if (input.mode === ModeCommande.SUR_PLACE) commandeTableId = input.tableId;
    }

    const commande: Commande = {
      id: commandeId, clientId: null, visiteId, tableId: commandeTableId,
      mode: input.mode, statut: StatutCommande.EN_ATTENTE,
      sousTotal: totaux.sousTotal, fraisLivraison: input.fraisLivraison ?? 0, remise: 0, total: totaux.total,
      notes: input.notes ?? null, createdAt: nowIso(), updatedAt: nowIso(), lignes,
    };
    this._commandes.update((liste) => [...liste, commande]);

    if (visiteId) {
      const additionExistante = this._additions().find(
        (a) => a.visiteId === visiteId && a.statut === StatutAddition.OUVERTE
      );
      const commandesVisite = this._commandes().filter(
        (c) => c.visiteId === visiteId && c.statut !== StatutCommande.ANNULEE
      );
      const totauxAddition = calculerTotal(
        commandesVisite.flatMap((c) => c.lignes),
        commandesVisite.reduce((acc, c) => acc + c.fraisLivraison, 0)
      );
      if (additionExistante) {
        this._additions.update((liste) =>
          liste.map((a) =>
            a.id === additionExistante.id
              ? { ...a, sousTotal: totauxAddition.sousTotal, total: totauxAddition.total }
              : a
          )
        );
      } else {
        this._additions.update((liste) => [
          ...liste,
          {
            id: uid('add'), visiteId,
            sousTotal: totauxAddition.sousTotal, remise: 0, taxe: 0, total: totauxAddition.total,
            statut: StatutAddition.OUVERTE, createdAt: nowIso(),
          },
        ]);
      }
    }

    return commande;
  }

  // ============================================================
  // Données de départ (mock) — reprend le scénario Table 12
  // ============================================================

  private lignesDepuis(commandeId: string, items: { produitId: string; produitNom: string; prixUnitaire: number; quantite: number }[]): LigneCommande[] {
    return items.map((it) => ({
      id: uid('ligne'),
      commandeId,
      produitId: it.produitId,
      produitNom: it.produitNom,
      quantite: it.quantite,
      prixUnitaire: it.prixUnitaire,
      sousTotal: it.prixUnitaire * it.quantite,
    }));
  }

  private seed(): void {
    // --- Visite 1 : Table 12, deux commandes (SUR_PLACE + EMPORTER) ---
    const visite1: Visite = {
      id: 'visite-1', restaurantId: RESTAURANT_ID_COURANT, clientId: null,
      tableId: 'table-12', dateDebut: nowIso(), dateFin: null, statut: StatutVisite.EN_COURS,
    };

    const c1Id = uid('cmd');
    const c1Lignes = this.lignesDepuis(c1Id, [
      { produitId: 'prod-yassa', produitNom: 'Yassa Poulet', prixUnitaire: 3500, quantite: 1 },
      { produitId: 'prod-coca', produitNom: 'Coca-Cola', prixUnitaire: 500, quantite: 2 },
    ]);
    const c1Totaux = calculerTotal(c1Lignes);
    const commande1: Commande = {
      id: c1Id, clientId: null, visiteId: visite1.id, tableId: 'table-12',
      mode: ModeCommande.SUR_PLACE, statut: StatutCommande.EN_PREPARATION,
      sousTotal: c1Totaux.sousTotal, fraisLivraison: 0, remise: 0, total: c1Totaux.total,
      notes: null, createdAt: nowIso(), updatedAt: nowIso(), lignes: c1Lignes,
    };

    const c2Id = uid('cmd');
    const c2Lignes = this.lignesDepuis(c2Id, [
      { produitId: 'prod-pizza', produitNom: 'Pizza Margherita (Petite)', prixUnitaire: 3000, quantite: 1 },
    ]);
    const c2Totaux = calculerTotal(c2Lignes);
    const commande2: Commande = {
      id: c2Id, clientId: null, visiteId: visite1.id, tableId: null,
      mode: ModeCommande.EMPORTER, statut: StatutCommande.EN_ATTENTE,
      sousTotal: c2Totaux.sousTotal, fraisLivraison: 0, remise: 0, total: c2Totaux.total,
      notes: null, createdAt: nowIso(), updatedAt: nowIso(), lignes: c2Lignes,
    };

    const addition1Totaux = calculerTotal([...c1Lignes, ...c2Lignes]);
    const addition1: Addition = {
      id: uid('add'), visiteId: visite1.id,
      sousTotal: addition1Totaux.sousTotal, remise: 0, taxe: 0, total: addition1Totaux.total,
      statut: StatutAddition.OUVERTE, createdAt: nowIso(),
    };

    // --- Visite 2 : Table 1, une commande prête à servir ---
    const visite2: Visite = {
      id: 'visite-2', restaurantId: RESTAURANT_ID_COURANT, clientId: null,
      tableId: 'table-1', dateDebut: nowIso(), dateFin: null, statut: StatutVisite.EN_COURS,
    };
    const c3Id = uid('cmd');
    const c3Lignes = this.lignesDepuis(c3Id, [
      { produitId: 'prod-thieb', produitNom: 'Thiéboudiène', prixUnitaire: 4000, quantite: 1 },
    ]);
    const c3Totaux = calculerTotal(c3Lignes);
    const commande3: Commande = {
      id: c3Id, clientId: null, visiteId: visite2.id, tableId: 'table-1',
      mode: ModeCommande.SUR_PLACE, statut: StatutCommande.PRETE,
      sousTotal: c3Totaux.sousTotal, fraisLivraison: 0, remise: 0, total: c3Totaux.total,
      notes: null, createdAt: nowIso(), updatedAt: nowIso(), lignes: c3Lignes,
    };
    const addition2Totaux = calculerTotal(c3Lignes);
    const addition2: Addition = {
      id: uid('add'), visiteId: visite2.id,
      sousTotal: addition2Totaux.sousTotal, remise: 0, taxe: 0, total: addition2Totaux.total,
      statut: StatutAddition.OUVERTE, createdAt: nowIso(),
    };

    // --- Commande EMPORTER directe (sans visite), déjà prête ---
    const c4Id = uid('cmd');
    const c4Lignes = this.lignesDepuis(c4Id, [
      { produitId: 'prod-coca', produitNom: 'Coca-Cola', prixUnitaire: 500, quantite: 3 },
    ]);
    const c4Totaux = calculerTotal(c4Lignes);
    const commande4: Commande = {
      id: c4Id, clientId: null, visiteId: null, tableId: null,
      mode: ModeCommande.EMPORTER, statut: StatutCommande.PRETE,
      sousTotal: c4Totaux.sousTotal, fraisLivraison: 0, remise: 0, total: c4Totaux.total,
      notes: null, createdAt: nowIso(), updatedAt: nowIso(), lignes: c4Lignes,
    };

    this._visites.set([visite1, visite2]);
    this._commandes.set([commande1, commande2, commande3, commande4]);
    this._additions.set([addition1, addition2]);
  }
}