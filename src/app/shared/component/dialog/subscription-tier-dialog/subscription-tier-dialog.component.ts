import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from '../../../primeng/primeng.module';
import { SubscriptionService } from '../../../service/subscription/subscription.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-subscription-tier-dialog',
  imports: [ReactiveFormsModule, PrimengModule],
  templateUrl: './subscription-tier-dialog.component.html',
  styleUrl: './subscription-tier-dialog.component.scss',
  providers: [MessageService]
})
export class SubscriptionTierDialogComponent {
  @Input() visible: boolean = false;
  @Input() selectedRows: any[] = [];
  @Input() isAllSelected: boolean = false;
  @Input() subscriptionTier: { id: number, name: string, configType: string }[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{ companyCodes: number[], subscriptionTierType: number, isAllSelected: boolean }>();

  selectedTier: string | null = null;

  private subscriptionService = inject(SubscriptionService);
  private messageService = inject(MessageService);

  onCloseDialog() {
    this.onClose.emit();
  }

  onSaveDialog() {
    let companyCodes: number[];
    if (this.isAllSelected) {
      companyCodes = [0];
    } else {
      companyCodes = (this.selectedRows || [])
        .map(row => Number(row.customerCode))
        .filter(code => !isNaN(code));
    }
    // Find config id for selected tier
    const selectedConfig = this.subscriptionTier.find(cfg => cfg.name === this.selectedTier);
    const subscriptionTierType = selectedConfig ? selectedConfig.id : undefined;

    if (typeof subscriptionTierType !== 'number') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a valid subscription tier.'
      });
      return;
    }

    const requestBody = {
      companyCodes,
      subscriptionTierType,
      isAllSelected: this.isAllSelected
    };
    this.subscriptionService.bulkUpdateSubscriptionTier(requestBody).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Subscription tier updated successfully'
        });
        this.onSave.emit(requestBody);
        this.onClose.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Unable to update subscription tier. Please try again.'
        });
        console.error('Error updating subscription tier:', error);
      }
    });
  }
}

