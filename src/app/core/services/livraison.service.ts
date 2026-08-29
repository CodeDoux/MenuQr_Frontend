import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeLivreur } from '../../core/enums/enums';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly _zones = signal<any[]>([]);
  private readonly _livraisons = signal<any[]>([]);

  readonly zones = this._zones.asReadonly();
  readonly livraisons = this._livraisons.asReadonly();
  readonly zonesActives = computed(() => this._zones().filter((z) => z.statut === 'ACTIVE'));

  readonly aAssigner = computed(() => this._livraisons().filter((l) => l.statut === 'EN_ATTENTE_AFFECTATION'));
  readonly enCours = computed(() =>
    this._livraisons().filter((l) => ['AFFECTEE', 'RECUPEREE', 'EN_ROUTE'].includes(l.statut))
  );
  readonly terminees = computed(() => this._livraisons().filter((l) => l.statut === 'LIVREE'));

  constructor(private readonly http: HttpClient) {
    this.chargerZones();
    this.chargerLivraisons();
  }

  private async chargerZones(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/zones-livraison`));
    this._zones.set(rep.data.map((z) => this.mapZone(z)));
  }

  private async chargerLivraisons(): Promise<void> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/livraisons`));
    this._livraisons.set(rep.data.map((l) => this.mapLivraison(l)));
  }

  // --- Zones ---

  async creerZone(payload: any): Promise<any> {
    const rep = await firstValueFrom(this.http.post<{ data: any }>(`${API}/zones-livraison`, this.zonePayloadVersApi(payload)));
    const nouvelle = this.mapZone(rep.data);
    this._zones.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  async modifierZone(id: string, payload: any): Promise<void> {
    const rep = await firstValueFrom(this.http.put<{ data: any }>(`${API}/zones-livraison/${id}`, this.zonePayloadVersApi(payload)));
    const maj = this.mapZone(rep.data);
    this._zones.update((liste) => liste.map((z) => (z.id === id ? maj : z)));
  }

  async supprimerZone(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/zones-livraison/${id}`));
    this._zones.update((liste) => liste.filter((z) => z.id !== id));
  }

  // --- Livraisons ---

  async affecterLivreurInterne(livraisonId: string, employeId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API}/livraisons/${livraisonId}/affecter`, { type: 'EMPLOYE_RESTAURANT', employe_id: employeId })
    );
    await this.chargerLivraisons();
  }

  async affecterLivreurExterne(
    livraisonId: string, nom: string, telephone: string,
    type: TypeLivreur.PRESTATAIRE_EXTERNE | TypeLivreur.LIVREUR_CLIENT
  ): Promise<void> {
    await firstValueFrom(this.http.post(`${API}/livraisons/${livraisonId}/affecter`, { type, nom, telephone }));
    await this.chargerLivraisons();
  }

  async avancerStatut(livraisonId: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${API}/livraisons/${livraisonId}/avancer-statut`, {}));
    await this.chargerLivraisons();
  }

  async annulerLivraison(livraisonId: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${API}/livraisons/${livraisonId}/annuler`, {}));
    await this.chargerLivraisons();
  }

  private mapZone(api: any) {
    return { id: api.id, restaurantId: '', nom: api.nom, description: api.description, frais: Number(api.frais), tempsEstime: api.temps_estime, distanceMax: api.distance_max, statut: api.statut };
  }

  private zonePayloadVersApi(payload: any) {
    return { nom: payload.nom, description: payload.description, frais: payload.frais, temps_estime: payload.tempsEstime, distance_max: payload.distanceMax, statut: payload.statut };
  }

  private mapLivraison(api: any) {
    return {
      id: api.id, commandeId: api.commande_id, commandeTotal: Number(api.commande_total ?? 0), commandeStatut: api.commande_statut,
      adresseComplete: api.adresse_complete, quartier: api.quartier, indications: api.indications,
      nomClient: api.nom_client, telephoneClient: api.telephone_client,
      typeLivreur: api.type_livreur, livreurNom: api.livreur_nom,
      nomLivreurExterne: api.nom_livreur_externe, telephoneLivreurExterne: api.telephone_livreur_externe,
      statut: api.statut, zoneNom: api.zone_nom, dateAffectation: api.date_affectation,
    };
  }
}