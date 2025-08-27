import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubscriptionComponent } from './subscription.component';
import { SubscriptionService } from 'src/app/shared/service/subscription/subscription.service';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('SubscriptionComponent', () => {
  let component: SubscriptionComponent;
  let fixture: ComponentFixture<SubscriptionComponent>;
  let subscriptionService: SubscriptionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubscriptionComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        SubscriptionService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionComponent);
    component = fixture.componentInstance;
    subscriptionService = TestBed.inject(SubscriptionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadSubscriptionList and update signals', () => {
    const mockResponse = {
      data: {
        content: [
          {
            customerName: 'Test',
            customerCode: '123',
            subscriptionTypeName: 'Premium',
            onboardedOn: '2024-01-01',
            onboardedSourceName: 'Web',
            updatedOn: '2024-01-02',
            updatedBy: 'Admin',
            featureIds: [1, 2]
          }
        ],
        totalElements: 1
      }
    };
    spyOn(subscriptionService, 'getCustomerSubscriptionList').and.returnValue(of(mockResponse));
    component.loadSubscriptionList();
    expect(component.subscriptionListSignal().length).toBe(1);
    expect(component.totalRecordsSignal()).toBe(1);
  });

  it('should open and close Subscription Tier dialog', () => {
    component.openSubscriptionTierDialog();
    expect(component.showSubscriptionTierDialog).toBeTrue();
    component.closeSubscriptionTierDialog();
    expect(component.showSubscriptionTierDialog).toBeFalse();
  });

  it('should handle selection change', () => {
    component.onSelectionChange([{ customerCode: '1' }]);
    expect(component.selectedUsers.length).toBe(1);
    expect(component.isSubscriptionTierButtonActive).toBeTrue();
    component.onSelectionChange([]);
    expect(component.isSubscriptionTierButtonActive).toBeFalse();
  });

  it('should reset search and clear filters', () => {
    spyOn(component, 'loadSubscriptionList');
    component.searchTerm = 'something';
    component.columnFilters = [{ columnName: 'customerName', filter: 'cnt:Test', sort: '' }];
    component.resetSearch();
    expect(component.loadSubscriptionList).toHaveBeenCalledWith(0, 10, '', []);
    expect(component.searchTerm).toBe('');
    expect(component.columnFilters).toEqual([]);
  });

  it('should refresh and reset pagination, filters, and search, and clear table filters', () => {
    spyOn(component, 'loadSubscriptionList');
    component.paginationState.rows = 50;
    component.searchTerm = 'abc';
    component.columnFilters = [{ columnName: 'customerName', filter: 'cnt:Test', sort: '' }];
    // Mock the table clear method
    component.existingSubscriptionTable = { clear: jasmine.createSpy('clear') } as any;
    component.refresh();
    expect(component.paginationState.rows).toBe(10);
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
    expect(component.searchTerm).toBe('');
    expect(component.columnFilters).toEqual([]);
    expect(component.loadSubscriptionList).toHaveBeenCalledWith(0, 10, '', []);
    // Wait for setTimeout to execute
    setTimeout(() => {
      expect(component.existingSubscriptionTable?.clear).toHaveBeenCalled();
    }, 0);
  });

  // ...add more tests as needed for other methods...
});
