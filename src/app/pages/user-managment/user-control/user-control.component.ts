import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module'
import { UserControlService } from '../../../shared/service/user-control/user-control.service';
import { AppRoutes } from '../../../shared/lib/api-constant';
import { CommonService } from '../../../shared/service/common/common.service';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { ApiResponse, ColumnFilterDescriptor, RequestBody, USER_TABLE_HEADERS } from '../../../shared/lib/constants';
import { FilterPanelComponent } from '../../../shared/component/filter-panel/filter-panel.component';
import { FilterService } from '../../../shared/service/filter/filter.service';
import { SavedFiltersService } from '../../../shared/service/filter/saved-filters.service';
import { handleRefresh, handleSearch } from '../../../shared/lib/common-utils';
import { Table } from 'primeng/table';



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
  imports: [PrimengModule, CommonTableSearchComponent, FilterPanelComponent],
  templateUrl: './user-control.component.html',
  styleUrl: './user-control.component.scss'
})
export class UserControlComponent implements OnInit{
  pageSize: number = 10;
  userService:UserControlService=inject(UserControlService);
  hasExistingUsers:boolean=true;
  usersTableHeader:any=[];
  inActiveTableHeader:any=[];
  activeIndex:any=0;
  usersList:userInfo[]=[];
  Users:any[]=[];
  selectedUser:userInfo[]=[]
  showAssignDialog:boolean=false;
  filtersVisible = false;
  private filterService = inject(FilterService);
  private savedFilters = inject(SavedFiltersService);
  private lastColumnFilters: ColumnFilterDescriptor[] = [];
  currentPage: number = 0;
  filtersActive = false; // any active criteria in current session
  savedApplied = false;  // highlight only when a saved filter is applied
  #filtersEff = effect(() => {
      this.filtersActive = this.filterService.hasActiveFilters();
      this.savedApplied = this.savedFilters.appliedSavedId() !== null;
  });
  searchTerm: string = "";
  @ViewChild('existingUserTable') userTable?: Table;
  private suppressNextLazyLoad = false;

constructor(private userControlService:UserControlService,private commonService:CommonService) {
    this.usersTableHeader = USER_TABLE_HEADERS;
      this.userService.getUsersList(DEFAULT_REQUEST_BODY).subscribe((res:ApiResponse<userInfo>)=>{
        this.usersList = res.data.content;
      });

    }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


  onCopyClick(){
    this.showAssignDialog=true;
  }

  // Filters panel
  onFiltersApplied() {
    this.filtersActive = this.filterService.hasActiveFilters();
    this.filtersVisible = false;
    this.refresh();
  }

  onFiltersCleared() {
    this.filtersActive = this.filterService.hasActiveFilters();
    this.filtersVisible = false;
    this.refresh();
  }

    refresh() {
            handleRefresh({
                setSearchTerm: (v) => (this.searchTerm = v),
                setCurrentPage: (p) => (this.currentPage = p),
                clearFilters: () => { this.lastColumnFilters = []; },
                clearTable: () => this.userTable?.clear()
            });
        }

    /** Search on Enter (min 3 chars) */
        onSearch() {
        const trimmed = this.searchTerm.trim();
        if (trimmed.length === 0 || trimmed.length >= 3) {
            // Build request body with search text
            const requestBody: RequestBody = {
                ...DEFAULT_REQUEST_BODY,
                dataTableRequest: {
                    ...DEFAULT_REQUEST_BODY.dataTableRequest,
                    searchFilter: {
                        ...DEFAULT_REQUEST_BODY.dataTableRequest.searchFilter,
                        searchText: trimmed
                    }
                }
            };
            this.userService.getUsersList(requestBody).subscribe((res: ApiResponse<userInfo>) => {
                this.usersList = res.data.content;
            });
        }
    }

  navigateToUserAssignment(selectedUser: any) {
    this.commonService.navigateRouteWithState({
       route: AppRoutes.User.USER_MANAGEMENT_CONFIG,
      type: 'Manager',
      routeData: selectedUser
    });
  }
}

