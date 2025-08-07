import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimengModule } from '../../../primeng/primeng.module';

@Component({
  selector: 'app-subscription-dialog',
  imports: [ReactiveFormsModule,PrimengModule],
  templateUrl: './subscription-dialog.component.html',
  styleUrl: './subscription-dialog.component.scss'
})
export class SubscriptionDialogComponent implements OnInit {

@Input() visible: boolean = false;
subscriptionForm = new FormGroup({
customerName: new FormControl('', Validators.required),
customerCode: new FormControl('', Validators.required),
subscriptionType: new FormControl('', Validators.required),
featureToggle: new FormControl('', Validators.required),
});


ngOnInit() {
  console.log(this.visible)
}


onSubmit(){

}
}
