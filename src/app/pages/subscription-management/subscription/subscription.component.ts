import { ChangeDetectorRef, Component, EventEmitter, Inject, Output, output } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { SubscriptionDialogComponent } from '../../../shared/component/dialog/subscription-dialog/subscription-dialog.component';
import { CommonService } from '../../../shared/service/common/common.service';
import { AppRoutes } from '../../../shared/lib/api-constant';
import { SubscriptionService } from '../../../shared/service/subscription/subscription.service';
import { SubscriptionCopyDialogComponent } from '../../../shared/component/dialog/subscription-copy-dialog/subscription-copy-dialog.component';
import { SubscriptionTierDialogComponent } from '../../../shared/component/dialog/subscription-tier-dialog/subscription-tier-dialog.component';
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
  featureIds?: number[]; 
}
interface PaginationState {
  first: number;
  rows: number;
  pageIndex: number;
  pageCount: number;
  totalRecords: number;
}

@Component({
  selector: 'app-subscription',
  imports: [PrimengModule, CommonTableSearchComponent, SubscriptionDialogComponent,SubscriptionCopyDialogComponent, SubscriptionTierDialogComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})


export class SubscriptionComponent {
  @Output() enableSubscriptionDialog: EventEmitter<boolean> = new EventEmitter<boolean>();
  showAssignDialog:boolean = false;
  isDialogOpen: boolean = false;
  selectedSubscription: Subscription | null = null;
  selectedCopySubscription: Subscription | null = null;
  subscription:any[];
  subscriptionTableHeader:Header[];
  subscriptionList:Subscription[] = [];
  selectedUsers: Subscription[] = [];
  features: number[] = [];
  isSubscriptionTierButtonActive: boolean = false;
  showSubscriptionTierDialog: boolean = false;
  
  onSelectionChange(event: any) {
    // event is the array of selected assignments
    this.selectedUsers = event || [];
    this.isSubscriptionTierButtonActive = this.selectedUsers.length > 0;
  }

  openSubscriptionTierDialog() {
    this.showSubscriptionTierDialog = true;
  }

  closeSubscriptionTierDialog() {
    this.showSubscriptionTierDialog = false;
  }

  totalRecords: number ;
  
   paginationState: PaginationState = {
    first: 0,
    rows: 10,
    pageIndex: 0,
    pageCount: 0,
    totalRecords: 0
  };
  constructor(private commonService:CommonService,private subscriptionService: SubscriptionService,private readonly changeDetector: ChangeDetectorRef)  {
  this.subscriptionTableHeader =  [
  { field: 'customerName', header: 'LBL.CUSTOMER_NAME' },
  { field: 'customerCode', header: 'LBL.CUSTOMER_CODE' },
  { field: 'subscriptionType', header: 'LBL.SUBSCRIPTION_TYPE' },
  { field: 'onBoardedOn', header: 'LBL.ONBOARDED_ON' },
  { field: 'onBoardedSource', header: 'LBL.ONBOARDED_SOURCE' },
  { field: 'updatedOn', header: 'LBL.UPDATED_ON' },
  { field: 'updatedBy', header: 'LBL.UPDATED_BY' },
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

  loadSubscriptionList(page: number = 0, size: number = 10) {
  const requestBody = {
    pagination: { page, size }
  };
  
  this.subscriptionService.getCustomerSubscriptionList(requestBody).subscribe({
    next: (response: { data: { content: Array<any>, totalElements: number } }) => {
      const content = response?.data?.content || [];
      this.totalRecords = response?.data?.totalElements || 0;
      this.subscriptionList = content.map((item): Subscription => ({
        customerName: item.customerName,
        customerCode: item.customerCode,
        subscriptionType: item.subscriptionTypeName,
        onBoardedOn: item.onboardedOn,
        onBoardedSource: item.onboardedSourceName,
        updatedOn: item.updatedOn,
        updatedBy: item.updatedBy,
        featureIds: item.featureIds || [] 
      }));
    },
    error: (error) => {
      console.error('Error fetching subscription list', error);
    }
  });
}

  ngOnInit() {
    this.loadSubscriptionList();

  // Fetch config master features
    this.subscriptionService.getConfigMaster().subscribe({
      next: (response) => {
        this.features = response.data
          .filter((item: any) => item.configType === 'FEATURE_TOGGLE')
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            configType: item.configType
          }));
        // console.log('Features loaded:', this.features);
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching config master features', error);
      }
    });
}


   onCopyClick(subscription: Subscription) {
    this.selectedCopySubscription = subscription;
    this.showAssignDialog = true;
  }

  handleCopyDialogClose() {
    this.showAssignDialog = false;
    this.selectedCopySubscription = null;
  }

  handleCopyUpdateSuccess() {
    this.loadSubscriptionList();
    this.handleCopyDialogClose();
  }

    navigateToEditSubscription(subscription: Subscription) {
        // Always assign a new object reference to trigger change detection
        this.selectedSubscription = { ...subscription };
        this.isDialogOpen = false;
        setTimeout(() => {
          this.isDialogOpen = true;
        }, 0);
    }
  onPageChange(event: any) {
    console.log('Page change event:', event);
    this.paginationState.first = event.first;
    this.paginationState.rows = event.rows;
    this.paginationState.pageIndex = event.page;
    this.paginationState.pageCount = Math.ceil(this.totalRecords / this.paginationState.rows);
    this.paginationState.totalRecords = this.totalRecords;

    const requestBody = {
      pagination: { page: this.paginationState.first, size: this.paginationState.rows }
      // searchFilter: { searchText: '', columns: [] as String[] },
      // columns: [] as any[],
      // sortFieldValidator: { validSortFields: [] as String[] }
    };
    
    this.subscriptionService.getCustomerSubscriptionList(requestBody).subscribe({
      next: (response: { data: { content: Array<any>, totalElements: number } }) => {
        const content = response?.data?.content || [];
        this.totalRecords = response?.data?.totalElements || 0;
        this.subscriptionList = [...content];
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
  }

  // Add this method to handle the save event from the dialog
  handleSubscriptionTierSave() {
    this.loadSubscriptionList();
    this.selectedUsers = [];
    this.isSubscriptionTierButtonActive = false;
  }

  handleDialogClose() {
    this.isDialogOpen = false;
    this.selectedSubscription = null;
  }

}
