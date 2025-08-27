import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetaManagementComponent } from './peta-management.component';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('PetaManagementComponent', () => {
  let component: PetaManagementComponent;
  let fixture: ComponentFixture<PetaManagementComponent>;

  const mockTranslateService = {
    instant: (key: string) => key,
    get: () => of('')   // returns observable
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetaManagementComponent],
      providers: [{ provide: TranslateService, useValue: mockTranslateService }]
    }).compileComponents();

    fixture = TestBed.createComponent(PetaManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
