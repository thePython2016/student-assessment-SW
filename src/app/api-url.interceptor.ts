import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const local = 'https://student-assessment-alis.onrender.com';
  if (req.url.startsWith(local)) {
    req = req.clone({ url: environment.apiUrl + req.url.slice(local.length) });
  }
  return next(req);
};