import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimengModule } from '../../../primeng/primeng.module';

interface Subscription {
  customerName: string;
  customerCode: string;
  subscriptionType: string;
  onBoardedOn: string;
  onBoardedSource: string;
  updatedOn?: string;
  updatedBy?: string;
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
  styleUrl: './subscription-dialog.component.scss'
})
export class SubscriptionDialogComponent implements OnInit {
  changeDetector=inject(ChangeDetectorRef);
  @Input() visible: boolean = false;
  @Input() features: Feature[] = [];
  @Input() set subscription(value: Subscription | null) {
    if (value) {
      this.subscriptionForm.patchValue({
        customerName: value.customerName,
        customerCode: value.customerCode,
        subscriptionType: value.subscriptionType,
        featureToggle: ''  
      });
    }
  }

  @Output() onClose = new EventEmitter<void>();

  subscriptionForm = new FormGroup({
    customerName: new FormControl('', Validators.required),
    customerCode: new FormControl('', Validators.required),
    subscriptionType: new FormControl('', Validators.required),
    featureToggle: new FormControl('', Validators.required),
  });


  ngOnInit() {
    // this.features.forEach(feature => {
    //   this.subscriptionForm.addControl(
    //     `feature_${feature.id}`, 
    //     new FormControl(false)
    //   );
    // });
    console.log(this.visible)
  }


  onSubmit() {
    if (this.subscriptionForm.valid) {
      console.log('Form submitted:', this.subscriptionForm.value);
      this.visible = false;
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
