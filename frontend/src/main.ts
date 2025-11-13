import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { getAppProviders } from './app/app.providers';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    ...getAppProviders()  // モックまたは実際のサービスプロバイダー
  ]
}).catch((err: any) => console.error(err));
