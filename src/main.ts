import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import {appConfig} from '../src/app/app.config'
import{AppComponent} from '../src/app/app.component'
import { provideHttpClient } from '@angular/common/http';
if (environment.production) {
    enableProdMode();
}
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(),  // <-- Add this to enable HttpClient support
  ],
})
.catch((err) => console.error(err));

// platformBrowserDynamic().bootstrapModule(AppModule)
//     .catch(err => console.error(err));
