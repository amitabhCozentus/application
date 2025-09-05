import { AfterViewInit, Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
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
import { UserConfigurationService, UserAssignmentPayload } from '../../../shared/service/user-configuration/user-configuration.service';
import { MessageService } from 'primeng/api';

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
    styleUrl: './user-configuration.component.scss',
    providers: [MessageService]
})


export class UserConfigurationComponent implements OnInit {
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
    selectedIndex: string = '0'; 
    selectedCompanyIndex: string = '0'; // Use this as the company tab index
    searchTerm: string = '';
    userTypeList: UserType[] = [];
    roleType: number | null = null;
    totalRecords!: number;
    viewPsaCompanyList: TreeNode[] = [];
    viewNonPsaCompanyList: TreeNode[] = [];
    selectionKeys: { [key: string]: { checked: boolean, partialChecked: boolean } } = {};
    userControlService: UserControlService = inject(UserControlService);
    commonService: CommonService = inject(CommonService);
    userConfigurationService: UserConfigurationService = inject(UserConfigurationService);
    messageService: MessageService = inject(MessageService);
    loading = signal(true);
    error = signal(false);
    checked: boolean = false; // For BDP Employee toggle
    private isAssignedCompaniesFetched = false;
    private psaDataLoaded = false;  // Flag for PSA data
    private nonPsaDataLoaded = false;  // Flag for Non-PSA data
    private assignedCodes: Set<string> = new Set<string>();  // Initialize as an empty Set
    private isInitialLoadComplete = false; // Add flag for initial load

    // New properties for selection keys
    psaSelectionKeys: { [key: string]: { checked: boolean, partialChecked: boolean } } = {};
    nonPsaSelectionKeys: { [key: string]: { checked: boolean, partialChecked: boolean } } = {};

    // Add missing properties
    isExternalAccess: boolean = false;
    canEdit: boolean = true;

    private cdr = inject(ChangeDetectorRef);

    // Add persistent storage for company details across all pages
    private allCompanyDetailsCache = new Map<string, { companyCode: string, companyName: string }>();

    constructor() {
        this.cols = [
            { header: 'Company Name', field: 'companyName' },
            { header: 'Company Code', field: 'id' },
            { header: 'Type', field: 'subscriptionType' }
        ];
        // Don't fetch company trees in constructor - wait for tab selection
    }

    ngOnInit() {
        // Initialize with assigned companies first
        this.initializeData();
    }

    private async initializeData() {
        try {
            this.loading.set(true);
            // Fetch assigned companies first
            await this.fetchAssignedCompanies();
            this.isInitialLoadComplete = true;
            this.loading.set(false);
        } catch (error) {
            console.error('Error initializing data:', error);
            this.loading.set(false);
        }
    }

    onCompanyTabChange(event: any) {
        this.selectedCompanyIndex = event;
        
        // Load data only when needed and not already loaded
        if (event === '0' && !this.psaDataLoaded) {
            this.loadCompanyData('PSA');
        } else if (event === '1' && !this.nonPsaDataLoaded) {
            this.loadCompanyData('NON-PSA');
        }
    }

    onTabChange(event: any) {
        switch (event) {
            case '0':
                break;
            case '1':
                if (this.userTypeList.length === 0) {
                    this.loadRoleList();
                }
                break;
            case '2':
                this.selectedIndex = '2';
                // Load company data when Company tab is selected
                if (!this.isInitialLoadComplete) {
                    this.initializeData();
                } else {
                    // Load PSA data by default when company tab is opened
                    if (!this.psaDataLoaded) {
                        this.loadCompanyData('PSA');
                    }
                }
                break;
        }
    }

    private loadRoleList() {
        this.userControlService.getRoleList().subscribe({
            next: (response: ApiResponseWithoutContent) => {
                this.userTypeList = response.success
                    ? (response.data || []).map((item: any) => ({
                        id: item.roleId,
                        roleName: item.roleName
                    }))
                    : [];
            },
            error: (err) => {
                console.error('Error fetching role list:', err);
            }
        });
    }

    private loadCompanyData(type: 'PSA' | 'NON-PSA') {
        const requestBody = type === 'PSA' ? initialPSARequestBody : initialNonPSARequestBody;
        
        this.loading.set(true);
        this.callSignal(requestBody, false, () => {
            if (type === 'PSA') {
                this.psaDataLoaded = true;
            } else {
                this.nonPsaDataLoaded = true;
            }
            
            // Apply selections if assigned companies are already loaded
            if (this.isAssignedCompaniesFetched) {
                this.applySelectionsToTrees();
            }
            this.loading.set(false);
        });
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
                    // Ensure keys are strings for proper binding
                    this.viewPsaCompanyList.forEach((node: any) => {
                        node.key = String(node.key);
                    });
                    this.psaPaginationState.first = 0;
                    this.psaPaginationState.totalRecords = data.data.totalSize;
                    // Cache company details from search results
                    this.cacheCompanyDetailsFromNodes(this.viewPsaCompanyList);
                } else {
                    this.viewNonPsaCompanyList = data.data.companyTreeNodes;
                    // Ensure keys are strings for proper binding
                    this.viewNonPsaCompanyList.forEach((node: any) => {
                        node.key = String(node.key);
                    });
                    this.nonPsaPaginationState.first = 0;
                    this.nonPsaPaginationState.totalRecords = data.data.totalSize;
                    // Cache company details from search results
                    this.cacheCompanyDetailsFromNodes(this.viewNonPsaCompanyList);
                }

                // Apply selections to search results without clearing existing selections
                this.applySelectionsToCurrentPage(type);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching company list:', err);
                this.loading.set(false);
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
                    searchText: this.searchTerm || ''
                },
                columns: []
            },
            type: type
        };
        this.userControlService.getCompanyList(requestBody).subscribe({
            next: (data: any) => {
                if (type === 'PSA') {
                    this.viewPsaCompanyList = data.data.companyTreeNodes;
                    // Ensure keys are strings for proper binding
                    this.viewPsaCompanyList.forEach((node: any) => {
                        node.key = String(node.key);
                    });
                    this.psaPaginationState.first = event.first;
                    this.psaPaginationState.rows = event.rows;
                    this.psaPaginationState.totalRecords = data.data.totalSize;
                    // Cache company details from current page
                    this.cacheCompanyDetailsFromNodes(this.viewPsaCompanyList);
                } else {
                    this.viewNonPsaCompanyList = data.data.companyTreeNodes;
                    // Ensure keys are strings for proper binding
                    this.viewNonPsaCompanyList.forEach((node: any) => {
                        node.key = String(node.key);
                    });
                    this.nonPsaPaginationState.first = event.first;
                    this.nonPsaPaginationState.rows = event.rows;
                    this.nonPsaPaginationState.totalRecords = data.data.totalSize;
                    // Cache company details from current page
                    this.cacheCompanyDetailsFromNodes(this.viewNonPsaCompanyList);
                }

                // Apply selections to current page without clearing existing selections
                this.applySelectionsToCurrentPage(type);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching company list:', err);
                this.loading.set(false);
            }
        });
    }

    private async fetchAssignedCompanies() {
        const userId = '2';
        return new Promise<void>((resolve, reject) => {
            this.userConfigurationService.getUserAssignedCompanies(userId).subscribe({
                next: (response: any) => {
                    if (response && response.success && response.data) {
                        const psaCompanies = response.data.psaCompanies || [];
                        const nonPsaCompanies = response.data.nonPsaCompanies || [];

                        this.assignedCodes = new Set<string>([
                            ...psaCompanies.map((c: any) => String(c.companyCode).trim()),
                            ...nonPsaCompanies.map((c: any) => String(c.companyCode).trim())
                        ].filter(code => !!code));

                        // Pre-populate selection keys with assigned companies
                        this.populateAssignedSelectionKeys(psaCompanies, nonPsaCompanies);

                        this.isAssignedCompaniesFetched = true;
                        resolve();
                    } else {
                        resolve();
                    }
                },
                error: (err) => {
                    console.error('Failed to fetch assigned companies', err);
                    reject(err);
                }
            });
        });
    }

    // Pre-populate selection keys with assigned companies data
    private populateAssignedSelectionKeys(psaCompanies: any[], nonPsaCompanies: any[]) {
        // Populate PSA selection keys
        psaCompanies.forEach(company => {
            const companyCode = String(company.companyCode).trim();
            const companyKey = String(company.companyKey || company.id || companyCode);
            
            if (companyCode) {
                this.psaSelectionKeys[companyKey] = { checked: true, partialChecked: false };
                
                // Cache company details
                this.allCompanyDetailsCache.set(companyKey, {
                    companyCode: companyCode,
                    companyName: company.companyName || `Company ${companyCode}`
                });
            }
        });

        // Populate Non-PSA selection keys
        nonPsaCompanies.forEach(company => {
            const companyCode = String(company.companyCode).trim();
            const companyKey = String(company.companyKey || company.id || companyCode);
            
            if (companyCode) {
                this.nonPsaSelectionKeys[companyKey] = { checked: true, partialChecked: false };
                
                // Cache company details
                this.allCompanyDetailsCache.set(companyKey, {
                    companyCode: companyCode,
                    companyName: company.companyName || `Company ${companyCode}`
                });
            }
        });

    }

    // Enhanced method to get ALL selected companies including pre-assigned ones
    private getSelectedCompanies(): { companyCode: string, companyName: string }[] {
        const allSelectedCompanies: { companyCode: string, companyName: string }[] = [];
        
        // Get all selected keys from PSA and Non-PSA
        const psaSelectedKeys = this.getCheckedKeys(this.psaSelectionKeys);
        const nonPsaSelectedKeys = this.getCheckedKeys(this.nonPsaSelectionKeys);
                
        // Build final list from all selected keys using the persistent cache
        [...psaSelectedKeys, ...nonPsaSelectedKeys].forEach(key => {
            if (this.allCompanyDetailsCache.has(key)) {
                allSelectedCompanies.push(this.allCompanyDetailsCache.get(key)!);
            } else {                
                // Fallback: if it's an assigned company code, create a basic entry
                if (this.assignedCodes.has(key)) {
                    allSelectedCompanies.push({
                        companyCode: key,
                        companyName: `Company ${key}` // Fallback name
                    });
                } else {
                    // Try to find by matching company code directly
                    const matchingCode = Array.from(this.assignedCodes).find(code => 
                        key.includes(code) || code.includes(key)
                    );
                    if (matchingCode) {
                        allSelectedCompanies.push({
                            companyCode: matchingCode,
                            companyName: `Company ${matchingCode}`
                        });
                    }
                }
            }
        });
        
        return allSelectedCompanies;
    }

    // Cache company details from nodes for later retrieval
    private cacheCompanyDetailsFromNodes(nodeList: TreeNode[]) {
        nodeList.forEach(node => {
            const key = String(node.key);
            if (node.data?.id && node.data?.companyName) {
                this.allCompanyDetailsCache.set(key, {
                    companyCode: node.data.id,
                    companyName: node.data.companyName
                });
            }
            if (node.children) {
                this.cacheCompanyDetailsFromNodes(node.children);
            }
        });
    }

    private updateCompanySelection(companyList: TreeNode[], assignedCodes: Set<string>, type: string) {
        if (!companyList || companyList.length === 0 || assignedCodes.size === 0) {
            return;
        }

        // Apply selections when data is updated
        this.applySelectionsToTrees();
    }

    callSignal(companyListPayLoad: ApiRequestBody, useSignal: boolean = true, onLoaded?: () => void) {
        const observable$ = this.userControlService.getCompanyList(companyListPayLoad).pipe(
            map((response: ApiResponse<TreeNode>) => {
                this.loading.set(false);
                this.error.set(false);
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
                    // Cache company details from Non-PSA
                    this.cacheCompanyDetailsFromNodes(this.viewNonPsaCompanyList);
                }
                if (companyListPayLoad.type === 'PSA') {
                    this.viewPsaCompanyList = data.companyTreeNodes;
                    // Ensure keys are strings for proper binding
                    this.viewPsaCompanyList.forEach((node: any) => {
                        node.key = String(node.key);
                    });
                    this.psaPaginationState.totalRecords = data.totalSize;
                    // Cache company details from PSA
                    this.cacheCompanyDetailsFromNodes(this.viewPsaCompanyList);
                }
            })
        );
        observable$.subscribe({
            next: () => {
                if (onLoaded) onLoaded();
            }
        });
    }

    // Optimized helper to get only checked keys
    private getCheckedKeys(selectionKeys: { [key: string]: { checked: boolean, partialChecked: boolean } }): string[] {
        return Object.keys(selectionKeys).filter(key => selectionKeys[key]?.checked === true);
    }

    private applySelectionsToCurrentPage(type: string) {
        if (type === 'PSA' && this.viewPsaCompanyList.length > 0) {
            this.viewPsaCompanyList.forEach(node => {
                this.selectNodeAndChildren(node, this.psaSelectionKeys);
            });
        } else if (type === 'NON-PSA' && this.viewNonPsaCompanyList.length > 0) {
            this.viewNonPsaCompanyList.forEach(node => {
                this.selectNodeAndChildren(node, this.nonPsaSelectionKeys);
            });
        }
        this.cdr.detectChanges();
    }

    private applySelectionsToTrees() {
        if (!this.isAssignedCompaniesFetched) return;

        // Don't clear existing selections - preserve user selections across pagination
        // this.psaSelectionKeys = {};
        // this.nonPsaSelectionKeys = {};

        // Apply to PSA only if data is loaded
        if (this.psaDataLoaded && this.viewPsaCompanyList.length > 0) {
            this.viewPsaCompanyList.forEach(node => {
                this.selectNodeAndChildren(node, this.psaSelectionKeys);
            });
        }

        // Apply to Non-PSA only if data is loaded
        if (this.nonPsaDataLoaded && this.viewNonPsaCompanyList.length > 0) {
            this.viewNonPsaCompanyList.forEach(node => {
                this.selectNodeAndChildren(node, this.nonPsaSelectionKeys);
            });
        }

        // Force change detection
        this.cdr.detectChanges();
    }

    private selectNodeAndChildren(node: TreeNode, selectionKeys: { [key: string]: { checked: boolean, partialChecked: boolean } }) {
        const nodeId = String(node.data?.id || '').trim();
        const nodeKey = String(node.key || '');

        // Preserve existing user selections OR apply assigned company selections
        if (this.assignedCodes.has(nodeId) || selectionKeys[nodeKey]?.checked) {
            selectionKeys[nodeKey] = { checked: true, partialChecked: false };
        }

        if (node.children) {
            node.children.forEach(child => {
                this.selectNodeAndChildren(child, selectionKeys);
            });
        }
    }

    continueSetup(configurationType: string) {
        // const userId = this.selectedUser?.userId;
        const userId = '2';
        switch (configurationType) {
            case 'userSetup':
                // Information Tab: Only pass isBdpEmployee
                const infoPayload = {
                    isBdpEmployee: this.checked
                };
                break;
            case 'userType':
                // Role Type Tab: Pass roleId and isBdpEmployee and userId
                const rolePayload = {
                    roleId: this.roleType ?? 6,
                    isBdpEmployee: this.checked,
                    userId: userId
                };
                break;
            case 'confirmCompanySelection':
                // Company Tab: Pass roleId, isBdpEmployee, assignedCompanies
                const companyPayload = this.buildUserConfigPayload();
                this.userConfigurationService.updateUserConfiguration(companyPayload, userId).subscribe({
                    next: (response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'User configuration updated successfully'
                        });
                        
                        // Reset pagination states to page 1
                        this.psaPaginationState = {
                            first: 0,
                            rows: 10,
                            pageIndex: 0,
                            pageCount: 0,
                            totalRecords: 0
                        };
                        
                        this.nonPsaPaginationState = {
                            first: 0,
                            rows: 10,
                            pageIndex: 0,
                            pageCount: 0,
                            totalRecords: 0
                        };
                        
                        // Clear existing data and flags to force fresh fetch
                        this.viewPsaCompanyList = [];
                        this.viewNonPsaCompanyList = [];
                        this.psaDataLoaded = false;
                        this.nonPsaDataLoaded = false;
                        this.isAssignedCompaniesFetched = false;
                        
                        // Clear cache and selection keys to get fresh data
                        this.allCompanyDetailsCache.clear();
                        this.psaSelectionKeys = {};
                        this.nonPsaSelectionKeys = {};
                        
                        // Re-initialize with fresh assigned companies data
                        this.initializeData().then(() => {
                            // Load the currently active company tab with fresh data
                            if (this.selectedCompanyIndex === '0') {
                                this.loadCompanyData('PSA');
                            } else if (this.selectedCompanyIndex === '1') {
                                this.loadCompanyData('NON-PSA');
                            }
                        });
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update user configuration'
                        });
                    }
                });
                break;
        }
    }

    setCoreFeatures(event: any) {

    }

    refresh() {
        // Reset global filter
        this.searchTerm = '';

        // Use selectedCompanyIndex to determine which tab to refresh
        if (this.selectedCompanyIndex === '0') {
            // PSA tab
            this.psaPaginationState = {
                first: 0,
                rows: 10,
                pageIndex: 0,
                pageCount: 0,
                totalRecords: 0
            };
            this.callSignal(initialPSARequestBody, false, () => {
                this.updateCompanySelection(this.viewPsaCompanyList, this.assignedCodes, 'PSA');
            });
        } else if (this.selectedCompanyIndex === '1') {
            // NON-PSA tab
            this.nonPsaPaginationState = {
                first: 0,
                rows: 10,
                pageIndex: 0,
                pageCount: 0,
                totalRecords: 0
            };
            this.callSignal(initialNonPSARequestBody, false, () => {
                this.updateCompanySelection(this.viewNonPsaCompanyList, this.assignedCodes, 'NON-PSA');
            });
        }
    }

    // Build the payload as per your requirements
    buildUserConfigPayload() {
        return {
            roleId: this.roleType ?? 6,
            isBdpEmployee: this.checked,
            assignedCompanies: this.getSelectedCompanies()
        };
    }

    // Add missing methods
    resetSearch() {
        this.searchTerm = '';
        this.refresh();
    }

    goBack() {
        // Navigate back functionality
    }

    openAddRoleDialog() {
        // Open add role dialog functionality
    }
}