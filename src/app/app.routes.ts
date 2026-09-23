import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { MenuClientComponent } from './features/clients/menu-client/menu-client.component';
import { PanierComponent } from './features/clients/panier/panier.component';
import { SuiviCommandeComponent } from './features/clients/suivi-commande/suivi-commande.component';
import { QrInvalideComponent } from './features/clients/qr-invalide/qr-invalide.component';
import { MenuListComponent } from './features/menu-management/menu-list/menu-list.component';
import { CategorieListComponent } from './features/menu-management/categorie-list/categorie-list.component';
import { ProduitListComponent } from './features/menu-management/produit-list/produit-list.component';
import { SalleListComponent } from './features/tables-qrcodes/salle-list/salle-list.component';
import { OrdersPageComponent } from './features/orders/orders-page/orders-page.component';
import { EmployeeListComponent } from './features/employees/employe-list/employe-list.component';
import { PromotionListComponent } from './features/promotions/promotion-list/promotion-list.component';
import { ParametresComponent } from './features/settings/parametres/parametres.component';
import { SaasLayoutComponent } from './layout/saas-layout/saas-layout.component';
import { AbonnementComponent } from './features/subcription/abonnement/abonnement.component';
import { MonProfilComponent } from './features/profile/mon-profil/mon-profil/mon-profil.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { AcceptInvitationComponent } from './features/auth/accept-invitation/accept-invitation.component';
import { LivraisonsPageComponent } from './features/livraisons/livraisons-page/livraisons-page.component';
import { PaymentsPageComponent } from './features/paiements/payments-page/payments-page.component';
import { InvoiceListComponent } from './features/factures/invoice-list/invoice-list.component';
import { JournalPageComponent } from './features/journal/journal-page/journal-page.component';
import { InvoicePrintComponent } from './features/factures/invoice-print/invoice-print.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { RestaurantsListComponent } from './features/admin/restaurants-list/restaurants-list.component';
import { OffreManagementComponent } from './features/admin/offre-management/offre-management.component';
import { SubscriptionOverviewComponent } from './features/admin/subscription-overview/subscription-overview.component';
import { AdminAccountsComponent } from './features/admin/admin-accounts/admin-accounts.component';
import { AdminLoginComponent } from './features/auth/admin-login/admin-login.component';
import { AdditionPrintComponent } from './features/factures/addition-print/addition-print.component';
import { StatistiquesComponent } from './features/statistics/statistiques/statistiques.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { VerificationEmailComponent } from './features/verification-email/verification-email.component';
import { JournalAdminComponent } from './features/admin/journal-admin/journal-admin.component';
import { LandingPageComponent } from './features/landing-page/landing-page/landing-page.component';

/**
 * Routing V1 - modules Menu/Categories/Produits, Salles/Tables/QRCodes, Auth.
 * Toutes les routes sous le layout SaaS sont desormais protegees par authGuard.
 */
export const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
 { path: 'login', component: LoginComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'restaurants', component: RestaurantsListComponent },
      { path: 'offres', component: OffreManagementComponent },
      { path: 'abonnements', component: SubscriptionOverviewComponent },
      { path: 'administrateurs', component: AdminAccountsComponent },
      {path: 'journal', component: JournalAdminComponent}
    ],
  },
  { path: 'inscription', component: SignupComponent },
  { path: 'mot-de-passe-oublie', component: ForgotPasswordComponent },
  { path: 'reinitialisation', component: ResetPasswordComponent },
  { path: 'invitation/:employeId', component: AcceptInvitationComponent },
  {
    // Zone client publique — sans authGuard, layout mobile dédié.
    // URL testable : /m/rest-001?table=table-12  (ou ?mode=EMPORTER / ?mode=LIVRAISON)
    path: 'm/:restaurantId',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: MenuClientComponent },
      { path: 'panier', component: PanierComponent },
      { path: 'suivi/:commandeId', component: SuiviCommandeComponent },
      { path: 'invalide', component: QrInvalideComponent },
    ],
  },
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
      { path: 'livraisons', component: LivraisonsPageComponent },
      { path: 'paiements', component: PaymentsPageComponent },
      { path: 'factures', component: InvoiceListComponent },
      { path: 'factures/:id/imprimer', component: InvoicePrintComponent },
      { path: 'additions/:id/imprimer', component: AdditionPrintComponent },
      { path: 'journal', component: JournalPageComponent },
      { path: 'employes', component: EmployeeListComponent },
      { path: 'promotions', component: PromotionListComponent },
      { path: 'abonnement', component: AbonnementComponent },
      { path: 'statistiques', component: StatistiquesComponent },
      { path: 'profil', component: MonProfilComponent },
      { path: 'parametres', component: ParametresComponent },
    ],
  },
  { path: 'verification-email', component: VerificationEmailComponent },
  { path: '**', component: NotFoundComponent },
];