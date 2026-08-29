import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface PublicMenuData {
  restaurantId: string;
  typeQr: string;
  tableId: string | null;
  tableNumero: string | null;
  menus: any[];
  produits: any[];
  zonesLivraison: any[];
}

export interface CommandeItem {
  produitId: string;
  varianteId?: string | null;
  quantite: number;
  notes?: string | null;
}

export interface InfosLivraison {
  nomClient: string;
  telephoneClient: string;
  adresseComplete: string;
  quartier?: string | null;
  indications?: string | null;
  zoneLivraisonId: string;
}

@Injectable({ providedIn: 'root' })
export class PublicOrderService {
  constructor(private readonly http: HttpClient) {}

  async chargerMenu(code: string): Promise<PublicMenuData> {
    const rep = await firstValueFrom(this.http.get<any>(`${API}/public/menu`, { params: { code } }));
    return {
      restaurantId: rep.restaurant_id, typeQr: rep.type_qr,
      tableId: rep.table_id, tableNumero: rep.table_numero,
      menus: rep.menus.data ?? rep.menus,
      produits: rep.produits.data ?? rep.produits,
      zonesLivraison: rep.zones_livraison?.data ?? rep.zones_livraison ?? [],
    };
  }

  async creerCommande(
    code: string, mode: string, items: CommandeItem[], notes: string | null,
    infosLivraison: InfosLivraison | null = null
  ): Promise<any> {
    const body: any = {
      code, mode, notes,
      items: items.map((i) => ({
        produit_id: i.produitId, variante_id: i.varianteId ?? null,
        quantite: i.quantite, notes: i.notes ?? null,
      })),
    };

    if (infosLivraison) {
      body.nom_client = infosLivraison.nomClient;
      body.telephone_client = infosLivraison.telephoneClient;
      body.adresse_complete = infosLivraison.adresseComplete;
      body.quartier = infosLivraison.quartier ?? null;
      body.indications = infosLivraison.indications ?? null;
      body.zone_livraison_id = infosLivraison.zoneLivraisonId;
    }

    const rep = await firstValueFrom(this.http.post<{ data: any }>(`${API}/public/commandes`, body));
    return rep.data;
  }

  async chargerCommande(id: string): Promise<any> {
    const rep = await firstValueFrom(this.http.get<{ data: any }>(`${API}/public/commandes/${id}`));
    return rep.data;
  }

  async chargerCommandesDeLaVisite(commandeId: string): Promise<any[]> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/public/commandes/${commandeId}/visite`));
    return rep.data;
  }

  async payer(commandeId: string, methode: string): Promise<void> {
    await firstValueFrom(this.http.post(`${API}/public/commandes/${commandeId}/payer`, { methode }));
  }
}