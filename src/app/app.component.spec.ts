import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

class FakeLoader implements TranslateLoader {
  getTranslation() { return of({}); }
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule,
  HttpClientTestingModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app root', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize default layout properties', () => {
    expect(component.topbarTheme).toBe('dark');
    expect(component.menuTheme).toBe('dark');
    expect(component.layoutMode).toBe('light');
    expect(component.menuMode).toBe('horizontal');
    expect(component.isRTL).toBeFalse();
    expect(component.inputStyle).toBe('outlined');
    expect(component.ripple).toBeTrue();
  });
});
