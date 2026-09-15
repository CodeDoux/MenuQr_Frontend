import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatutProduit } from '../../core/enums/enums';
import { Menu, MenuFormPayload } from '../models/menu';
import { Categorie, CategorieFormPayload } from '../models/categorie';
import { ImageProduit, Produit, ProduitFormPayload, Variante } from '../models/produit';

const API = environment.apiUrl;

export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class MenuManagementService {
  private readonly _menus = signal<Menu[]>([]);
  private readonly _categories = signal<Categorie[]>([]);

  // --- Produits : page actuellement affichée (liste paginée côté serveur) ---
  private readonly _produitsPage = signal<Produit[]>([]);
  private readonly _produitsMeta = signal<PaginationMeta>({ currentPage: 1, lastPage: 1, perPage: 24, total: 0 });

  // --- Produits : liste complète, pour les consommateurs qui en ont besoin
  //     en entier (ex. sélecteur de produits du formulaire Promotion) ---
  private readonly _produitsTous = signal<Produit[]>([]);

  readonly menus = this._menus.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly produitsPage = this._produitsPage.asReadonly();
  readonly produitsMeta = this._produitsMeta.asReadonly();
  readonly produitsTous = this._produitsTous.asReadonly();

  readonly menusTries = computed(() =>
    [...this._menus()].sort((a, b) => a.ordreAffichage - b.ordreAffichage)
  );

  // Mémorise les derniers filtres utilisés, pour pouvoir rafraîchir la même
  // page après une création/modification/archivage sans que l'appelant ait
  // à les répéter.
  private dernierePage = 1;
  private dernierPerPage = 24;
  private derniereRecherche = '';
  private dernierCategorieId: string | null = null;

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

    // ⚠️ Les produits ne sont plus chargés en entier ici (risque de
    // performance avec des centaines de produits) — voir chargerProduits()
    // (paginé, pour la liste) et chargerTousLesProduits() (pour les
    // sélecteurs qui ont vraiment besoin de tout, ex. Promotion).
    await this.chargerProduits();
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
    await this.rafraichirPageActuelle();
  }

  // ============================================================
  // PRODUITS — pagination + recherche/filtre côté serveur
  // ============================================================

  /** Charge une page de produits, avec recherche/filtre catégorie optionnels. */
  async chargerProduits(
    page: number = this.dernierePage,
    perPage: number = this.dernierPerPage,
    recherche: string = this.derniereRecherche,
    categorieId: string | null = this.dernierCategorieId
  ): Promise<void> {
    this.dernierePage = page;
    this.dernierPerPage = perPage;
    this.derniereRecherche = recherche;
    this.dernierCategorieId = categorieId;

    const params: Record<string, string | number> = { page, per_page: perPage };
    if (recherche) params['recherche'] = recherche;
    if (categorieId) params['categorie_id'] = categorieId;

    const rep = await firstValueFrom(this.http.get<any>(`${API}/produits`, { params }));

    this._produitsPage.set(rep.data.map((p: any) => this.mapProduit(p)));
    this._produitsMeta.set({
      currentPage: rep.meta.current_page,
      lastPage: rep.meta.last_page,
      perPage: rep.meta.per_page,
      total: rep.meta.total,
    });
  }

  /** Charge TOUS les produits (sans pagination) — pour les sélecteurs qui
   *  ont besoin de la liste complète (ex. formulaire Promotion). */
  async chargerTousLesProduits(): Promise<Produit[]> {
    const rep = await firstValueFrom(this.http.get<{ data: any[] }>(`${API}/produits`));
    const tous = rep.data.map((p: any) => this.mapProduit(p));
    this._produitsTous.set(tous);
    return tous;
  }

  private async rafraichirPageActuelle(): Promise<void> {
    await this.chargerProduits(this.dernierePage, this.dernierPerPage, this.derniereRecherche, this.dernierCategorieId);
  }

  async creerProduit(payload: ProduitFormPayload): Promise<Produit> {
    const rep = await firstValueFrom(
      this.http.post<{ data: any }>(`${API}/produits`, this.produitPayloadVersApi(payload))
    );
    const nouveau = this.mapProduit(rep.data);
    await this.rafraichirPageActuelle();
    return nouveau;
  }

  async modifierProduit(id: string, payload: ProduitFormPayload): Promise<void> {
    await firstValueFrom(
      this.http.put<{ data: any }>(`${API}/produits/${id}`, this.produitPayloadVersApi(payload))
    );
    await this.rafraichirPageActuelle();
  }

  async archiverProduit(id: string): Promise<void> {
    await firstValueFrom(this.http.patch(`${API}/produits/${id}/archiver`, {}));
    await this.rafraichirPageActuelle();
  }

  async basculerDisponibilite(id: string): Promise<void> {
    const produit = this._produitsPage().find((p) => p.id === id);
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
      id: api.id, restaurantId: '', nom: api.nom, description: api.description, image: api.image,
      ordreAffichage: api.ordre_affichage, estActif: api.est_actif,
      dateDebut: api.date_debut, dateFin: api.date_fin,
      createdAt: api.created_at, updatedAt: api.updated_at,
    };
  }

  private menuPayloadVersApi(payload: MenuFormPayload) {
    return {
      nom: payload.nom, description: payload.description, image: payload.image,
      ordre_affichage: payload.ordreAffichage, est_actif: payload.estActif,
      date_debut: payload.dateDebut, date_fin: payload.dateFin,
    };
  }

  private mapCategorie(api: any): Categorie {
    return {
      id: api.id, menuId: api.menu_id, nom: api.nom, description: api.description, icone: api.icone,
      ordreAffichage: api.ordre_affichage, estActive: api.est_active,
      createdAt: api.created_at, updatedAt: api.updated_at,
    };
  }

  private categoriePayloadVersApi(payload: CategorieFormPayload) {
    return {
      nom: payload.nom, description: payload.description, icone: payload.icone,
      ordre_affichage: payload.ordreAffichage, est_active: payload.estActive,
    };
  }

  private mapProduit(api: any): Produit {
    return {
      id: api.id, restaurantId: '', nom: api.nom, description: api.description, prix: Number(api.prix),
      estDisponible: api.est_disponible, estVisible: api.est_visible, estPopulaire: api.est_populaire,
      tempsPreparation: api.temps_preparation, statut: api.statut as StatutProduit,
      createdAt: api.created_at, updatedAt: api.updated_at,
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
      nom: payload.nom, description: payload.description, prix: payload.prix,
      est_disponible: payload.estDisponible, est_visible: payload.estVisible, est_populaire: payload.estPopulaire,
      temps_preparation: payload.tempsPreparation, categorie_ids: payload.categorieIds,
      variantes: payload.variantes.map((v) => ({ nom: v.nom, prix: v.prix, est_disponible: v.estDisponible })),
      images: payload.images.map((i) => ({ url: i.url, ordre_affichage: i.ordreAffichage, est_principale: i.estPrincipale })),
    };
  }
}