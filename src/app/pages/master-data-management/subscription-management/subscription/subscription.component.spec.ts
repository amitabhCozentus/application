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
    expect(component.selectedSubscriptions.length).toBe(1);
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
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
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

  it('should handle copy click and open copy dialog', () => {
    const mockSubscription = {
      customerName: 'Test Customer',
      customerCode: '123',
      subscriptionType: 'Premium',
      onBoardedOn: '2024-01-01',
      onBoardedSource: 'Web',
      featureIds: [1, 2]
    };
    
    component.onCopyClick(mockSubscription);
    expect(component.selectedCopySubscription).toEqual(mockSubscription);
    expect(component.showAssignDialog).toBeTrue();
  });

  it('should handle copy dialog close', () => {
    component.selectedCopySubscription = {
      customerName: 'Test',
      customerCode: '123',
      subscriptionType: 'Premium',
      onBoardedOn: '2024-01-01',
      onBoardedSource: 'Web'
    };
    component.showAssignDialog = true;
    
    component.handleCopyDialogClose();
    expect(component.showAssignDialog).toBeFalse();
    expect(component.selectedCopySubscription).toBeNull();
  });

  it('should handle copy update success', () => {
    spyOn(component, 'loadSubscriptionList');
    spyOn(component, 'handleCopyDialogClose');
    
    component.handleCopyUpdateSuccess();
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
    expect(component.loadSubscriptionList).toHaveBeenCalledWith(0, component.paginationState.rows, component.searchTerm, component.columnFilters);
    expect(component.handleCopyDialogClose).toHaveBeenCalled();
  });

  it('should navigate to edit subscription', () => {
    const mockSubscription = {
      customerName: 'Test Customer',
      customerCode: '123',
      subscriptionType: 'Premium',
      onBoardedOn: '2024-01-01',
      onBoardedSource: 'Web',
      featureIds: [1, 2]
    };
    
    component.navigateToEditSubscription(mockSubscription);
    expect(component.selectedSubscription).toEqual(mockSubscription);
    expect(component.isDialogOpen).toBeFalse();
    
    // Check if dialog opens after timeout
    setTimeout(() => {
      expect(component.isDialogOpen).toBeTrue();
    }, 0);
  });

  it('should handle page change', () => {
    spyOn(component, 'loadSubscriptionList');
    component.totalRecords = 100;
    
    const pageEvent = {
      first: 20,
      rows: 10,
      page: 2
    };
    
    component.onPageChange(pageEvent);
    expect(component.paginationState.first).toBe(20);
    expect(component.paginationState.rows).toBe(10);
    expect(component.paginationState.pageIndex).toBe(2);
    expect(component.loadSubscriptionList).toHaveBeenCalled();
  });

  it('should handle table filter with sorting and filtering', () => {
    spyOn(component, 'onColumnFilterChange');
    
    const mockEvent = {
      sortField: 'customerName',
      sortOrder: 1,
      filters: {
        customerName: {
          value: 'test',
          matchMode: 'contains'
        }
      }
    };
    
    component.onTableFilter(mockEvent);
    expect(component.onColumnFilterChange).toHaveBeenCalled();
  });

  it('should handle search with minimum 3 characters', () => {
    spyOn(component, 'loadSubscriptionList');
    
    // Test with less than 3 characters
    component.searchTerm = 'ab';
    component.onSearch();
    expect(component.loadSubscriptionList).not.toHaveBeenCalled();
    
    // Test with 3 or more characters
    component.searchTerm = 'abc';
    component.onSearch();
    expect(component.loadSubscriptionList).toHaveBeenCalledWith(0, component.paginationState.rows, 'abc', []);
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
  });

  it('should handle subscription tier save', () => {
    spyOn(component, 'loadSubscriptionList');
    component.selectedSubscriptions = [{
      customerName: 'Test',
      customerCode: '123',
      subscriptionType: 'Premium',
      onBoardedOn: '2024-01-01',
      onBoardedSource: 'Web'
    }];
    component.isSubscriptionTierButtonActive = true;
    
    component.handleSubscriptionTierSave();
    expect(component.paginationState.first).toBe(0);
    expect(component.paginationState.pageIndex).toBe(0);
    expect(component.selectedSubscriptions).toEqual([]);
    expect(component.isSubscriptionTierButtonActive).toBeFalse();
    expect(component.loadSubscriptionList).toHaveBeenCalled();
  });

  it('should handle dialog close', () => {
    component.isDialogOpen = true;
    component.selectedSubscription = {
      customerName: 'Test',
      customerCode: '123',
      subscriptionType: 'Premium',
      onBoardedOn: '2024-01-01',
      onBoardedSource: 'Web'
    };
    
    component.handleDialogClose();
    expect(component.isDialogOpen).toBeFalse();
    expect(component.selectedSubscription).toBeNull();
  });
});
