import { Injectable, computed, signal } from '@angular/core';
import { AdresseLivraisonForm, CartItem, InfosEmporter } from '../models/panier';
import { ModeCommande } from '../enums/enums';
import { Produit, Variante } from '../models/produit';


function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Panier client — état en mémoire, propre à la session du navigateur.
 * Pas de persistance ; un rafraîchissement de page vide le panier (comportement
 * volontairement simple pour la V1, cohérent avec l'absence de compte client).
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  private readonly _mode = signal<ModeCommande | null>(null);
  private readonly _tableId = signal<string | null>(null);
  private readonly _notes = signal<string>('');
  private readonly _infosEmporter = signal<InfosEmporter>({ nom: '', telephone: '', heureRetrait: null });
  private readonly _adresseLivraison = signal<AdresseLivraisonForm>({ adresseComplete: '', quartier: '', ville: '', indications: '' });

  readonly items = this._items.asReadonly();
  readonly mode = this._mode.asReadonly();
  readonly tableId = this._tableId.asReadonly();
  readonly notes = this._notes.asReadonly();
  readonly infosEmporter = this._infosEmporter.asReadonly();
  readonly adresseLivraison = this._adresseLivraison.asReadonly();

  readonly nombreArticles = computed(() => this._items().reduce((acc, i) => acc + i.quantite, 0));
  readonly total = computed(() => this._items().reduce((acc, i) => acc + i.sousTotal, 0));
  readonly estVide = computed(() => this._items().length === 0);

  initialiserContexte(tableId: string | null, mode: ModeCommande | null): void {
    this._tableId.set(tableId);
    this._mode.set(mode ?? (tableId ? ModeCommande.SUR_PLACE : null));
  }

  definirMode(mode: ModeCommande): void {
    this._mode.set(mode);
  }

  definirNotes(notes: string): void {
    this._notes.set(notes);
  }

  definirInfosEmporter(infos: InfosEmporter): void {
    this._infosEmporter.set(infos);
  }

  definirAdresseLivraison(adresse: AdresseLivraisonForm): void {
    this._adresseLivraison.set(adresse);
  }

  ajouter(produit: Produit, variante: Variante | null, quantite: number): void {
    const prixUnitaire = variante ? variante.prix : produit.prix;
    const nomComplet = variante ? `${produit.nom} (${variante.nom})` : produit.nom;

    this._items.update((liste) => {
      const existant = liste.find((i) => i.produitId === produit.id && i.varianteId === (variante?.id ?? null));
      if (existant) {
        return liste.map((i) =>
          i.id === existant.id
            ? { ...i, quantite: i.quantite + quantite, sousTotal: (i.quantite + quantite) * i.prixUnitaire }
            : i
        );
      }
      const nouveauItem: CartItem = {
        id: uid(), produitId: produit.id, produitNom: nomComplet,
        varianteId: variante?.id ?? null, varianteNom: variante?.nom ?? null,
        prixUnitaire, quantite, sousTotal: prixUnitaire * quantite,
      };
      return [...liste, nouveauItem];
    });
  }

  modifierQuantite(itemId: string, delta: number): void {
    this._items.update((liste) =>
      liste
        .map((i) => (i.id === itemId ? { ...i, quantite: i.quantite + delta, sousTotal: (i.quantite + delta) * i.prixUnitaire } : i))
        .filter((i) => i.quantite > 0)
    );
  }

  retirer(itemId: string): void {
    this._items.update((liste) => liste.filter((i) => i.id !== itemId));
  }

  vider(): void {
    this._items.set([]);
    this._notes.set('');
  }
}