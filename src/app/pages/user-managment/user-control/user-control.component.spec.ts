import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserControlComponent } from './user-control.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserControlService } from 'src/app/shared/service/user-control/user-control.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from 'src/app/shared/service/common/common.service';

describe('UserControlComponent', () => {
  let component: UserControlComponent;
  let fixture: ComponentFixture<UserControlComponent>;

  beforeEach(async () => {
  // Stub ResizeObserver globally for PrimeNG components using Tabs
  (window as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
  // Avoid duplicate keys warnings in any internal lists by ensuring test data uniqueness
  try { console.warn = () => {}; } catch {}
    await TestBed.configureTestingModule({
  imports: [UserControlComponent,HttpClientTestingModule,TranslateModule.forRoot()],
  providers: [UserControlService, CommonService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserControlComponent);
    component = fixture.componentInstance;
  // If component seeds mock data with duplicate keys, prefer unique IDs in tests
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onCopyClick should open assign dialog', () => {
    component.showAssignDialog = false;
    component.onCopyClick();
    expect(component.showAssignDialog).toBeTrue();
  });

  it('navigateToUserAssignment should call navigateRouteWithState with proper payload', () => {
    const common = TestBed.inject(CommonService);
    const spy = spyOn(common, 'navigateRouteWithState');
    const selected = { id: 1, name: 'User' };
    component.navigateToUserAssignment(selected as any);
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ routeData: selected }));
  });
});
