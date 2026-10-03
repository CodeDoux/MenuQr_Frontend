import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;

      } else {
        const code = error.error?.code;

        // Restaurant / compte désactivé ou accès révoqué
        if (
          error.status === 403 &&
          (
            code === 'RESTAURANT_INACTIVE' ||
            code === 'ACCOUNT_DISABLED' ||
            code === 'ACCESS_REVOKED'
          )
        ) {
          authService.forceLogout();

          const restaurantStatus = error.error?.restaurant_status;

          router.navigate(['/login'], {
            queryParams: {
              reason: code,
              status: restaurantStatus
            }
          });

          return throwError(() => error);
        }

        // Erreurs serveur
        if (error.status === 0) {
          errorMessage =
            'Impossible de contacter le serveur. Vérifiez votre connexion.';

        } else if (error.status === 401) {
          errorMessage =
            'Non autorisé. Veuillez vous reconnecter.';

        } else if (error.status === 403) {
          errorMessage =
            error.error?.message ?? 'Accès refusé.';

        } else if (error.status === 404) {
          errorMessage = 'Ressource non trouvée.';

        } else if (error.status === 422) {
          // Erreurs de validation Laravel
          errorMessage =
            'Erreur de validation. Vérifiez les champs.';

          if (error.error?.errors) {
            const validationErrors = error.error.errors;
            const firstErrorKey = Object.keys(validationErrors)[0];

            if (
              firstErrorKey &&
              validationErrors[firstErrorKey][0]
            ) {
              errorMessage =
                validationErrors[firstErrorKey][0];
            }
          }

        } else if (error.status === 429) {
          console.warn(
            'Rate limit atteint, attendez avant de réessayer.'
          );

          return throwError(() => error);

        } else if (error.status === 500) {
          errorMessage =
            'Erreur serveur. Veuillez réessayer plus tard.';

        } else if (error.error?.message) {
          // Autres erreurs Laravel ayant un message
          errorMessage = error.error.message;
        }
      }

      console.error('HTTP Error:', error);

      return throwError(() => ({
        message: errorMessage,
        error
      }));
    })
  );
};