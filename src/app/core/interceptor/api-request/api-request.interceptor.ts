import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export const apiRequestInterceptor: HttpInterceptorFn = (req, next) => {
    if (!/^(http|https):/i.test(req.url)) {
      const url = environment.baseurl + req.url;

      if(url.includes('assets/i18n/')){
        return next(req);
      }

      const headers: any = {
      };

      if (!(req.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      req = req.clone({ url, headers: new HttpHeaders(headers) });
    }


    req = req.clone({
      headers: req.headers.delete('x-force-refresh')
    });

    return next(req);
};
