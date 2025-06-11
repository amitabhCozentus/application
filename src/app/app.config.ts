import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ApiRouteDefinition, AuthClientConfig } from '@auth0/auth0-angular';
import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from '../app/app.routes'
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

export interface AppConfig {
    profiles: { [key: string]: { [key: string]: unknown } };
    activeProfile: string;
}
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
      , ErrorHandler, {
      provide: APP_INITIALIZER,
     useFactory: initializeAppFactory,
      deps: [HttpBackend],
      multi: true,
     } ,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};

export function initializeAppFactory(
    httpBackend: HttpBackend,
    authClientConfig: AuthClientConfig
): () => Observable<AppConfig> {
    const uriMatcherFunc = (
        uri: string,
        allowedList: string[],
        basePath: string
    ) => {
        if (uri.startsWith(basePath)) {
            const path = uri.replace(basePath, '');
            const isAllowed = allowedList.some((allowedUri) => {
                if (allowedUri.endsWith('*')) {
                    return path.startsWith(allowedUri.slice(0, -1));
                }
                return path === allowedUri;
            });
            return isAllowed;
        }
        return false;
    };
    return () =>
        new HttpClient(httpBackend).get<AppConfig>('/assets/config.json').pipe(
            tap((config) => {
                const configObj = config.profiles[config.activeProfile];
                let apiBasePath = configObj['apiUrl'] as string;
                if (!apiBasePath.startsWith('http')) {
                    apiBasePath = `${window.location.origin}${apiBasePath}`;
                    if (apiBasePath.endsWith('/')) {
                        apiBasePath = apiBasePath.slice(0, -1);
                    }
                }
                
                Object.assign(environment, {
                    ...configObj,
                    baseurl: apiBasePath,
                    ump_endpoint_url:configObj['ump_endpoint_url'],
                    mapbox: {
                        accessToken: configObj['mapBoxAccessToken']
                    }
                });
            })
        );
}