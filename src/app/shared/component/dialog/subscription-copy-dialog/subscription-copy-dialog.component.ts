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

  customerNameList: any[] = [];
  selectedCustomer: any = null;
  companyCount: number = 0;
  companySearchText: string = '';
  loadingCompanies: boolean = false;
  hasMoreCompanies: boolean = true;

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

  onUpdateSubmit() {
    // Use the form control for selectedCustomer
    const selectedCustomer = this.subscriptionForm.get('selectedCustomer')?.value || this.selectedCustomer;
    if (this.subscriptionForm.valid && selectedCustomer && selectedCustomer.companyCode) {
      const sourceCompanyId = Number(this.subscriptionForm.get('customerCode')?.value); 
      const targetCompanyIds = [selectedCustomer.companyCode];

      const requestBody = {
        sourceCompanyId: sourceCompanyId,
        targetCompanyIds: targetCompanyIds
      };

      this.subscriptionService.updateCopySubscription(requestBody).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Subscription copied successfully'
          });
          this.visible = false;
          this.onClose.emit();
          this.onUpdateSuccess.emit();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to copy subscription. Please try again.'
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
  }

  // Call this when user types in search
  onCompanySearch(event: any) {
    this.companySearchText = event?.query || '';
    this.companyCount = 0; // Reset count for new search
    this.customerNameList = [];
    this.fetchCompanies();
  }

  // Call this when user clicks "Load More"
  onCompanyLoadMore() {
    this.companyCount += 1; // Increase count by 3 on each load more
    this.fetchCompanies(true);
  }

  fetchCompanies(append: boolean = false) {
    this.loadingCompanies = true;
    const payload = {
      count: this.companyCount,
      searchText: this.companySearchText
    };
    this.subscriptionService.getCustomerSubscriptionCompanies(payload).subscribe({
      next: (response: any) => {
        const companies = response?.data || [];
        if (append) {
          // Only append new companies that are not already in the list
          const existingCodes = new Set(this.customerNameList.map(c => c.companyCode));
          const newCompanies = companies.filter((c: any) => !existingCodes.has(c.companyCode));
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
