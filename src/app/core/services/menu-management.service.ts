import { Injectable, computed, signal } from '@angular/core';
import { Menu, MenuFormPayload } from '../models/menu';
import { Categorie, CategorieFormPayload } from '../models/categorie';
import { Produit, ProduitFormPayload } from '../models/produit';
import { StatutProduit } from '../enums/enums';

/**
 * ⚠️ MOCK DATA — Service temporaire en attendant l'API réelle.
 *
 * Toute la logique CRUD est simulée en mémoire (signals Angular).
 * Le contrat des méthodes publiques (retour, signature) est conçu pour rester
 * identique une fois branché sur de vrais appels HTTP : seul le corps des
 * méthodes changera (fetch/post/put/delete au lieu de manipuler les signals
 * directement). Aucun composant ne doit dépendre de l'aspect "mock".
 *
 * RESTAURANT_ID_COURANT simule le restaurant de l'utilisateur connecté —
 * à remplacer par la valeur réelle fournie par AuthService une fois l'auth branchée.
 */

const RESTAURANT_ID_COURANT = 'rest-001';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable({ providedIn: 'root' })
export class MenuManagementService {
  // --- State interne (signals) ---
  private readonly _menus = signal<Menu[]>(this.seedMenus());
  private readonly _categories = signal<Categorie[]>(this.seedCategories());
  private readonly _produits = signal<Produit[]>(this.seedProduits());

  // --- Lecture publique (readonly) ---
  readonly menus = this._menus.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly produits = this._produits.asReadonly();

  /** Menus triés par ordre d'affichage */
  readonly menusTries = computed(() =>
    [...this._menus()].sort((a, b) => a.ordreAffichage - b.ordreAffichage)
  );

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

  creerMenu(payload: MenuFormPayload): Menu {
    const nouveau: Menu = {
      id: uid('menu'),
      restaurantId: RESTAURANT_ID_COURANT,
      ...payload,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this._menus.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  modifierMenu(id: string, payload: MenuFormPayload): void {
    this._menus.update((liste) =>
      liste.map((m) => (m.id === id ? { ...m, ...payload, updatedAt: nowIso() } : m))
    );
  }

  supprimerMenu(id: string): void {
    this._menus.update((liste) => liste.filter((m) => m.id !== id));
    // Suppression en cascade des catégories rattachées (cohérent avec Menu 1─N Categorie)
    this._categories.update((liste) => liste.filter((c) => c.menuId !== id));
  }

  // ============================================================
  // CATÉGORIES
  // ============================================================

  creerCategorie(payload: CategorieFormPayload): Categorie {
    const nouvelle: Categorie = {
      id: uid('cat'),
      ...payload,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this._categories.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  modifierCategorie(id: string, payload: Omit<CategorieFormPayload, 'menuId'>): void {
    this._categories.update((liste) =>
      liste.map((c) => (c.id === id ? { ...c, ...payload, updatedAt: nowIso() } : c))
    );
  }

  supprimerCategorie(id: string): void {
    this._categories.update((liste) => liste.filter((c) => c.id !== id));
    // Retire la référence dans les produits associés (relation N:N via CategorieProduit)
    this._produits.update((liste) =>
      liste.map((p) => ({ ...p, categorieIds: p.categorieIds.filter((cid) => cid !== id) }))
    );
  }

  // ============================================================
  // PRODUITS
  // ============================================================

  /** Produits filtrés par catégorie (undefined = tous) et recherche texte */
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

  creerProduit(payload: ProduitFormPayload): Produit {
    const nouveau: Produit = {
      id: uid('prod'),
      restaurantId: RESTAURANT_ID_COURANT,
      nom: payload.nom,
      description: payload.description,
      prix: payload.prix,
      estDisponible: payload.estDisponible,
      estVisible: payload.estVisible,
      estPopulaire: payload.estPopulaire,
      tempsPreparation: payload.tempsPreparation,
      statut: StatutProduit.ACTIF,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      categorieIds: payload.categorieIds,
      variantes: payload.variantes.map((v) => ({ ...v, id: uid('var'), produitId: '' })),
      images: payload.images.map((img) => ({ ...img, id: uid('img'), produitId: '' })),
    };
    // Rattache l'id produit aux variantes et images générées
    nouveau.variantes = nouveau.variantes.map((v) => ({ ...v, produitId: nouveau.id }));
    nouveau.images = nouveau.images.map((img) => ({ ...img, produitId: nouveau.id }));
    this._produits.update((liste) => [...liste, nouveau]);
    return nouveau;
  }

  modifierProduit(id: string, payload: ProduitFormPayload): void {
    this._produits.update((liste) =>
      liste.map((p) =>
        p.id === id
          ? {
              ...p,
              nom: payload.nom,
              description: payload.description,
              prix: payload.prix,
              estDisponible: payload.estDisponible,
              estVisible: payload.estVisible,
              estPopulaire: payload.estPopulaire,
              tempsPreparation: payload.tempsPreparation,
              categorieIds: payload.categorieIds,
              variantes: payload.variantes.map((v, i) => ({
                ...v,
                id: p.variantes[i]?.id ?? uid('var'),
                produitId: p.id,
              })),
              images: payload.images.map((img, i) => ({
                ...img,
                id: p.images[i]?.id ?? uid('img'),
                produitId: p.id,
              })),
              updatedAt: nowIso(),
            }
          : p
      )
    );
  }

  /** Archivage (pas de suppression physique — RM09 : ne jamais casser l'historique des LigneCommande) */
  archiverProduit(id: string): void {
    this._produits.update((liste) =>
      liste.map((p) => (p.id === id ? { ...p, statut: StatutProduit.ARCHIVE, updatedAt: nowIso() } : p))
    );
  }

  basculerDisponibilite(id: string): void {
    this._produits.update((liste) =>
      liste.map((p) => (p.id === id ? { ...p, estDisponible: !p.estDisponible, updatedAt: nowIso() } : p))
    );
  }

  // ============================================================
  // Données de départ (mock)
  // ============================================================

  private seedMenus(): Menu[] {
    return [
      {
        id: 'menu-principal',
        restaurantId: RESTAURANT_ID_COURANT,
        nom: 'Menu Principal',
        description: 'Carte principale du restaurant',
        image: null,
        ordreAffichage: 1,
        estActif: true,
        dateDebut: null,
        dateFin: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    ];
  }

  private seedCategories(): Categorie[] {
    return [
      { id: 'cat-entrees', menuId: 'menu-principal', nom: 'Entrées', description: null, icone: '🥗', ordreAffichage: 1, estActive: true, createdAt: nowIso(), updatedAt: nowIso() },
      { id: 'cat-plats', menuId: 'menu-principal', nom: 'Plats', description: null, icone: '🍽️', ordreAffichage: 2, estActive: true, createdAt: nowIso(), updatedAt: nowIso() },
      { id: 'cat-boissons', menuId: 'menu-principal', nom: 'Boissons', description: null, icone: '🥤', ordreAffichage: 3, estActive: true, createdAt: nowIso(), updatedAt: nowIso() },
      { id: 'cat-desserts', menuId: 'menu-principal', nom: 'Desserts', description: null, icone: '🍰', ordreAffichage: 4, estActive: true, createdAt: nowIso(), updatedAt: nowIso() },
    ];
  }

  private seedProduits(): Produit[] {
    return [
      {
        id: 'prod-yassa', restaurantId: RESTAURANT_ID_COURANT, nom: 'Yassa Poulet',
        description: 'Poulet mariné au citron et oignons', prix: 3500,
        estDisponible: true, estVisible: true, estPopulaire: true, tempsPreparation: 20,
        statut: StatutProduit.ACTIF, createdAt: nowIso(), updatedAt: nowIso(),
        categorieIds: ['cat-plats'], variantes: [], images: [],
      },
      {
        id: 'prod-thieb', restaurantId: RESTAURANT_ID_COURANT, nom: 'Thiéboudiène',
        description: 'Riz au poisson', prix: 4000,
        estDisponible: true, estVisible: true, estPopulaire: false, tempsPreparation: 25,
        statut: StatutProduit.ACTIF, createdAt: nowIso(), updatedAt: nowIso(),
        categorieIds: ['cat-plats'], variantes: [], images: [],
      },
      {
        id: 'prod-coca', restaurantId: RESTAURANT_ID_COURANT, nom: 'Coca-Cola',
        description: null, prix: 500,
        estDisponible: true, estVisible: true, estPopulaire: false, tempsPreparation: null,
        statut: StatutProduit.ACTIF, createdAt: nowIso(), updatedAt: nowIso(),
        categorieIds: ['cat-boissons'], variantes: [], images: [],
      },
      {
        id: 'prod-pizza', restaurantId: RESTAURANT_ID_COURANT, nom: 'Pizza Margherita',
        description: 'Tomate, mozzarella, basilic', prix: 3000,
        estDisponible: true, estVisible: true, estPopulaire: true, tempsPreparation: 15,
        statut: StatutProduit.ACTIF, createdAt: nowIso(), updatedAt: nowIso(),
        categorieIds: ['cat-plats'],
        variantes: [
          { id: 'var-p', produitId: 'prod-pizza', nom: 'Petite', prix: 3000, estDisponible: true },
          { id: 'var-m', produitId: 'prod-pizza', nom: 'Moyenne', prix: 4500, estDisponible: true },
          { id: 'var-g', produitId: 'prod-pizza', nom: 'Grande', prix: 6000, estDisponible: true },
        ],
        images: [],
      },
    ];
  }
}
