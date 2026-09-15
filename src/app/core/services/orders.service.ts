import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ModeCommande, StatutCommande } from '../../core/enums/enums';
import { AdditionAvecCommandes, Commande, LigneCommande, Paiement } from '../models/orders';

const API = environment.apiUrl;

const ORDRE_STATUTS_CUISINE = [
  StatutCommande.EN_ATTENTE, StatutCommande.CONFIRMEE,
  StatutCommande.EN_PREPARATION, StatutCommande.PRETE,
];
export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}


@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly _commandes = signal<Commande[]>([]);
  private readonly _additions = signal<AdditionAvecCommandes[]>([]);
  private readonly _paiements = signal<Paiement[]>([]);

  readonly commandes = this._commandes.asReadonly();
  readonly additions = this._additions.asReadonly();
  readonly paiements = this._paiements.asReadonly();
  private readonly _factures = signal<any[]>([]);
  readonly facturesTriees = this._factures.asReadonly();

  private readonly _commandesGlobalePage = signal<Commande[]>([]);
  private readonly _commandesGlobaleMeta = signal<PaginationMeta>({ currentPage: 1, lastPage: 1, perPage: 20, total: 0 });

  readonly commandesGlobalePage = this._commandesGlobalePage.asReadonly();
  readonly commandesGlobaleMeta = this._commandesGlobaleMeta.asReadonly();


  constructor(private readonly http: HttpClient) {
    this.chargerCommandes();
    this.chargerAdditions();
    this.chargerPaiements();
    this.chargerFactures();
  }

  async chargerAddition(id: string): Promise<any> {
  const rep = await firstValueFrom(this.http.get<{ data: any }>(`${environment.apiUrl}/additions/${id}`));
  return rep.data;
}
   
  async chargerFactures(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${environment.apiUrl}/factures`));
    this._factures.set(rep.data);
  }

  private async chargerCommandes(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/commandes`));
    this._commandes.set(rep.data.map((c) => this.mapCommande(c)));
  }

  private async chargerAdditions(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/additions`));
    this._additions.set(rep.data.map((a) => this.mapAddition(a)));
  }

  private async chargerPaiements(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/paiements`));
    this._paiements.set(rep.data.map((p) => this.mapPaiement(p)));
  }

  readonly commandesTriees = computed(() =>
    [...this._commandes()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  );

  readonly commandesCuisine = computed(() =>
    this._commandes()
      .filter((c) => ORDRE_STATUTS_CUISINE.includes(c.statut))
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  );

  readonly commandesAServir = computed(() =>
    this._commandes().filter((c) => c.mode === ModeCommande.SUR_PLACE && c.statut === StatutCommande.PRETE)
  );

  readonly additionsOuvertes = computed(() =>
    this._additions().map((addition) => ({ addition, visite: undefined, commandes: addition.commandes }))
  );

  readonly commandesAEncaisserDirectement = computed(() => {
    const commandeIdsPayees = new Set(
      this._paiements().filter((p) => p.commandeId && p.statut === 'CONFIRME').map((p) => p.commandeId)
    );
    return this._commandes().filter(
      (c) =>
        !c.visiteId &&
        c.mode !== ModeCommande.SUR_PLACE &&
        [StatutCommande.PRETE, StatutCommande.REMISE, StatutCommande.LIVREE].includes(c.statut) &&
        !commandeIdsPayees.has(c.id)
    );
  });

  readonly paiementsTries = computed(() =>
    [...this._paiements()].sort((a, b) => ((a.datePaiement ?? '') < (b.datePaiement ?? '') ? 1 : -1))
  );

  commandeParId(id: string) {
    return computed(() => this._commandes().find((c) => c.id === id));
  }

  commandesDeLaVisite(visiteId: string) {
    return computed(() => this._commandes().filter((c) => c.visiteId === visiteId));
  }

  async avancerStatutCuisine(commandeId: string): Promise<void> {
    const rep = await firstValueFrom(
      this.http.patch<{ data: any }>(`${API}/commandes/${commandeId}/avancer-statut-cuisine`, {})
    );
    this.remplacerCommandeLocale(this.mapCommande(rep.data));
  }

  async terminerCommande(commandeId: string): Promise<void> {
    const rep = await firstValueFrom(this.http.patch<{ data: any }>(`${API}/commandes/${commandeId}/terminer`, {}));
    this.remplacerCommandeLocale(this.mapCommande(rep.data));
  }

  async annulerCommande(commandeId: string): Promise<void> {
    const rep = await firstValueFrom(this.http.patch<{ data: any }>(`${API}/commandes/${commandeId}/annuler`, {}));
    this.remplacerCommandeLocale(this.mapCommande(rep.data));
  }

  async rembourserPaiement(paiementId: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${API}/paiements/${paiementId}/rembourser`, {}));
    await this.chargerPaiements();
  }

   async chargerFacture(id: string): Promise<any> {
    const rep = await firstValueFrom(this.http.get<{ data: any }>(`${environment.apiUrl}/factures/${id}`));
    return rep.data;
  }

  private remplacerCommandeLocale(maj: Commande): void {
    this._commandes.update((liste) => liste.map((c) => (c.id === maj.id ? maj : c)));
  }

  private mapCommande(api: any): Commande {
    return {
      id: api.id, visiteId: api.visite_id, tableId: api.table_id, tableNumero: api.table_numero,
      mode: api.mode, statut: api.statut, sousTotal: Number(api.sous_total),
      fraisLivraison: Number(api.frais_livraison), remise: Number(api.remise), total: Number(api.total),
      notes: api.notes,
      nomClient: api.nom_client, telephoneClient: api.telephone_client,
      heureRetraitSouhaitee: api.heure_retrait_souhaitee,
      createdAt: api.created_at, updatedAt: api.updated_at,
      lignes: (api.lignes ?? []).map((l: any): LigneCommande => ({
        id: l.id, commandeId: api.id, produitId: l.produit_id, produitNom: l.produit_nom,
        quantite: l.quantite, prixUnitaire: Number(l.prix_unitaire), sousTotal: Number(l.sous_total), notes: l.notes,
      })),
    };
  }

  private mapAddition(api: any): AdditionAvecCommandes {
    return {
      id: api.id, visiteId: api.visite_id, tableNumero: api.table_numero,
      sousTotal: Number(api.sous_total), remise: Number(api.remise), taxe: Number(api.taxe),
      total: Number(api.total), statut: api.statut,
      commandes: (api.commandes ?? []).map((c: any) => this.mapCommande(c)),
      createdAt: api.created_at,
    };
  }

  private mapPaiement(api: any): Paiement {
    return {
      id: api.id, type: api.type, commandeId: api.commande_id, additionId: api.addition_id,
      montant: Number(api.montant), devise: api.devise, methode: api.methode, statut: api.statut,
      reference: api.reference, datePaiement: api.date_paiement,
    };
  }

  async encaisserAddition(additionId: string, methode: string): Promise<void> {
  await firstValueFrom(this.http.post(`${API}/additions/${additionId}/encaisser`, { methode }));
  await Promise.all([this.chargerAdditions(), this.chargerPaiements(), this.chargerFactures()]);
}

async encaisserCommandeDirecte(commandeId: string, methode: string): Promise<void> {
  await firstValueFrom(this.http.post(`${API}/commandes/${commandeId}/encaisser-direct`, { methode }));
  await Promise.all([this.chargerPaiements(), this.chargerFactures()]);
}

  async chargerCommandesGlobale(
    page: number = 1,
    perPage: number = 20,
    statut: string | null = null,
    mode: string | null = null
  ): Promise<void> {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (statut) params['statut'] = statut;
    if (mode) params['mode'] = mode;

    const rep = await firstValueFrom(this.http.get<any>(`${API}/commandes`, { params }));

    this._commandesGlobalePage.set(rep.data.map((c: any) => this.mapCommande(c)));
    this._commandesGlobaleMeta.set({
      currentPage: rep.meta.current_page,
      lastPage: rep.meta.last_page,
      perPage: rep.meta.per_page,
      total: rep.meta.total,
    });
  }
}