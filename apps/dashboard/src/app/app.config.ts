import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { monacoConfig } from '@libs-editor';
import {
  WebSerialEffects,
  webSerialFeatureKey,
  webSerialReducer,
} from '@libs-web-serial';
import { xtermFeatureKey, xtermReducer } from '@libs-xterm';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideToastr({
      timeOut: 2000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),
    provideHttpClient(),
    provideMonacoEditor(monacoConfig),
    provideStore({
      [webSerialFeatureKey]: webSerialReducer,
      [xtermFeatureKey]: xtermReducer,
    }),
    provideEffects([WebSerialEffects]),
    provideStoreDevtools({
      maxAge: 25,
      connectInZone: true,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideRouterStore(),
  ],
};
