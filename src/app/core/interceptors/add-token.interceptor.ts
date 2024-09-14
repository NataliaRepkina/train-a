import { HttpInterceptorFn } from '@angular/common/http';

export const addTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token: string | null = localStorage.getItem('token');
  if (token) {
    const newReq = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${token || ''}`),
    });
    return next(newReq);
  }
  return next(req);
};
