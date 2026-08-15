import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MenuListComponent } from './features/menu-management/menu-list/menu-list.component';
import { CategorieListComponent } from './features/menu-management/categorie-list/categorie-list.component';
import { ProduitListComponent } from './features/menu-management/produit-list/produit-list.component';
import { ParametresComponent } from './features/settings/parametres/parametres.component';
import { PromotionListComponent } from './features/promotions/promotion-list/promotion-list.component';
import { OrdersPageComponent } from './features/orders/orders-page/orders-page.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { SaasLayoutComponent } from './layout/saas-layout/saas-layout.component';
import { SalleListComponent } from './features/tables-qrcodes/salle-list/salle-list.component';
import { EmployeeListComponent } from './features/employees/employe-list/employe-list.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { MenuClientComponent } from './features/clients/menu-client/menu-client.component';
import { PanierComponent } from './features/clients/panier/panier.component';
import { QrInvalideComponent } from './features/clients/qr-invalide/qr-invalide.component';
import { SuiviCommandeComponent } from './features/clients/suivi-commande/suivi-commande.component';

/**
 * Routing V1 - modules Menu/Categories/Produits, Salles/Tables/QRCodes, Auth.
 * Toutes les routes sous le layout SaaS sont desormais protegees par authGuard.
 */
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: SaasLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'menus', component: MenuListComponent },
      { path: 'menus/:menuId/categories', component: CategorieListComponent },
      { path: 'produits', component: ProduitListComponent },
      { path: 'tables', component: SalleListComponent },
      { path: 'commandes', component: OrdersPageComponent },
      { path: 'employes', component: EmployeeListComponent },
      { path: 'promotions', component: PromotionListComponent },
      { path: 'parametres', component: ParametresComponent },
    ],
  },
 {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'menu-client' },
      { path: 'menu-client', component: MenuClientComponent },
      { path: 'qr-invalide', component: QrInvalideComponent },
      { path: 'suivi-commande', component: SuiviCommandeComponent },
     
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
