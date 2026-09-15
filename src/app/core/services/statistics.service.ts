import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface StatistiquesDetaillees {
  periodeJours: number;
  evolutionCa: { date: string; montant: number }[];
  repartitionPaiement: Record<string, number>;
  topCategories: { categorieNom: string; quantite: number }[];
  panierMoyen: number;
  tauxAnnulation: number;
  heuresPointe: { heure: number; nbCommandes: number }[];
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  readonly data = signal<StatistiquesDetaillees | null>(null);
  readonly chargement = signal(false);
  readonly periode = signal(30);

  constructor(private readonly http: HttpClient) {
    this.charger();
  }

  async definirPeriode(jours: number): Promise<void> {
    this.periode.set(jours);
    await this.charger();
  }

  async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      const rep = await firstValueFrom(
        this.http.get<any>(`${API}/statistiques/detaillees`, { params: { periode: this.periode() } })
      );
      this.data.set({
        periodeJours: rep.periode_jours,
        evolutionCa: rep.evolution_ca.map((e: any) => ({ date: e.date, montant: e.montant })),
        repartitionPaiement: rep.repartition_paiement,
        topCategories: rep.top_categories.map((c: any) => ({ categorieNom: c.categorie_nom, quantite: c.quantite })),
        panierMoyen: rep.panier_moyen,
        tauxAnnulation: rep.taux_annulation,
        heuresPointe: rep.heures_pointe.map((h: any) => ({ heure: h.heure, nbCommandes: h.nb_commandes })),
      });
    } finally {
      this.chargement.set(false);
    }
  }
}