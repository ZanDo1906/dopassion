import { ApplicationConfig, Injectable, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { routes } from './app.routes';

@Injectable({ providedIn: 'root' })
class DopassionTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(): void {
    this.title.setTitle('DoPassion');
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: TitleStrategy, useClass: DopassionTitleStrategy }
  ]
};
