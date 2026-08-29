import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatutProduit } from '../../core/enums/enums';
import { Menu, MenuFormPayload } from '../models/menu';
import { Categorie, CategorieFormPayload } from '../models/categorie';
import { ImageProduit, Produit, ProduitFormPayload, Variante } from '../models/produit';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class MenuManagementService {
  private readonly _menus = signal<Menu[]>([]);
  private readonly _categories = signal<Categorie[]>([]);
  private readonly _produits = signal<Produit[]>([]);

  readonly menus = this._menus.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly produits = this._produits.asReadonly();

  readonly menusTries = computed(() =>
    [...this._menus()].sort((a, b) => a.ordreAffichage - b.ordreAffichage)
  );

  constructor(private readonly http: HttpClient) {
    this.chargerTout();
  }

  private async chargerTout(): Promise<void> {
    const repMenus = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/menus`));
    const menus = repMenus.data.map((m) => this.mapMenu(m));
    this._menus.set(menus);

    const toutesCategories: Categorie[] = [];
    for (const menu of menus) {
      const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/menus/${menu.id}/categories`));
      toutesCategories.push(...rep.data.map((c) => this.mapCategorie(c)));
    }
    this._categories.set(toutesCategories);

    const repProduits = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/produits`));
    this._produits.set(repProduits.data.map((p) => this.mapProduit(p)));
  }

  // ============================================================
  // MENUS
  // ============================================================

  categoriesDuMenu(menuId: string) {
    return computed(() =>
      this._categories()
        .filter((c) => c.menuId === menuId)
        .sort((a, b) => a.ordreAffichage - b.ordreAffichage)
    );
  }

  async creerMenu(payload: MenuFormPayload): Promise<Menu> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/menus`, this.menuPayloadVersApi(payload))
    );
    const nouveau = this.mapMenu(rep.data);
    this._menus.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  async modifierMenu(id: string, payload: MenuFormPayload): Promise<void> {
    const rep = await firstValueFrom(
      this.http.put<{ data: any }>(`${API}/menus/${id}`, this.menuPayloadVersApi(payload))
    );
    const maj = this.mapMenu(rep.data);
    this._menus.update((liste) => liste.map((m) => (m.id === id ? maj : m)));
  }

  async supprimerMenu(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${API}/menus/${id}`));
    this._menus.update((liste) => liste.filter((m) => m.id !== id));
    this._categories.update((liste) => liste.filter((c) => c.menuId !== id));
  }

  // ============================================================
  // CATÉGORIES
  // ============================================================

  async creerCategorie(payload: CategorieFormPayload): Promise<Categorie> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(
        `${API}/menus/${payload.menuId}/categories`,
        this.categoriePayloadVersApi(payload)
      )
    );
    const nouvelle = this.mapCategorie(rep.data);
    this._categories.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  async modifierCategorie(id: string, payload: Omit<CategorieFormPayload, 'menuId'>): Promise<void> {
    const existante = this._categories().find((c) => c.id === id);
    if (!existante) return;

    const rep = await firstValueFrom(
      this.http.put<{ data: any }>(
        `${API}/menus/${existante.menuId}/categories/${id}`,
        this.categoriePayloadVersApi({ ...payload, menuId: existante.menuId })
      )
    );
    const maj = this.mapCategorie(rep.data);
    this._categories.update((liste) => liste.map((c) => (c.id === id ? maj : c)));
  }

  async supprimerCategorie(id: string): Promise<void> {
    const existante = this._categories().find((c) => c.id === id);
    if (!existante) return;

    await firstValueFrom(this.http.delete(`${API}/menus/${existante.menuId}/categories/${id}`));
    this._categories.update((liste) => liste.filter((c) => c.id !== id));
    this._produits.update((liste) =>
      liste.map((p) => ({ ...p, categorieIds: p.categorieIds.filter((cid) => cid !== id) }))
    );
  }

  // ============================================================
  // PRODUITS
  // ============================================================

  produitsFiltres(categorieId: string | undefined, recherche: string) {
    return computed(() => {
      const texte = recherche.trim().toLowerCase();
      return this._produits().filter((p) => {
        const matchCategorie = !categorieId || p.categorieIds.includes(categorieId);
        const matchTexte = !texte || p.nom.toLowerCase().includes(texte);
        return matchCategorie && matchTexte && p.statut === StatutProduit.ACTIF;
      });
    });
  }

  async creerProduit(payload: ProduitFormPayload): Promise<Produit> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/produits`, this.produitPayloadVersApi(payload))
    );
    const nouveau = this.mapProduit(rep.data);
    this._produits.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  async modifierProduit(id: string, payload: ProduitFormPayload): Promise<void> {
    const rep = await firstValueFrom(
      this.http.put<{ data: any }>(`${API}/produits/${id}`, this.produitPayloadVersApi(payload))
    );
    const maj = this.mapProduit(rep.data);
    this._produits.update((liste) => liste.map((p) => (p.id === id ? maj : p)));
  }

  async archiverProduit(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${API}/produits/${id}/archiver`, {}));
    this._produits.update((liste) => liste.filter((p) => p.id !== id));
  }

  async basculerDisponibilite(id: string): Promise<void> {
    const produit = this._produits().find((p) => p.id === id);
    if (!produit) return;

    await this.modifierProduit(id, {
      nom: produit.nom,
      description: produit.description,
      prix: produit.prix,
      estDisponible: !produit.estDisponible,
      estVisible: produit.estVisible,
      estPopulaire: produit.estPopulaire,
      tempsPreparation: produit.tempsPreparation,
      categorieIds: produit.categorieIds,
      variantes: produit.variantes.map((v) => ({ nom: v.nom, prix: v.prix, estDisponible: v.estDisponible })),
      images: produit.images.map((i) => ({ url: i.url, ordreAffichage: i.ordreAffichage, estPrincipale: i.estPrincipale })),
    });
  }

  // ============================================================
  // Mappers API (snake_case) <-> Frontend (camelCase)
  // ============================================================

  private mapMenu(api: any): Menu {
    return {
      id: api.id,
      restaurantId: '',
      nom: api.nom,
      description: api.description,
      image: api.image,
      ordreAffichage: api.ordre_affichage,
      estActif: api.est_actif,
      dateDebut: api.date_debut,
      dateFin: api.date_fin,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
    };
  }

  private menuPayloadVersApi(payload: MenuFormPayload) {
    return {
      nom: payload.nom,
      description: payload.description,
      image: payload.image,
      ordre_affichage: payload.ordreAffichage,
      est_actif: payload.estActif,
      date_debut: payload.dateDebut,
      date_fin: payload.dateFin,
    };
  }

  private mapCategorie(api: any): Categorie {
    return {
      id: api.id,
      menuId: api.menu_id,
      nom: api.nom,
      description: api.description,
      icone: api.icone,
      ordreAffichage: api.ordre_affichage,
      estActive: api.est_active,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
    };
  }

  private categoriePayloadVersApi(payload: CategorieFormPayload) {
    return {
      nom: payload.nom,
      description: payload.description,
      icone: payload.icone,
      ordre_affichage: payload.ordreAffichage,
      est_active: payload.estActive,
    };
  }

  private mapProduit(api: any): Produit {
    return {
      id: api.id,
      restaurantId: '',
      nom: api.nom,
      description: api.description,
      prix: Number(api.prix),
      estDisponible: api.est_disponible,
      estVisible: api.est_visible,
      estPopulaire: api.est_populaire,
      tempsPreparation: api.temps_preparation,
      statut: api.statut as StatutProduit,
      createdAt: api.created_at,
      updatedAt: api.updated_at,
      categorieIds: api.categorie_ids ?? [],
      variantes: (api.variantes ?? []).map((v: any): Variante => ({
        id: v.id, produitId: api.id, nom: v.nom, prix: Number(v.prix), estDisponible: v.est_disponible,
      })),
      images: (api.images ?? []).map((img: any): ImageProduit => ({
        id: img.id, produitId: api.id, url: img.url, ordreAffichage: img.ordre_affichage, estPrincipale: img.est_principale,
      })),
    };
  }

  private produitPayloadVersApi(payload: ProduitFormPayload) {
    return {
      nom: payload.nom,
      description: payload.description,
      prix: payload.prix,
      est_disponible: payload.estDisponible,
      est_visible: payload.estVisible,
      est_populaire: payload.estPopulaire,
      temps_preparation: payload.tempsPreparation,
      categorie_ids: payload.categorieIds,
      variantes: payload.variantes.map((v) => ({ nom: v.nom, prix: v.prix, est_disponible: v.estDisponible })),
      images: payload.images.map((i) => ({ url: i.url, ordre_affichage: i.ordreAffichage, est_principale: i.estPrincipale })),
    };
  }
}