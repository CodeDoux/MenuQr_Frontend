import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_STORAGE_KEY = 'menuqr_api_token';
const ADMIN_TOKEN_STORAGE_KEY = 'menuqr_admin_api_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const estRouteAdmin = req.url.includes('/admin/') && !req.url.includes('/admin/login');
  const token = estRouteAdmin
    ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
    : localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned);
};