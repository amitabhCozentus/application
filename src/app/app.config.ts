import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ApiRouteDefinition, AuthClientConfig } from '@auth0/auth0-angular';
import {  ApplicationConfig, ErrorHandler, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import {providePrimeNG} from 'primeng/config';
import {definePreset} from '@primeng/themes';
import { routes } from '../app/app.routes'
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

export interface AppConfig {
    profiles: { [key: string]: { [key: string]: unknown } };
    activeProfile: string;
}
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


const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        },
        overlay: {
            modal: {
                borderRadius: '1.5rem'
            },
            popover: {
                borderRadius: '10px'
            }
        },
        colorScheme: {
            light: {
                surface: {
                    0: 'color-mix(in srgb, {primary.950}, white 100%)',
                    50: 'color-mix(in srgb, {primary.950}, white 95%)',
                    100: 'color-mix(in srgb, {primary.950}, white 90%)',
                    200: 'color-mix(in srgb, {primary.950}, white 80%)',
                    300: 'color-mix(in srgb, {primary.950}, white 70%)',
                    400: 'color-mix(in srgb, {primary.950}, white 60%)',
                    500: 'color-mix(in srgb, {primary.950}, white 50%)',
                    600: 'color-mix(in srgb, {primary.950}, white 40%)',
                    700: 'color-mix(in srgb, {primary.950}, white 30%)',
                    800: 'color-mix(in srgb, {primary.950}, white 20%)',
                    900: 'color-mix(in srgb, {primary.950}, white 10%)',
                    950: 'color-mix(in srgb, {primary.950}, white 5%)'
                }
            },
            dark: {
                surface: {
                    0: 'color-mix(in srgb, var(--surface-ground), white 100%)',
                    50: 'color-mix(in srgb, var(--surface-ground), white 95%)',
                    100: 'color-mix(in srgb, var(--surface-ground), white 90%)',
                    200: 'color-mix(in srgb, var(--surface-ground), white 80%)',
                    300: 'color-mix(in srgb, var(--surface-ground), white 70%)',
                    400: 'color-mix(in srgb, var(--surface-ground), white 60%)',
                    500: 'color-mix(in srgb, var(--surface-ground), white 50%)',
                    600: 'color-mix(in srgb, var(--surface-ground), white 40%)',
                    700: 'color-mix(in srgb, var(--surface-ground), white 30%)',
                    800: 'color-mix(in srgb, var(--surface-ground), white 20%)',
                    900: 'color-mix(in srgb, var(--surface-ground), white 10%)',
                    950: 'color-mix(in srgb, var(--surface-ground), white 5%)'
                }
            }
        }
    }
});


export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
      , ErrorHandler, {
      provide: provideAppInitializer,
     useFactory: initializeAppFactory,
      deps: [HttpBackend],
      multi: true,
     } ,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({theme: {preset: MyPreset, options: {darkModeSelector: '.app-dark'}}})
  ]
};
