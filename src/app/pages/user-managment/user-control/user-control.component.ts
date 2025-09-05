import { Component, inject } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module'
import { UserControlService } from '../../../shared/service/user-control/user-control.service';
import { AppRoutes } from '../../../shared/lib/api-constant';
import { CommonService } from '../../../shared/service/common/common.service';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { ApiResponse, RequestBody } from '../../../shared/lib/constants';



export interface userInfo{
  userName:String,
  userType:String,
  userEmail:String,
  companyName:String,
  roleName:String,
  companies:String
}

export interface ApiRequestBody{

}

const DEFAULT_REQUEST_BODY: RequestBody = {
  "dataTableRequest": {
    "searchFilter": {
      "searchText": ""
    }
    ,
    "columns": [
      {
        "columnName": "",
        "filter": "",
        "sort":""
      }
    ],
    "pagination": {
      "page": 0,
      "size": 15
    }
  },
  "isActiveRole": true
};

@Component({
  selector: 'app-user-control',
  imports: [PrimengModule,CommonTableSearchComponent],
  templateUrl: './user-control.component.html',
  styleUrl: './user-control.component.scss'
})
export class UserControlComponent {
  userService:UserControlService=inject(UserControlService);
  hasExistingUsers:boolean=true;
  usersTableHeader:any=[];
  inActiveTableHeader:any=[];
  activeIndex:any=0;
  usersList:userInfo[]=[];
  Users:any[]=[];
  selectedUser:userInfo[]=[]
  showAssignDialog:boolean=false;
constructor(private userControlService:UserControlService,private commonService:CommonService) {
    this.usersTableHeader =  [
        { field: 'name', header: 'Name' },
        { field: 'userType', header: 'User Type' },
        { field: 'email', header: 'User Email Id' },
        { field: 'companies', header: 'Company Name' },
        { field: 'roleGranted', header: 'Role Granted' },
        { field: 'updatedBy', header: 'Updated By' },
        { field: 'updatedOn', header: 'Updated On' }
      ];
      this.userService.getUsersList(DEFAULT_REQUEST_BODY).subscribe((res:ApiResponse<userInfo>)=>{
        this.usersList = res.data.content;
      });

    }


  onCopyClick(){
    this.showAssignDialog=true;
  }

  navigateToUserAssignment(selectedUser: any) {
    this.commonService.navigateRouteWithState({
       route: AppRoutes.User.USER_MANAGEMENT_CONFIG,
      type: 'Manager',
      routeData: selectedUser
    });
  }
}
