import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimengModule } from '../../../primeng/primeng.module';
import { SubscriptionService } from '../../../service/subscription/subscription.service';
import { MessageService } from 'primeng/api';

interface Subscription {
  customerName: string;
  customerCode: string;
  subscriptionTypeName: string;
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
  selector: 'app-subscription-dialog',
  imports: [ReactiveFormsModule,PrimengModule],
  templateUrl: './subscription-dialog.component.html',
  styleUrl: './subscription-dialog.component.scss',
  providers: [MessageService]
})
export class SubscriptionDialogComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private messageService = inject(MessageService)
  changeDetector=inject(ChangeDetectorRef);
  @Input() visible: boolean = false;
  @Input() features: Feature[] = [];
  @Input() subscriptionTier: { id: number, name: string, configType: string }[] = [];
  featureStates: { [key: number]: boolean } = {};

  @Input() set subscription(value: Subscription | null) {
    if (value) {
      this.subscriptionForm.patchValue({
        customerName: value.customerName,
        customerCode: value.customerCode,
        subscriptionTypeName: value.subscriptionTypeName
      });

      // Initialize feature states from featureIds
      this.features.forEach(feature => {
        this.featureStates[feature.id] = value.featureIds?.includes(feature.id) || false;
      });
      this.changeDetector.detectChanges();
    }
  }

  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdateSuccess = new EventEmitter<void>();

  subscriptionForm = new FormGroup({
    customerName: new FormControl('', Validators.required),
    customerCode: new FormControl('', Validators.required),
    subscriptionTypeName: new FormControl('', Validators.required),
    
  });

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
    if (this.subscriptionForm.valid) {
      // Get selected feature IDs
      const selectedFeatureIds = Object.entries(this.featureStates)
        .filter(([_, isEnabled]) => isEnabled)
        .map(([id]) => Number(id));

      const customerCode = this.subscriptionForm.get('customerCode')?.value;
      const subscriptionTypeName = this.subscriptionForm.get('subscriptionTypeName')?.value;
      // Use config id from subscriptionTier array
      const selectedConfig = this.subscriptionTier.find(cfg => cfg.name === subscriptionTypeName);
      const subscriptionTierTypeNumber = selectedConfig ? selectedConfig.id : null;

      const customerName = this.subscriptionForm.get('customerName')?.value;
      
      const requestBody = {
        companyCode: Number(customerCode), 
        subscriptionTierType: subscriptionTierTypeNumber,
        featureIds: selectedFeatureIds
      };
      
      this.subscriptionService.updateCustomerSubscriptionList(requestBody).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail:  `Subscription for ${customerName} updated successfully`
          });
          this.visible = false;
          this.onClose.emit();
          this.onUpdateSuccess.emit();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to update subscription. Please try again.'
          });
          console.error('Error updating subscription:', error);
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
}

