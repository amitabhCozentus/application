import { Component, EventEmitter, Output, output } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { CommonService } from '../../../shared/service/common/common.service';
import { AppRoutes } from '../../../shared/lib/api-constant';
import { SubscriptionService } from '../../../shared/service/subscription/subscription.service';
// import { SubscriptionDialogComponent } from 'src/app/shared/component/dialog/subscription-dialog/subscription-dialog.component';
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
  imports: [PrimengModule,CommonTableSearchComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})


export class SubscriptionComponent {
  @Output() enableSubscriptionDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  showAssignDialog:boolean = false;
  subscription:any[];
  subscriptionTableHeader:Header[];
  subscriptionList:Subscription[];
  constructor(private commonService:CommonService,private subscriptionService: SubscriptionService){
  this.subscriptionTableHeader =  [
        { field: 'customerName', header: 'Customer Name' },
        { field: 'customerCode', header: 'Customer Code' },
        { field: 'subscriptionType', header: 'subscriptionType' },
        { field: 'onBoardedOn', header: 'Onboarded On' },
        { field: 'onBoardedSource', header: 'Onboarded Source' },
        { field: 'updatedOn', header: 'Updated On' },
        { field: 'updatedBy', header: 'Updated By' },
      ];
      // this.subscriptionList = [
      //   {
      //     "customerName": 'John Doe',
      //     "customerCode": 'CUST123',
      //     "subscriptionType": 'Premium',
      //     "onBoardedOn": '2023-01-01',
      //     "onBoardedSource": 'Website',
      //   },
      //    {
      //     "customerName": 'John lee',
      //     "customerCode": 'CUST123',
      //     "subscriptionType": 'Premium',
      //     "onBoardedOn": '2023-01-01',
      //     "onBoardedSource": 'Website',
      //   },
      //    {
      //     "customerName": 'Don Doe',
      //     "customerCode": 'CUST123',
      //     "subscriptionType": 'Premium',
      //     "onBoardedOn": '2023-01-01',
      //     "onBoardedSource": 'Website',
      //   },
      //    {
      //     "customerName": 'acryle Doe',
      //     "customerCode": 'CUST123',
      //     "subscriptionType": 'Premium',
      //     "onBoardedOn": '2023-01-01',
      //     "onBoardedSource": 'Website',
      //   }
      // ];

      }

  ngOnInit() {
    const requestBody = {
      pagination: { page: 0, size: 10 }
      // searchFilter: { searchText: '', columns: [] as String[] },
      // columns: [] as any[],
      // sortFieldValidator: { validSortFields: [] as String[] }
    };
    try {
      this.subscriptionService.getCustomerSubscriptionList(requestBody).subscribe({
        next: (response: { data: { content: Array<any> } }) => {
          const content = response?.data?.content || [];
          this.subscriptionList = content.map((item): Subscription => ({
            customerName: item.customerName,
            customerCode: item.customerCode,
            subscriptionType: item.subscriptionTypeName,
            onBoardedOn: item.onboardedOn,
            onBoardedSource: item.onboardedSourceName,
            updatedOn: item.updatedOn,
            updatedBy: item.updatedBy
          }));
        },
        error: (error) => {
          console.error('Error fetching subscription list', error);
        }
      });
    } catch (err) {
      console.error('Unexpected error in subscription list fetch', err);
    }
  }

   onCopyClick(){
      this.showAssignDialog=true;
       this.enableSubscriptionDialog.next(this.showAssignDialog);
    }

    navigateToUserAssignment(selectedUser: any) {
      this.commonService.navigateRouteWithState({
         route: AppRoutes.User.USER_MANAGEMENT_CONFIG,
        type: 'Manager',
        routeData: selectedUser
      });
    }


}
