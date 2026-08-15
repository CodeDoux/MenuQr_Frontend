import { Injectable, computed, signal } from '@angular/core';
import * as QRCodeLib from 'qrcode';
import { StatutSalle, StatutTable, TypeQRCode } from '../../core/enums/enums';
import { QRCode, Salle, SalleFormPayload, TableFormPayload } from '../models/salle';
import { TableRestaurant } from '../models/table';

/**
 * ⚠️ MOCK DATA — Service temporaire en attendant l'API réelle.
 * Même principe que MenuManagementService : le contrat des méthodes publiques
 * est pensé pour rester stable une fois branché sur de vrais appels HTTP.
 *
 * La génération d'image QR est en revanche une opération 100% côté client
 * légitime (encodage réel de l'URL cible) — elle restera utile même avec un
 * vrai backend, à condition que ce dernier fournisse l'URL/le code à encoder.
 */

const RESTAURANT_ID_COURANT = 'rest-001';
// URL de base simulée — à remplacer par le domaine réel de la zone client une fois définie.
const BASE_URL_CLIENT = 'https://menuqr.app/m';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function genererCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class TablesQrcodesService {
  private readonly _salles = signal<Salle[]>(this.seedSalles());
  private readonly _tables = signal<TableRestaurant[]>(this.seedTables());
  private readonly _qrcodes = signal<QRCode[]>([]);

  readonly salles = this._salles.asReadonly();
  readonly tables = this._tables.asReadonly();
  readonly qrcodes = this._qrcodes.asReadonly();

  readonly sallesTriees = computed(() => [...this._salles()].sort((a, b) => a.ordre - b.ordre));

  // ============================================================
  // SALLES
  // ============================================================

  tablesDeLaSalle(salleId: string) {
    return computed(() => this._tables().filter((t) => t.salleId === salleId));
  }

  creerSalle(payload: SalleFormPayload): Salle {
    const nouvelle: Salle = { id: uid('salle'), restaurantId: RESTAURANT_ID_COURANT, ...payload };
    this._salles.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  modifierSalle(id: string, payload: SalleFormPayload): void {
    this._salles.update((liste) => liste.map((s) => (s.id === id ? { ...s, ...payload } : s)));
  }

  supprimerSalle(id: string): void {
    this._salles.update((liste) => liste.filter((s) => s.id !== id));
    this._tables.update((liste) => liste.filter((t) => t.salleId !== id));
  }

  // ============================================================
  // TABLES
  // ============================================================

  creerTable(payload: TableFormPayload): TableRestaurant {
    const nouvelle: TableRestaurant = { id: uid('table'), ...payload };
    this._tables.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  modifierTable(id: string, payload: TableFormPayload): void {
    this._tables.update((liste) => liste.map((t) => (t.id === id ? { ...t, ...payload } : t)));
  }

  supprimerTable(id: string): void {
    this._tables.update((liste) => liste.filter((t) => t.id !== id));
    // Un QR de table devient orphelin si sa table est supprimée : on le désactive plutôt que de le supprimer,
    // pour conserver un historique de scans cohérent (nombreScan n'est jamais remis à zéro silencieusement).
    this._qrcodes.update((liste) =>
      liste.map((q) => (q.tableId === id ? { ...q, estActif: false } : q))
    );
  }

  // ============================================================
  // QR CODES
  // ============================================================

  qrCodeDeLaTable(tableId: string) {
    return computed(() => this._qrcodes().find((q) => q.tableId === tableId && q.estActif));
  }

  readonly qrCodesGeneraux = computed(() =>
    this._qrcodes().filter((q) => q.type !== TypeQRCode.TABLE)
  );

  /** Génère (ou régénère) le QR code d'une table donnée */
  async genererQrPourTable(table: TableRestaurant, salle: Salle): Promise<QRCode> {
    const code = genererCode();
    const url = `${BASE_URL_CLIENT}/${RESTAURANT_ID_COURANT}?code=${code}&table=${table.id}`;
    const image = await QRCodeLib.toDataURL(url, { width: 320, margin: 1 });

    const nouveau: QRCode = {
      id: uid('qr'),
      restaurantId: RESTAURANT_ID_COURANT,
      tableId: table.id,
      code,
      url,
      image,
      type: TypeQRCode.TABLE,
      dateExpiration: null,
      nombreScan: 0,
      estActif: true,
      createdAt: nowIso(),
    };

    // Désactive l'éventuel ancien QR de cette table avant d'ajouter le nouveau
    this._qrcodes.update((liste) => [
      ...liste.map((q) => (q.tableId === table.id ? { ...q, estActif: false } : q)),
      nouveau,
    ]);
    return nouveau;
  }

  /** Génère un QR générique (emporter ou livraison), non lié à une table */
  async genererQrGeneral(type: TypeQRCode.EMPORTER | TypeQRCode.LIVRAISON): Promise<QRCode> {
    const code = genererCode();
    const url = `${BASE_URL_CLIENT}/${RESTAURANT_ID_COURANT}?code=${code}&mode=${type}`;
    const image = await QRCodeLib.toDataURL(url, { width: 320, margin: 1 });

    const nouveau: QRCode = {
      id: uid('qr'),
      restaurantId: RESTAURANT_ID_COURANT,
      tableId: null,
      code,
      url,
      image,
      type,
      dateExpiration: null,
      nombreScan: 0,
      estActif: true,
      createdAt: nowIso(),
    };
    this._qrcodes.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  desactiverQrCode(id: string): void {
    this._qrcodes.update((liste) => liste.map((q) => (q.id === id ? { ...q, estActif: false } : q)));
  }

  // ============================================================
  // Données de départ (mock)
  // ============================================================

  private seedSalles(): Salle[] {
    return [
      { id: 'salle-int', restaurantId: RESTAURANT_ID_COURANT, description: 'Salle intérieure', ordre: 1, statut: StatutSalle.ACTIVE },
      { id: 'salle-terrasse', restaurantId: RESTAURANT_ID_COURANT, description: 'Terrasse', ordre: 2, statut: StatutSalle.ACTIVE },
    ];
  }

  private seedTables(): TableRestaurant[] {
    return [
      { id: 'table-1', salleId: 'salle-int', numero: '1', capacite: 4, statut: StatutTable.LIBRE, zone: null },
      { id: 'table-2', salleId: 'salle-int', numero: '2', capacite: 2, statut: StatutTable.LIBRE, zone: null },
      { id: 'table-12', salleId: 'salle-terrasse', numero: '12', capacite: 6, statut: StatutTable.OCCUPEE, zone: null },
    ];
  }
}