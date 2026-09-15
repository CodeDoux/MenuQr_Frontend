import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface DashboardStats {
  caJour: number;
  caSemaine: number;
  nbCommandesJour: number;
  nbCommandesSemaine: number;
  topProduits: { produitNom: string; quantite: number }[];
    repartitionMode: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly stats = signal<DashboardStats | null>(null);
  readonly chargement = signal(false);

  constructor(private readonly http: HttpClient) {
    this.charger();
  }

  async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      const rep = await firstValueFrom(this.http.get<any>(`${API}/statistiques/dashboard`));
      this.stats.set({
        caJour: rep.ca_jour,
        caSemaine: rep.ca_semaine,
        nbCommandesJour: rep.nb_commandes_jour,
        nbCommandesSemaine: rep.nb_commandes_semaine,
        topProduits: (rep.top_produits ?? []).map((p: any) => ({ produitNom: p.produit_nom, quantite: p.quantite })),
        repartitionMode: rep.repartition_mode,
      });
    } finally {
      this.chargement.set(false);
    }
  }
}