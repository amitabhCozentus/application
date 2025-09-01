import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';

import { TreeNode } from 'primeng/api';
import { UserControlService } from '../../../shared/service/user-control/user-control.service';
import { CommonService } from '../../../shared/service/common/common.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { catchError, map, of, startWith } from 'rxjs';
import { ApiResponse, ApiResponseWithoutContent } from '../../../shared/lib/constants';
import { ApiRequestBody } from '../../../shared/lib/api-request';
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { PaginationState } from '../../../shared/lib/constants';

export const initialPSARequestBody: ApiRequestBody = {
    dataTableRequest: {
        pagination: {
            page: 0,
            size: 10
        },
        searchFilter: {
            searchText: ''
        },
        columns: []
    },
    type: 'PSA'
}
export const initialNonPSARequestBody: ApiRequestBody = {
    dataTableRequest: {
        pagination: {
            page: 0,
            size: 10
        },
        searchFilter: {
            searchText: ''
        },
        columns: []
    },
    type: 'NON-PSA'
}

interface Column {
    header: string;
    field: string;
}

export interface UserType {
    id: number;
    roleName: string;
}

@Component({
    selector: 'app-user-configuration',
    imports: [PrimengModule, CommonTableSearchComponent],
    templateUrl: './user-configuration.component.html',
    styleUrl: './user-configuration.component.scss'
})


export class UserConfigurationComponent {
    psaPaginationState: PaginationState = {
        first: 0,
        rows: 10,
        pageIndex: 0,
        pageCount: 0,
        totalRecords: 0
    };

    nonPsaPaginationState: PaginationState = {
        first: 0,
        rows: 10,
        pageIndex: 0,
        pageCount: 0,
        totalRecords: 0
    };

    selectedUser: any = { userId: "Abhishek.kumar@bdpint.com" };
    cols: Column[] = [];
    selectedIndex: string = '419';
    selectedCompanyIndex: String = '419';
    searchTerm: string = '';
    userTypeList: UserType[] = [];
    roleType: number | null = null;
    totalRecords!: number;
    viewPsaCompanyList: TreeNode[] = [];
    viewNonPsaCompanyList: TreeNode[] = [];
    selectionKeys = {};
    userControlService: UserControlService = inject(UserControlService);
    commonService: CommonService = inject(CommonService);
    loading = signal(true);
    error = signal(false);

    constructor() {
        this.cols = [
            { header: 'Company Name', field: 'companyName' },
            { header: 'Company Code', field: 'id' },
            { header: 'Type', field: 'subscriptionType' }
        ];
        this.callSignal(initialPSARequestBody);
        this.callSignal(initialNonPSARequestBody);
    }

    onCompanyTabChange() {
        // console.log('Signal data:', this.psaCompanyList());
        const signalData:any = [];
        if (signalData && signalData.length > 0) {
            this.viewPsaCompanyList = [...signalData];
        }
    }


    onTabChange(event: any) {
        switch (event) {
            case '0':

                break;
            case '1':
                this.userTypeList.length === 0 ? this.userControlService.getRoleList().subscribe({
                    next: (response: ApiResponseWithoutContent) => {
                        this.userTypeList = response.success ? response.data : [];
                    },
                    error: (err) => {
                        console.error('Error fetching role list:', err);
                    }
                }) : undefined;
                break;
            case '2':
                this.selectedIndex = '2';
                break;
        }
    }
    onSearch(type: string) {
        if (this.searchTerm.length < 3) {
            return;
        }
        const searchText = this.searchTerm;
        this.loading.set(true);
        const requestBody: ApiRequestBody = {
            dataTableRequest: {
                pagination: {
                    page: 0,
                    size: 10
                },
                searchFilter: {
                    searchText: searchText
                },
                columns: []
            },
            type: type
        };
        this.userControlService.getCompanyList(requestBody).subscribe({
            next: (data: any) => {
                if (type === 'PSA') {
                    this.viewPsaCompanyList = data.data.companyTreeNodes;
                } else {
                    this.viewNonPsaCompanyList = data.data.companyTreeNodes;
                }
            },
            error: (err) => {
                console.error('Error fetching company list:', err);
            }
        });
    }

    onPageChange(event: any, type: string) {
        this.loading.set(true);
        const requestBody: ApiRequestBody = {
            dataTableRequest: {
                pagination: {
                    page: (event.first / event.rows),
                    size: event.rows
                },
                searchFilter: {
                    searchText: ''
                },
                columns: []
            },
            type: type
        };
        this.userControlService.getCompanyList(requestBody).subscribe({
            next: (data: any) => {
                if (type === 'PSA') {
                    this.viewPsaCompanyList = data.data.companyTreeNodes;
                } else {
                    this.viewNonPsaCompanyList = data.data.companyTreeNodes;
                }
            },
            error: (err) => {
                console.error('Error fetching company list:', err);
            }
        });
    }

    callSignal(companyListPayLoad: ApiRequestBody) {
        const companyList = toSignal<TreeNode[]>(
            this.userControlService.getCompanyList(companyListPayLoad).pipe(
                map((response: ApiResponse<TreeNode>) => {
                    this.loading.set(false);
                    this.error.set(false);
                    // Return the array from response.data.content
                    return response.data;
                }),
                catchError(err => {
                    console.error('API Error:', err);
                    this.loading.set(false);
                    this.error.set(true);
                    return of([] as TreeNode[]);
                }),
                tap((data: any) => {
                    if (companyListPayLoad.type === 'NON-PSA') {
                        this.viewNonPsaCompanyList = data.companyTreeNodes;
                        this.nonPsaPaginationState.totalRecords = data.totalSize;
                    }
                    if (companyListPayLoad.type === 'PSA') {
                        this.viewPsaCompanyList = data.companyTreeNodes;
                        this.psaPaginationState.totalRecords = data.totalSize;
                    }
                })
            ),
        );
    }

    continueSetup(configurationType: string) {
        switch (configurationType) {
            case 'confirmCompanySelection':
                
                break;

        }



    }

}
