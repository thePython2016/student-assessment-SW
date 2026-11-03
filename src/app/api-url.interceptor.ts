import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const local = 'http://127.0.0.1:8000';
  if (req.url.startsWith(local)) {
    req = req.clone({ url: environment.apiUrl + req.url.slice(local.length) });
  }
  return next(req);
};