import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserConfigurationComponent } from './user-configuration.component';

describe('UserConfigurationComponent', () => {
  let component: UserConfigurationComponent;
  let fixture: ComponentFixture<UserConfigurationComponent>;

  beforeEach(async () => {
    // Stub ResizeObserver to prevent PrimeNG Tabs unobserve errors during teardown
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
    await TestBed.configureTestingModule({
      imports: [UserConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should initialize cols, files, selectionKeys, totalRecords and loading', () => {
    component.ngOnInit();
    expect(component.cols?.length).toBeGreaterThan(0);
    expect(component.files?.length).toBeGreaterThan(0);
    expect(component.selectionKeys).toBeTruthy();
    expect(component.totalRecords).toBeTruthy();
    expect(component.loading).toBeTrue();
  });

  it('tab change handlers should be callable', () => {
    expect(() => component.onCompanyTabChange()).not.toThrow();
    expect(() => component.onTabChange()).not.toThrow();
  });
});
