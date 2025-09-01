// Global test setup: common mocks used by pages/**/*.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) { return of({}); }
}

beforeAll(() => {
  // No-op: placeholder for any global initialization
});

beforeEach(() => {
  // Provide HttpClientTestingModule by default to avoid live HTTP calls
  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } })
    ]
  });
});
