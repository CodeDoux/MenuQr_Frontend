import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly _entrees = signal<any[]>([]);
  readonly entrees = this._entrees.asReadonly();

  constructor(private readonly http: HttpClient) {
    this.charger();
  }

  private async charger(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/journal`));
    this._entrees.set(rep.data);
  }
}