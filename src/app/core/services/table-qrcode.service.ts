import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QRCode, Salle, SalleFormPayload } from '../models/salle';
import { TableFormPayload, TableRestaurant } from '../models/table';
import { TypeQRCode } from '../enums/enums';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class TablesQrcodesService {
  private readonly _salles = signal<Salle[]>([]);
  private readonly _tables = signal<TableRestaurant[]>([]);
  private readonly _qrcodes = signal<QRCode[]>([]);

  readonly salles = this._salles.asReadonly();
  readonly tables = this._tables.asReadonly();
  readonly qrcodes = this._qrcodes.asReadonly();

  readonly sallesTriees = computed(() => [...this._salles()].sort((a, b) => a.ordre - b.ordre));

  constructor(private readonly http: HttpClient) {
    this.chargerTout();
  }

  private async chargerTout(): Promise<void> {
    const repSalles = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/salles`));
    const salles = repSalles.data.map((s) => this.mapSalle(s));
    this._salles.set(salles);

    const toutesTables: TableRestaurant[] = [];
    for (const salle of salles) {
      const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/salles/${salle.id}/tables`));
      toutesTables.push(...rep.data.map((t) => this.mapTable(t)));
    }
    this._tables.set(toutesTables);

    await this.rechargerQrCodes();
  }

  private async rechargerQrCodes(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/qrcodes`));
    this._qrcodes.set(rep.data.map((q) => this.mapQrCode(q)));
  }

  // ============================================================
  // SALLES
  // ============================================================

  tablesDeLaSalle(salleId: string) {
    return computed(() => this._tables().filter((t) => t.salleId === salleId));
  }

  async creerSalle(payload: SalleFormPayload): Promise<Salle> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/salles`, this.sallePayloadVersApi(payload))
    );
    const nouvelle = this.mapSalle(rep.data);
    this._salles.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  async modifierSalle(id: string, payload: SalleFormPayload): Promise<void> {
    const rep = await firstValueFrom(
      this.http.put<{ data: any }>(`${API}/salles/${id}`, this.sallePayloadVersApi(payload))
    );
    const maj = this.mapSalle(rep.data);
    this._salles.update((liste) => liste.map((s) => (s.id === id ? maj : s)));
  }

  async supprimerSalle(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/salles/${id}`));
    this._salles.update((liste) => liste.filter((s) => s.id !== id));
    this._tables.update((liste) => liste.filter((t) => t.salleId !== id));
  }

  // ============================================================
  // TABLES
  // ============================================================

  async creerTable(payload: TableFormPayload): Promise<TableRestaurant> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/salles/${payload.salleId}/tables`, this.tablePayloadVersApi(payload))
    );
    const nouvelle = this.mapTable(rep.data);
    this._tables.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  async modifierTable(id: string, payload: TableFormPayload): Promise<void> {
    const rep = await firstValueFrom(
      this.http.put<{ data: any }>(
        `${API}/salles/${payload.salleId}/tables/${id}`,
        this.tablePayloadVersApi(payload)
      )
    );
    const maj = this.mapTable(rep.data);
    this._tables.update((liste) => liste.map((t) => (t.id === id ? maj : t)));
  }

  async supprimerTable(id: string): Promise<void> {
    const existante = this._tables().find((t) => t.id === id);
    if (!existante) return;

    await firstValueFrom(this.http.delete(`${API}/salles/${existante.salleId}/tables/${id}`));
    this._tables.update((liste) => liste.filter((t) => t.id !== id));
    await this.rechargerQrCodes(); // le QR de cette table a pu être désactivé côté serveur
  }

  // ============================================================
  // QR CODES
  // ============================================================

  qrCodeDeLaTable(tableId: string) {
    return computed(() => this._qrcodes().find((q) => q.tableId === tableId && q.estActif));
  }

  readonly qrCodesGeneraux = computed(() => this._qrcodes().filter((q) => q.type !== TypeQRCode.TABLE));

  async genererQrPourTable(table: TableRestaurant, salle: Salle): Promise<QRCode> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/salles/${salle.id}/tables/${table.id}/qrcode`, {})
    );
    const qr = this.mapQrCode(rep.data);
    await this.rechargerQrCodes();
    return qr;
  }

  async genererQrGeneral(type: TypeQRCode.EMPORTER | TypeQRCode.LIVRAISON): Promise<QRCode> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/qrcodes/generales`, { type })
    );
    const qr = this.mapQrCode(rep.data);
    await this.rechargerQrCodes();
    return qr;
  }

  async desactiverQrCode(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${API}/qrcodes/${id}/desactiver`, {}));
    await this.rechargerQrCodes();
  }

  // ============================================================
  // Mappers API (snake_case) <-> Frontend (camelCase)
  // ============================================================

  private mapSalle(api: any): Salle {
    return { id: api.id, restaurantId: '', description: api.description, ordre: api.ordre, statut: api.statut };
  }

  private sallePayloadVersApi(payload: SalleFormPayload) {
    return { description: payload.description, ordre: payload.ordre, statut: payload.statut };
  }

  private mapTable(api: any): TableRestaurant {
    return {
      id: api.id, salleId: api.salle_id, numero: api.numero,
      capacite: api.capacite, statut: api.statut, zone: api.zone,
    };
  }

  private tablePayloadVersApi(payload: TableFormPayload) {
    return { numero: payload.numero, capacite: payload.capacite, statut: payload.statut, zone: payload.zone };
  }

  private mapQrCode(api: any): QRCode {
    return {
      id: api.id, restaurantId: '', tableId: api.table_id, code: api.code,
      url: api.url, image: api.image, type: api.type as TypeQRCode,
      dateExpiration: api.date_expiration, nombreScan: api.nombre_scan,
      estActif: api.est_actif, createdAt: api.created_at,
    };
  }
}