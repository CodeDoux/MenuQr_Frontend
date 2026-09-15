import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

export interface PublicMenuData {
  restaurantId: string;
  restaurantNom: string;
  restaurantAdresse: string | null;
  restaurantTelephone: string | null;
  restaurantDescription: string | null;
  horaires: { jour: string; ouverture: string | null; fermeture: string | null; ferme: boolean }[];
  moyensPaiement: string[];
  typeQr: string;
  tableId: string | null;
  tableNumero: string | null;
  salleNom: string | null;
  menus: any[];
  produits: any[];
  zonesLivraison: any[];
  promotionsProduits: Record<string, { typeReduction: string; valeur: number }>;
  promotionGlobale: { nom: string; typeReduction: string; valeur: number } | null;
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

export interface InfosEmporterPayload {
  nomClient: string;
  telephoneClient: string;
  heureRetraitSouhaitee?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PublicOrderService {
  constructor(private readonly http: HttpClient) {}

  async chargerMenu(code: string): Promise<PublicMenuData> {
    const rep = await firstValueFrom(this.http.get<any>(`${API}/public/menu`, { params: { code } }));
    return {
      restaurantId: rep.restaurant_id, restaurantNom: rep.restaurant_nom, typeQr: rep.type_qr,
      restaurantAdresse: rep.restaurant_adresse, restaurantTelephone: rep.restaurant_telephone,
      restaurantDescription: rep.restaurant_description,
      horaires: (rep.horaires ?? []).map((h: any) => ({
        jour: h.jour, ouverture: h.ouverture, fermeture: h.fermeture, ferme: h.ferme,
      })),
      moyensPaiement: rep.moyens_paiement ?? [],
      tableId: rep.table_id, tableNumero: rep.table_numero, salleNom: rep.salle_nom,
      menus: rep.menus.data ?? rep.menus,
      produits: rep.produits.data ?? rep.produits,
      zonesLivraison: rep.zones_livraison?.data ?? rep.zones_livraison ?? [],
      promotionsProduits: Object.fromEntries(
        Object.entries(rep.promotions_produits ?? {}).map(([id, p]: [string, any]) => [
          id, { typeReduction: p.type_reduction, valeur: Number(p.valeur) },
        ])
      ),
      promotionGlobale: rep.promotion_globale
        ? { nom: rep.promotion_globale.nom, typeReduction: rep.promotion_globale.type_reduction, valeur: Number(rep.promotion_globale.valeur) }
        : null,
          };
  }

  async creerCommande(
    code: string, mode: string, items: CommandeItem[], notes: string | null,
    infosLivraison: InfosLivraison | null = null,
    infosEmporter: InfosEmporterPayload | null = null
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

    if (infosEmporter) {
      body.nom_client = infosEmporter.nomClient;
      body.telephone_client = infosEmporter.telephoneClient;
      body.heure_retrait_souhaitee = infosEmporter.heureRetraitSouhaitee ?? null;
    }

    const rep = await firstValueFrom(this.http.post<{ data: any }>(`${API}/public/commandes`, body));
    return rep.data;
  }

  async chargerCommande(id: string): Promise<any> {
    const rep = await firstValueFrom(this.http.get<{ data: any }>(`${API}/public/commandes/${id}`));
    return rep.data;
  }

  async chargerCommandesDeLaVisite(commandeId: string): Promise<{ commandes: any[]; additionSousTotal: number | null; additionRemise: number | null; additionTotal: number | null }> {
  const rep = await firstValueFrom(
    this.http.get<{ data: any[]; addition_sous_total: number | null; addition_remise: number | null; addition_total: number | null }>(
      `${API}/public/commandes/${commandeId}/visite`
    )
  );
  return {
    commandes: rep.data,
    additionSousTotal: rep.addition_sous_total !== null ? Number(rep.addition_sous_total) : null,
    additionRemise: rep.addition_remise !== null ? Number(rep.addition_remise) : null,
    additionTotal: rep.addition_total !== null ? Number(rep.addition_total) : null,
  };
}

  async payer(commandeId: string, methode: string): Promise<void> {
    await firstValueFrom(this.http.post(`${API}/public/commandes/${commandeId}/payer`, { methode }));
  }
}