import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PrimengModule } from '../../../primeng/primeng.module';
import { SubscriptionService } from '../../../service/subscription/subscription.service';

interface Subscription {
  customerName: string;
  customerCode: string;
  subscriptionType: string;
  onBoardedOn: string;
  onBoardedSource: string;
  updatedOn?: string;
  updatedBy?: string;
  featureIds?: number[];
}

interface Feature {
  id: number;
  name: string;
  keyCode: string;
}

interface Company {
  companyCode: string;
  companyName: string;
}

@Component({
  selector: 'app-subscription-copy-dialog',
  imports: [ReactiveFormsModule,PrimengModule],
  templateUrl: './subscription-copy-dialog.component.html',
  styleUrl: './subscription-copy-dialog.component.scss',
  providers: [MessageService]
})
export class SubscriptionCopyDialogComponent implements OnInit{
  private subscriptionService = inject(SubscriptionService);
  private messageService = inject(MessageService)
  changeDetector=inject(ChangeDetectorRef);
  @Input() visible: boolean = false;
  @Input() features: Feature[] = [];
  featureStates: { [key: number]: boolean } = {};
  assignedFeatureIds: number[];

  @Input() set subscription(value: Subscription | null) {
    if (value) {
      this.subscriptionForm.patchValue({
        customerName: value.customerName,
        customerCode: value.customerCode,
      });

      // Set feature states and collect all assigned feature ids
      this.assignedFeatureIds = value.featureIds ? [...value.featureIds] : [];
      this.features.forEach(feature => {
        this.featureStates[feature.id] = this.assignedFeatureIds.includes(feature.id);
      });
      this.changeDetector.detectChanges();
    }
  }

  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdateSuccess = new EventEmitter<void>();

  subscriptionForm = new FormGroup({
    customerName: new FormControl('', Validators.required),
    customerCode: new FormControl('', Validators.required),
    selectedCustomer: new FormControl(null, Validators.required)
  });

  copyToTooltip: string = 'Min 1 and max 10 customers can be added.';

  customerNameList: Company[] = [];
  selectedCustomer: Company | null = null;
  companyCount: number = 0;
  companySearchText: string = '';
  loadingCompanies: boolean = false;
  hasMoreCompanies: boolean = true;
  currentFilterValue: string = '';

  ngOnInit() {
    // Initialize feature states if not already set
    this.features.forEach(feature => {
      if (!(feature.id in this.featureStates)) {
        this.featureStates[feature.id] = false;
      }
    });
  }

  isFeatureEnabled(featureId: number): boolean {
    return this.featureStates[featureId] || false;
  }

  toggleFeature(featureId: number) {
    this.featureStates[featureId] = !this.featureStates[featureId];
  }

  // Add selection change handler
  onCustomerSelectionChange(event: { value: Company[] }) {
    const selectedCustomers = event?.value || [];
    
    if (selectedCustomers.length > 10) {
      // Remove the last selected item and show warning
      selectedCustomers.pop();
      this.subscriptionForm.patchValue({
        selectedCustomer: selectedCustomers
      });
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Selection Limit Exceeded',
        detail: 'Maximum 10 customers can be selected at a time'
      });
    }
  }

  onUpdateSubmit() {
    // Use the form control for selectedCustomer
    const selectedCustomers = this.subscriptionForm.get('selectedCustomer')?.value;
    
    // Handle both single selection (existing) and multiple selection (new)
    let targetCompanyIds: string[] = [];
    
    if (Array.isArray(selectedCustomers)) {
      // Multiple selection
      if (selectedCustomers.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Selection',
          detail: 'Please select at least one customer'
        });
        return;
      }
      
      if (selectedCustomers.length > 10) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Selection Limit Exceeded',
          detail: 'Maximum 10 customers can be selected at a time'
        });
        return;
      }
      
      targetCompanyIds = selectedCustomers.map((customer: Company) => customer.companyCode);
    } else if (selectedCustomers && selectedCustomers.companyCode) {
      // Single selection (existing behavior)
      targetCompanyIds = [selectedCustomers.companyCode];
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Selection',
        detail: 'Please select at least one customer'
      });
      return;
    }

    if (this.subscriptionForm.valid && targetCompanyIds.length > 0) {
      const sourceCompanyId = Number(this.subscriptionForm.get('customerCode')?.value); 

      const requestBody = {
        sourceCompanyId: sourceCompanyId,
        targetCompanyIds: targetCompanyIds
      };

      this.subscriptionService.updateCopySubscription(requestBody).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response?.message || `Subscription copied successfully to ${targetCompanyIds.length} customers`
          });
          this.visible = false;
          this.onClose.emit();
          this.onUpdateSuccess.emit();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Unable to copy subscription. Please try again.'
          });
          console.error('Error copying subscription:', error);
        }
      });
    }
  }

  onCancel() {
    this.visible = false;
    this.subscriptionForm.reset();
  }

  hideDialog() {
    this.visible = false;
    this.onClose.emit();
  }

  // Call this when dropdown is opened
  onCompanyDropdownShow() {
    if (this.customerNameList.length === 0) {
      this.companyCount = 0; // Initial fetch with count 0
      this.companySearchText = '';
      this.fetchCompanies();
    }
    
    // Setup search icon click listener after dropdown opens
    setTimeout(() => {
      this.setupSearchIconClick();
    }, 100);
  }

  // Setup click event on search icon
  private setupSearchIconClick() {
    const searchIcon = document.querySelector('.p-multiselect-filter-icon');
    
    if (searchIcon) {
      // Remove existing listener to avoid duplicates
      searchIcon.removeEventListener('click', this.handleSearchIconClick);
      
      // Add click listener
      searchIcon.addEventListener('click', this.handleSearchIconClick);
    }
  }

  // Handle search icon click
  private handleSearchIconClick = () => {
    const searchText = this.currentFilterValue.trim();
    
    if (searchText.length >= 3) {
      this.companySearchText = searchText;
      this.companyCount = 0;
      this.customerNameList = [];
      this.fetchCompanies();
    } else if (searchText.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Search Text Too Short',
        detail: 'Please enter at least 3 characters to search'
      });
    }
  }

  // Call this when user types in search
  onCompanySearch(event: any) {
    this.companySearchText = event?.query || '' ;
    this.companyCount = 0; // Reset count for new search
    this.customerNameList = [];
    this.fetchCompanies();
  }

  // Call this when user clicks "Load More"
  onCompanyLoadMore() {
    this.companyCount += 1; // Increase count by 3 on each load more
    this.fetchCompanies(true);
  }

  // Call this when user types in search (for (onFilter) event)
  onCompanySearchFilter(event: any) {
    // Trim spaces from search text and check for minimum 3 characters
    const searchText = (event?.filter || event?.query || '').trim();
    this.currentFilterValue = searchText;
    
    // If search is empty, call API immediately
    if (searchText.length === 0) {
      this.companySearchText = searchText;
      this.companyCount = 0;
      this.customerNameList = [];
      this.fetchCompanies();
    }
  }

  fetchCompanies(append: boolean = false) {
    this.loadingCompanies = true;
    const payload = {
      count: this.companyCount,
      searchText: this.companySearchText
    };
    this.subscriptionService.getCustomerSubscriptionCompanies(payload).subscribe({
      next: (response: { data: Company[] }) => {
        const companies = response?.data || [];
        if (append) {
          // Only append new companies that are not already in the list
          const existingCodes = new Set(this.customerNameList.map(c => c.companyCode));
          const newCompanies = companies.filter((c: Company) => !existingCodes.has(c.companyCode));
          this.customerNameList = [...this.customerNameList, ...newCompanies];
        } else {
          this.customerNameList = companies;
        }
        // Show Load More if we got any companies back (API should handle paging)
        this.hasMoreCompanies = companies.length > 0;
        this.loadingCompanies = false;
      },
      error: () => {
        this.loadingCompanies = false;
      }
    });
  }
}
