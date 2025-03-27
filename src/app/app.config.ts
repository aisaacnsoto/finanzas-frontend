import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Chart, registerables } from 'chart.js';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ]
};
