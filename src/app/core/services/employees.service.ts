import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AccesPlateforme, Employe, EmployeFormPayload, Poste, PosteFormPayload } from '../models/employe';
import { RoleCode, StatutAcces } from '../enums/enums';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly _postes = signal<Poste[]>([]);
  private readonly _employes = signal<Employe[]>([]);
  private readonly _acces = signal<AccesPlateforme[]>([]);

  readonly postes = this._postes.asReadonly();
  readonly employes = this._employes.asReadonly();

  readonly employesAvecAcces = computed(() =>
    this._employes().map((e) => ({
      employe: e,
      poste: this._postes().find((p) => p.id === e.posteId),
      acces: this._acces().find((a) => a.id === e.accesPlateformeId),
    }))
  );

  constructor(private readonly http: HttpClient) {
    this.chargerTout();
  }

  private async chargerTout(): Promise<void> {
    const repPostes = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/postes`));
    this._postes.set(repPostes.data.map((p) => this.mapPoste(p)));

    await this.chargerEmployes();
  }

  private async chargerEmployes(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/employes`));
    const employes: Employe[] = [];
    const acces: AccesPlateforme[] = [];

    for (const item of rep.data) {
      employes.push(this.mapEmploye(item));
      if (item.acces) {
        acces.push(this.mapAcces(item.acces));
      }
    }

    this._employes.set(employes);
    this._acces.set(acces);
  }

  // ============================================================
  // POSTES
  // ============================================================

  async creerPoste(payload: PosteFormPayload): Promise<Poste> {
    const rep = await firstValueFrom(this.http.post<{ data: any }>(`${API}/postes`, payload));
    const nouveau = this.mapPoste(rep.data);
    this._postes.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  async modifierPoste(id: string, payload: PosteFormPayload): Promise<void> {
    const rep = await firstValueFrom(this.http.put<{ data: any }>(`${API}/postes/${id}`, payload));
    const maj = this.mapPoste(rep.data);
    this._postes.update((liste) => liste.map((p) => (p.id === id ? maj : p)));
  }

  async supprimerPoste(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${API}/postes/${id}`));
      this._postes.update((liste) => liste.filter((p) => p.id !== id));
    } catch (e: any) {
      throw new Error(e?.error?.message ?? 'Ce poste est encore assigné à au moins un employé.');
    }
  }

  // ============================================================
  // EMPLOYÉS
  // ============================================================

  async creerEmploye(payload: EmployeFormPayload): Promise<Employe> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/employes`, this.employePayloadVersApi(payload))
    );
    await this.chargerEmployes();
    return this.mapEmploye(rep.data);
  }

  async modifierEmploye(id: string, payload: EmployeFormPayload): Promise<void> {
    await firstValueFrom(
      this.http.put<{ data: any }>(`${API}/employes/${id}`, this.employePayloadVersApi(payload))
    );
    await this.chargerEmployes();
  }

  async terminerEmploye(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${API}/employes/${id}/terminer`, {}));
    await this.chargerEmployes();
  }

  async renvoyerInvitation(employeId: string): Promise<void> {
    await firstValueFrom(this.http.post(`${API}/employes/${employeId}/renvoyer-invitation`, {}));
  }

  private mapPoste(api: any): Poste {
    return { id: api.id, restaurantId: '', nom: api.nom, description: api.description, niveau: api.niveau };
  }

  private mapEmploye(api: any): Employe {
    return {
      id: api.id, restaurantId: '', nomComplet: api.nom_complet, email: api.email,
      posteId: api.poste_id, accesPlateformeId: api.acces?.id ?? null,
      matricule: api.matricule, dateEmbauche: api.date_embauche, dateFin: api.date_fin,
      statut: api.statut, notes: api.notes,
    };
  }

  private mapAcces(api: any): AccesPlateforme {
    return {
      id: api.id, restaurantId: '', role: api.role as RoleCode, statut: api.statut as StatutAcces,
      dateInvitation: api.date_invitation, dateAcceptation: api.date_acceptation,
    };
  }

  private employePayloadVersApi(payload: EmployeFormPayload) {
    return {
      nom_complet: payload.nomComplet,
      email: payload.email,
      poste_id: payload.posteId,
      matricule: payload.matricule,
      date_embauche: payload.dateEmbauche,
      statut: payload.statut,
      notes: payload.notes,
      accorder_acces: payload.accorderAcces,
      role: payload.accorderAcces ? payload.role : null,
    };
  }

  employeParId(id: string): Employe | undefined {
  return this._employes().find((e) => e.id === id);
}
}