// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.
import { AuthConfig } from '@auth0/auth0-angular';
const authConfig: AuthConfig = {
  domain: 'devlogin.bdpsmart.com',
  clientId: 'UrdJyZAIIjP15ahBa358JwJWSLIwMqk0',
  authorizationParams: {
      redirect_uri: window.location.origin,
  },
  httpInterceptor: {
      allowedList: [
          {
              uri: 'http://localhost:3000/*',
          },
      ],
  },
};


  export const environment = {
    production: false,
    sessionDialogInterval: 1 * 60 * 1000,
    sessionInfoInterval: 25 * 60 * 1000,
  sessionTimeoutInterval: 5 * 60 * 1000,
    appIconBaseUrl:'',
    ump_url:'',
    ump_endpoint_url: '',
    baseurl: 'http://localhost:8080',
    authConfig:authConfig,
    auth: authConfig,
    mapbox: {
        accessToken: '',
    },
    
};

