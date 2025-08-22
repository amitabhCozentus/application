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
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{ companyCodes: number[], subscriptionTierType: number }>();

  selectedTier: string | null = null;

  private subscriptionService = inject(SubscriptionService);
  private messageService = inject(MessageService);

  onCloseDialog() {
    this.onClose.emit();
  }

  onSaveDialog() {
    const companyCodes = (this.selectedRows || [])
      .map(row => Number(row.customerCode))
      .filter(code => !isNaN(code));
    let subscriptionTierType = 0;
    if (this.selectedTier === 'Standard') {
      subscriptionTierType = 48;
    } else if (this.selectedTier === 'Premium') {
      subscriptionTierType = 49;
    }
    const requestBody = {
      companyCodes,
      subscriptionTierType
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
