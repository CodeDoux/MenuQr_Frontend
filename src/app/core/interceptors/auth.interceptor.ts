import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_STORAGE_KEY = 'menuqr_api_token';
const ADMIN_TOKEN_STORAGE_KEY = 'menuqr_admin_api_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const estRouteAdmin = req.url.includes('/admin/') && !req.url.includes('/admin/login');
  const token = estRouteAdmin
    ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
    : localStorage.getItem(TOKEN_STORAGE_KEY);

  const requete = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requete).pipe(
    catchError((erreur) => {
      // ⚠️ Un 401 sur une requête AUTHENTIFIÉE (token présent) signifie que
      // ce token est expiré/invalide — on nettoie et on redirige avec un
      // message clair, plutôt que de laisser l'utilisateur face à des
      // erreurs silencieuses partout dans l'app.
      if (erreur.status === 401 && token) {
        if (estRouteAdmin) {
          localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
          router.navigate(['/admin/login'], { queryParams: { raison: 'session_expiree' } });
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          router.navigate(['/login'], { queryParams: { raison: 'session_expiree' } });
        }
      }
      return throwError(() => erreur);
    })
  );
};