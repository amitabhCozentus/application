import { Component, Output, output } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { CommonService } from '../../../shared/service/common/common.service';
import { AppRoutes } from '../../../shared/lib/api-constant';
import { SubscriptionDialogComponent } from 'src/app/shared/component/dialog/subscription-dialog/subscription-dialog.component';
interface Header{
field:string,
header:string
}

interface Subscription {
  customerName: string;
  customerCode: string;
  subscriptionType: string;
  onBoardedOn: string;
  onBoardedSource: string;
  updatedOn?: string;
  updatedBy?: string;
}
@Component({
  selector: 'app-subscription',
  imports: [PrimengModule,CommonTableSearchComponent,SubscriptionDialogComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})


export class SubscriptionComponent {
  showAssignDialog:boolean = false;
  subscription:any[];
  subscriptionTableHeader:Header[];
  subscriptionList:Subscription[];
  constructor(private commonService:CommonService){
  this.subscriptionTableHeader =  [
        { field: 'customerName', header: 'Customer Name' },  
        { field: 'customerCode', header: 'Customer Code' },
        { field: 'subscriptionType', header: 'subscriptionType' },
        { field: 'onBoardedOn', header: 'Onboarded On' },
        { field: 'onBoardedSource', header: 'Onboarded Source' },
        { field: 'updatedOn', header: 'Updated On' },
        { field: 'updatedBy', header: 'Updated By' },
      ];
      this.subscriptionList = [
        {
          "customerName": 'John Doe',
          "customerCode": 'CUST123',
          "subscriptionType": 'Premium',
          "onBoardedOn": '2023-01-01',
          "onBoardedSource": 'Website', 
        },
         {
          "customerName": 'John lee',
          "customerCode": 'CUST123',
          "subscriptionType": 'Premium',
          "onBoardedOn": '2023-01-01',
          "onBoardedSource": 'Website', 
        },
         {
          "customerName": 'Don Doe',
          "customerCode": 'CUST123',
          "subscriptionType": 'Premium',
          "onBoardedOn": '2023-01-01',
          "onBoardedSource": 'Website', 
        },
         {
          "customerName": 'acryle Doe',
          "customerCode": 'CUST123',
          "subscriptionType": 'Premium',
          "onBoardedOn": '2023-01-01',
          "onBoardedSource": 'Website', 
        }
      ];

  }

   onCopyClick(){
      this.showAssignDialog=true;
       // this.enableSubscriptionDialog.next(this.showAssignDialog);
    }

    navigateToUserAssignment(selectedUser: any) {
      this.commonService.navigateRouteWithState({
         route: AppRoutes.User.USER_MANAGEMENT_CONFIG,
        type: 'Manager',
        routeData: selectedUser
      });
    }
 

}
