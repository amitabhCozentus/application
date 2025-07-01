import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimengModule } from 'src/app/shared/primeng/primeng.module';

@Component({
  selector: 'app-subscription-dialog',
  imports: [ReactiveFormsModule,PrimengModule],
  templateUrl: './subscription-dialog.component.html',
  styleUrl: './subscription-dialog.component.scss'
})
export class SubscriptionDialogComponent {

visible: boolean = true;
subscriptionForm = new FormGroup({
customerName: new FormControl('', Validators.required),
customerCode: new FormControl('', Validators.required),
subscriptionType: new FormControl('', Validators.required),
featureToggle: new FormControl('', Validators.required),
});

onSubmit(){

}
}
