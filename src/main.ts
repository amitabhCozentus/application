import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import {appConfig} from '../src/app/app.config'
import{AppComponent} from '../src/app/app.component'
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthModule } from '@auth0/auth0-angular';
import { apiRequestInterceptor } from './app/core/interceptor/api-request/api-request.interceptor';
if (environment.production) {
    enableProdMode();
}
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptors([apiRequestInterceptor])),
    ...AuthModule.forRoot({
      domain: environment.auth.domain,
      clientId: environment.auth.clientId,
    }).providers,
  ],
})
.catch((err) => console.error(err));

// platformBrowserDynamic().bootstrapModule(AppModule)
//     .catch(err => console.error(err));
