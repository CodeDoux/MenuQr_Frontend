import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { Categorie } from '../models/categorie';
import { User } from '../models/user';
import { Produit } from '../models/produit';
import { Client } from '../models/client';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  discount?: number;
}

interface DeliveryOption {
  id: string;
  label: string;
}




interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}



interface OrderRequest {
  tableNumber: number;
  deliveryType: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = 'https://api.votre-restaurant.com/api'; // À remplacer par votre URL
  
  // BehaviorSubjects pour gérer l'état
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  private currentTable$ = new BehaviorSubject<number>(4);

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  // ============================================
  // CATEGORIES
  // ============================================

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`http://127.0.0.1:8000/api/categories`).pipe(
      catchError(this.handleError)
    );
  }

  getCategoryById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/categories/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // MENU ITEMS
  // ============================================

  getMenuItems(categoryName?: string): Observable<MenuItem[]> {
    const url = categoryName && categoryName !== 'All' && categoryName !== 'Tout'
      ? `${this.apiUrl}/produits?category=${encodeURIComponent(categoryName)}`
      : `${this.apiUrl}/produits`;
    
    return this.http.get<MenuItem[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getMenuItemById(id: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/menu-items/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchMenuItems(query: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/menu-items/search?q=${encodeURIComponent(query)}`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // PANIER (CART)
  // ============================================

  getCart(): Observable<CartItem[]> {
    return this.cartItems$.asObservable();
  }

  addToCart(item: Produit): void {
    const currentCart = this.cartItems$.value;
    const existingItem = currentCart.find(ci => ci.id === item.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      currentCart.push({
        id: item.id,
        name: item.nom,
        price: item.prix,
        image: item.image,
        quantity: 1
      });
    }
    
    this.cartItems$.next([...currentCart]);
    this.saveCart();
  }

  updateQuantity(itemId: number, quantity: number): void {
    const currentCart = this.cartItems$.value;
    const item = currentCart.find(ci => ci.id === itemId);
    
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        this.cartItems$.next([...currentCart]);
        this.saveCart();
      }
    }
  }

  removeFromCart(itemId: number): void {
    const currentCart = this.cartItems$.value.filter(ci => ci.id !== itemId);
    this.cartItems$.next(currentCart);
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems$.next([]);
    this.saveCart();
  }

  private saveCart(): void {
    // Sauvegarder dans le localStorage pour persistance
    const cart = this.cartItems$.value;
    // N'utilisons PAS localStorage - stockons en mémoire uniquement
    // ou envoyons au backend si nécessaire
  }

  private loadCart(): void {
    // Charger depuis le backend si l'utilisateur est connecté
    // Sinon, le panier reste vide au démarrage
  }

  // ============================================
  // CALCULS
  // ============================================

  getSubTotal(): Observable<number> {
    return this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
    );
  }

  getTax(taxRate: number = 0.025): Observable<number> {
    return this.getSubTotal().pipe(
      map(subtotal => subtotal * taxRate)
    );
  }

  getTotal(taxRate: number = 0.025): Observable<number> {
    return this.getSubTotal().pipe(
      map(subtotal => subtotal * (1 + taxRate))
    );
  }

  // ============================================
  // COMMANDES
  // ============================================

  placeOrder(orderData: OrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/orders`, orderData).pipe(
      tap(() => this.clearCart()),
      catchError(this.handleError)
    );
  }

  getOrderHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/history`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // CLIENTS & TABLES
  // ============================================

  getCustomers(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/customers`).pipe(
      catchError(this.handleError)
    );
  }

  getCurrentTable(): Observable<number> {
    return this.currentTable$.asObservable();
  }

  setCurrentTable(tableNumber: number): void {
    this.currentTable$.next(tableNumber);
  }

  getTableStatus(tableNumber: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tables/${tableNumber}/status`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // OPTIONS DE LIVRAISON
  // ============================================

  getDeliveryOptions(): Observable<DeliveryOption[]> {
    return this.http.get<DeliveryOption[]>(`${this.apiUrl}/delivery-options`).pipe(
      catchError(this.handleError)
    );
  }

  // ============================================
  // GESTION DES ERREURS
  // ============================================

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
