import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface JournalAdminEntry {
  id: string;
  adminNom: string;
  action: string;
  tableCible: string | null;
  idCible: string | null;
  ancienneValeur: string | null;
  nouvelleValeur: string | null;
  date: string;
}

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class JournalAdminService {
  private readonly _entries = signal<JournalAdminEntry[]>([]);
  private readonly _meta = signal<PaginationMeta>({ currentPage: 1, lastPage: 1, perPage: 30, total: 0 });

  readonly entries = this._entries.asReadonly();
  readonly meta = this._meta.asReadonly();

  constructor(private readonly http: HttpClient) {
    this.chargerPage(1);
  }

  async chargerPage(page: number = 1, perPage: number = 30): Promise<void> {
    const rep = await firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/admin/journal`, { params: { page, per_page: perPage } })
    );
    this._entries.set(rep.data.map((e: any) => ({
      id: e.id, adminNom: e.admin_nom ?? 'Admin', action: e.action,
      tableCible: e.table_cible, idCible: e.id_cible,
      ancienneValeur: e.ancienne_valeur, nouvelleValeur: e.nouvelle_valeur, date: e.date,
    })));
    this._meta.set({
      currentPage: rep.meta.current_page, lastPage: rep.meta.last_page,
      perPage: rep.meta.per_page, total: rep.meta.total,
    });
  }
}