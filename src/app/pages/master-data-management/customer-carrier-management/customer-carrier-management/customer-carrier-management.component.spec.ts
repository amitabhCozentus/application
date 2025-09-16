import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CustomerCarrierManagementComponent } from './customer-carrier-management.component';
import { TranslateService } from '@ngx-translate/core';
import { FilterService } from 'primeng/api';
import { ToastComponent } from '../../../../shared/component/toast-component/toast.component';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from '../../../../shared/primeng/primeng.module';

describe('CustomerCarrierManagementComponent', () => {
  let component: CustomerCarrierManagementComponent;
  let fixture: ComponentFixture<CustomerCarrierManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, PrimengModule],
      declarations: [CustomerCarrierManagementComponent, ToastComponent],
      providers: [
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        FilterService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerCarrierManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter only premium customers', () => {
    const filtered = component.getFilteredCustomers();
    expect(filtered.every(c => c.subscriptionType === 'premium')).toBeTrue();
  });

  it('should return paginated customers', () => {
    component.pageSize = 5;
    component.first = 0;
    const paginated = component.getPaginatedCustomers();
    expect(paginated.length).toBeLessThanOrEqual(5);
  });

  it('should expand and load carrier configuration for a customer', fakeAsync(() => {
    const customer = component.customers[0];
    component.toggleCustomerExpansion(customer);
    tick();
    expect(component.expandedCustomer).toBe(customer);
    expect(customer.carrierConfig).toBeDefined();
    expect(Array.isArray(customer.carrierConfig)).toBeTrue();
  }));

  it('should update selected carriers and save configuration', () => {
    const customer = component.customers[0];
    component.loadCarrierConfiguration(customer);
    customer.selectedCarriers = customer.carrierConfig?.slice(0, 2) || [];
    component.saveCarrierConfiguration(customer);
    expect(customer.prevSelectedCarriers?.length).toBe(customer.selectedCarriers.length);
    expect(customer.carrierConfig?.filter(c => c.isEnabled).length).toBe(customer.selectedCarriers.length);
  });

  it('should disable save if no changes', () => {
    const customer = component.customers[0];
    component.loadCarrierConfiguration(customer);
    customer.selectedCarriers = [...(customer.prevSelectedCarriers || [])];
    expect(component.isSaveDisabled(customer)).toBeTrue();
  });

  it('should enable save if there are changes', () => {
    const customer = component.customers[0];
    component.loadCarrierConfiguration(customer);
    customer.selectedCarriers = [];
    expect(component.isSaveDisabled(customer)).toBeFalse();
  });

  it('should format numbers with commas', () => {
    expect(component.formatNumber(1234567)).toBe('1,234,567');
  });

  it('should return correct enabled status label', () => {
    expect(component.getEnabledStatusLabel(true)).toContain('LBL.ENABLED');
    expect(component.getEnabledStatusLabel(false)).toContain('LBL.DISABLED');
  });

  it('should return correct yes/no label', () => {
    expect(component.getYesNoLabel(true)).toContain('LBL.YES');
    expect(component.getYesNoLabel(false)).toContain('LBL.NO');
  });

  it('should clear search and reload customers', () => {
    spyOn(component, 'loadCustomers');
    component.searchTerm = 'test';
    component.clearSearch();
    expect(component.searchTerm).toBe('');
    expect(component.loadCustomers).toHaveBeenCalled();
  });
});
