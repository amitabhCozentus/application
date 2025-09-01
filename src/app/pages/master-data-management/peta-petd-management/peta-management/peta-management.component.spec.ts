import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { PetaManagementComponent } from './peta-management.component';

describe('PetaManagementComponent', () => {
  let component: PetaManagementComponent;
  let fixture: ComponentFixture<PetaManagementComponent>;

  beforeEach(async () => {
    class FakeLoader implements TranslateLoader { getTranslation(lang: string) { return of({}); } }
    await TestBed.configureTestingModule({
      imports: [PetaManagementComponent, TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } })]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetaManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set totalRecords on loadCompanies', () => {
    component.companies = [
      { companyName: 'A', companyCode: 'A', petaEnabled: true },
      { companyName: 'B', companyCode: 'B', petaEnabled: false }
    ] as any;
    component.loadCompanies();
    expect(component.totalRecords).toBe(2);
  });

  it('onSearch should gate by min length and trim input', () => {
    const logSpy = spyOn(console, 'log');
    component.currentPage = 2;
    component.searchTerm = ' ab ';
    component.onSearch();
    expect(logSpy).not.toHaveBeenCalled();
    expect(component.currentPage).toBe(2);

    component.searchTerm = '  abc  ';
    component.currentPage = 2;
    component.onSearch();
    expect(component.currentPage).toBe(0);
    expect(logSpy).toHaveBeenCalledWith('abc');
  });

  it('resetSearch should clear term and reset page', () => {
    component.searchTerm = 'hello';
    component.currentPage = 3;
    component.resetSearch();
    expect(component.searchTerm).toBe('');
    expect(component.currentPage).toBe(0);
  });

  it('onLazyLoad should update page and page size and log', () => {
    const logSpy = spyOn(console, 'log');
    component.onLazyLoad({ first: 20, rows: 10 });
    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(10);
    expect(logSpy).toHaveBeenCalledWith(2, 10);
  });

  it('applyDefaultsIfMissing should set defaults when enabled', () => {
    const company: any = { petaEnabled: true };
    component.applyDefaultsIfMissing(company);
    expect(company.oceanFrequency).toBeDefined();
    expect(company.airFrequency).toBeDefined();
    expect(company.railRoadFrequency).toBeDefined();

    const disabled: any = { petaEnabled: false };
    component.applyDefaultsIfMissing(disabled);
    expect(disabled.oceanFrequency).toBeUndefined();
    expect(disabled.airFrequency).toBeUndefined();
    expect(disabled.railRoadFrequency).toBeUndefined();
  });

  it('saveGlobal should apply defaults and update selected companies only when selection present', () => {
    const c1: any = { petaEnabled: true, isEditing: true };
    const c2: any = { petaEnabled: true, isEditing: true };
    component.companies = [c1, c2];

    // With selection -> only selected updated
    component.selectedCompanies = [c1];
    component.saveGlobal();
    expect(c1.updatedBy).toBe('You');
    expect(c1.isEditing).toBeFalse();
    expect(c1.updatedOn instanceof Date).toBeTrue();
    expect(c1.oceanFrequency).toBeDefined();
    // c2 remains untouched
    expect(c2.updatedBy).toBeUndefined();

    // Without selection -> all updated
    component.selectedCompanies = [];
    component.saveGlobal();
    expect(c2.updatedBy).toBe('You');
    expect(c2.isEditing).toBeFalse();
    expect(c2.updatedOn instanceof Date).toBeTrue();
  });

  it('saveRow should apply defaults and update metadata', () => {
    const row: any = { petaEnabled: true, isEditing: true };
    component.saveRow(row);
    expect(row.oceanFrequency).toBeDefined();
    expect(row.isEditing).toBeFalse();
    expect(row.updatedBy).toBe('You');
    expect(row.updatedOn instanceof Date).toBeTrue();
  });

  it('copyRow should write to clipboard when available and not throw when unavailable', async () => {
    const row = { a: 1 };
    const mockClipboard = { writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve()) } as any;
    const getterSpy = spyOnProperty(navigator as any, 'clipboard', 'get').and.returnValue(mockClipboard);
    await component.copyRow(row);
    expect(mockClipboard.writeText).toHaveBeenCalled();

    // Simulate unavailable API
    getterSpy.and.returnValue(undefined as any);
    await component.copyRow(row); // should not throw
  });
});
