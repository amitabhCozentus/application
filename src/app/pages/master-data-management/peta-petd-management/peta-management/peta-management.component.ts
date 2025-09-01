import { CommonTableFilterComponent } from './../../../../shared/component/common-table-filter/common-table-filter.component';
import { PrimengModule } from './../../../../shared/primeng/primeng.module';
import { Component, inject, ViewChild } from '@angular/core';
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { PETA_TABLE_HEADERS, TableHeaders, DATE_TIME_FORMAT, ColumnFilterDescriptor, PagedResult, ApiResponseWithoutContent } from '../../../../shared/lib/constants';
import { PetaService, CompanyPetaRow, UiSelectOption } from '../../../../shared/service/peta-petd/peta.service';
import { DEFAULT_API_REQUEST } from '../../../../shared/lib/api-request';
import { Table } from 'primeng/table';
import { buildColumnFiltersFromEvent } from '../../../../shared/lib/column-filter.util';
import { DataTableLazyLoadEvent, handleLazyLoad, handleRefresh, handleSearch } from '../../../../shared/lib/common-utils';
import { ToastComponent } from '../../../../shared/component/toast-component/toast.component';

export type Company = CompanyPetaRow & {
    isEditing?: boolean;
    petaEnabled: boolean;
    oceanFrequencyId: number | null;
    airFrequencyId: number | null;
    railRoadFrequencyId: number | null;
};

@Component({
    selector: 'app-peta-management',
    standalone: true,
    imports: [PrimengModule, CommonTableSearchComponent, CommonTableFilterComponent, ToastComponent],
    templateUrl: './peta-management.component.html',
    styleUrls: ['./peta-management.component.scss']
})
export class PetaManagementComponent {
    private readonly petaService = inject(PetaService);
    searchTerm: string = '';
    totalRecords: number = 0;
    pageSize: number = 10;
    currentPage: number = 0;
    petaGlobal: 'Yes' | 'No' = 'Yes';
    canEdit: boolean = true;

    oceanFrequencyOptions: UiSelectOption[] = [];
    airFrequencyOptions: UiSelectOption[] = [];
    railRoadFrequencyOptions: UiSelectOption[] = [];
    private oceanDefaultId: number | null = null;
    private airDefaultId: number | null = null;
    private railRoadDefaultId: number | null = null;
    dateTimeFormat = DATE_TIME_FORMAT;

    private lastColumnFilters: ColumnFilterDescriptor[] = [];
    companies: Company[] = [];
    @ViewChild('petaTable') petaTable?: Table;
    private suppressNextLazyLoad = false;

    petaTableHeaders: TableHeaders[] = PETA_TABLE_HEADERS;
    selectedCompanies: Company[] = [];
    private isAllSelectedMode = false;
    @ViewChild(ToastComponent) toastComponent!: ToastComponent;

    // Enablement rules
    get isRadioDisabled(): boolean {
        // Radios enabled only when multiple rows are selected
        return !(this.selectedCompanies && this.selectedCompanies.length > 1);
    }

    get isSaveDisabled(): boolean {
        // Save enabled only when multiple rows are selected
        const count = this.selectedCompanies?.length ?? 0;
        return count > 1 ? false : true;
    }

    onSelectionChange(selection: Company[]) {
        this.selectedCompanies = selection || [];
        // Do not toggle edit on single selection; editing is via pencil only
        // Reset header-driven all-selected mode when manual selection changes
        if ((this.selectedCompanies?.length ?? 0) <= 1) {
            this.isAllSelectedMode = false;
        }
    }

    onHeaderCheckboxToggle(event: any) {
        // PrimeNG emits a boolean or an object depending on version; support both
        const checked = typeof event === 'boolean' ? event : !!event?.checked;
        this.isAllSelectedMode = checked;
    }

    ngOnInit() {
        // Map frequency column fields to id-based fields for binding
        this.petaTableHeaders = PETA_TABLE_HEADERS.map(h => {
            if (h.field === 'oceanFrequency') return { ...h, field: 'oceanFrequencyId' };
            if (h.field === 'airFrequency') return { ...h, field: 'airFrequencyId' };
            if (h.field === 'railRoadFrequency') return { ...h, field: 'railRoadFrequencyId' };
            return h;
        });
        this.petaService.getSelectOptionsForUI().subscribe(opts => {
            this.oceanFrequencyOptions = opts.ocean;
            this.airFrequencyOptions = opts.air;
            this.railRoadFrequencyOptions = opts.railRoad;
            this.oceanDefaultId = opts.ocean.find(o => /_DEFAULT$/.test(o.key))?.value ?? null;
            this.airDefaultId = opts.air.find(o => /_DEFAULT$/.test(o.key))?.value ?? null;
            this.railRoadDefaultId = opts.railRoad.find(o => /_DEFAULT$/.test(o.key))?.value ?? null;
        });
    }

    loadCompanies(pageIndex: number, pageSize: number, searchTerm: string, columnFilters: ColumnFilterDescriptor[] = this.lastColumnFilters) {
        const trimmedSearchTerm = searchTerm.trim();
        // persist last used filters for pagination/refresh
        this.lastColumnFilters = columnFilters || [];
        this.petaService.getCompanyConfigs(pageIndex, pageSize, trimmedSearchTerm, this.lastColumnFilters)
            .subscribe({
                next: (res: PagedResult<CompanyPetaRow>) => {
                    if (res && res.data) {
                        // Map API rows to UI view-model and apply defaults when missing
                        this.companies = res.data.map(row => ({
                            ...row,
                            isEditing: false,
                            petaEnabled: row.petaCalling,
                            oceanFrequencyId: row.oceanFrequencyTypeId ?? this.oceanDefaultId,
                            airFrequencyId: row.airFrequencyTypeId ?? this.airDefaultId,
                            railRoadFrequencyId: row.railRoadFrequencyTypeId ?? this.railRoadDefaultId,
                        }));
                        this.totalRecords = res.total;
                    } else {
                        this.companies = [];
                        this.totalRecords = 0;
                    }
                }, error: (err) => {
                    console.error('Error loading company PETA/PETD configurations', err);
                }
            });
    }

    /** Lazy loading callback for PrimeNG table */
    onLazyLoad(event: DataTableLazyLoadEvent) {
        handleLazyLoad({
            event,
            suppressNextLazyLoad: this.suppressNextLazyLoad,
            setSuppressNextLazyLoad: (v) => (this.suppressNextLazyLoad = v),
            setCurrentPage: (p) => (this.currentPage = p),
            setPageSize: (s) => (this.pageSize = s),
            buildColumnFilters: (e) => this.buildColumnFiltersFromEvent(e),
            searchTerm: this.searchTerm,
            loadPage: (page, size, term, filters) => this.loadCompanies(page, size, term, filters)
        });
    }

    /** Search on Enter (min 3 chars) */
    onSearch() {
        handleSearch({
            searchTerm: this.searchTerm,
            minLength: 3,
            pageSize: this.pageSize,
            setCurrentPage: (p) => (this.currentPage = p),
            clearFilters: () => { this.lastColumnFilters = []; },
            setSuppressNextLazyLoad: (v) => (this.suppressNextLazyLoad = v),
            clearTable: () => this.petaTable?.clear(),
            loadPage: (page, size, term, filters) => this.loadCompanies(page, size, term, filters)
        });
    }

    refresh() {
        handleRefresh({
            setSearchTerm: (v) => (this.searchTerm = v),
            setCurrentPage: (p) => (this.currentPage = p),
            clearFilters: () => { this.lastColumnFilters = []; },
            clearTable: () => this.petaTable?.clear()
        });
    }

    /** Map UI field to API column name */
    private toApiField(uiField: string): string {
        const map: Record<string, string> = {
            companyName: 'companyName',
            companyCode: 'companyCode',
            updatedBy: 'updatedBy',
        };
        return map[uiField] || uiField;
    }
    // Use shared util for building column filter descriptors
    private buildColumnFiltersFromEvent(event: any): ColumnFilterDescriptor[] {
        return buildColumnFiltersFromEvent(event, (f) => this.toApiField(f));
    }

    // Global Save: when multiple selected, bulk update PETA calling only; defaults are implied server-side
    saveGlobal() {
        if (!this.selectedCompanies?.length || this.selectedCompanies.length < 2) return;
        const payload = this.isAllSelectedMode
            ? { companyCodes: [], petaCalling: this.petaGlobal === 'Yes', isAllSelected: true }
            : { companyCodes: this.selectedCompanies.map(c => c.companyCode), petaCalling: this.petaGlobal === 'Yes', isAllSelected: false };
        this.petaService.bulkUpdatePetaCalling(payload).subscribe({
            next: (res: ApiResponseWithoutContent) => {
                // Optimistic UI update
                const now = new Date().toISOString();
                if (!this.isAllSelectedMode) {
                    this.companies = this.companies.map(c =>
                        (payload).companyCodes.includes(c.companyCode)
                            ? { ...c, petaEnabled: (payload).petaCalling, updatedBy: 'System', updatedOn: now }
                            : c
                    );
                } else {
                    // Clear selection and reset header all-selected mode, then reload current page
                    this.selectedCompanies = [];
                    this.isAllSelectedMode = false;
                    if (this.petaTable) {
                        // Ensure internal selection is cleared in the table (covers dataKey-based selection)
                        (this.petaTable as any).selection = [];
                        (this.petaTable as any).selectionKeys = {};
                    }
                    // Clear filters/sort and trigger reload
                    this.petaTable?.clear();
                }
                this.toastComponent.showSuccess(res.message);
            },
            error: () => {
                // keep selection; user can retry
            }
        });
    }
    // Ensure defaults are applied if user saves without selection
    applyDefaultsIfMissing(company: Company) {
        if (company.petaEnabled) {
            if (!company.oceanFrequencyId && this.oceanDefaultId) company.oceanFrequencyId = this.oceanDefaultId;
            if (!company.airFrequencyId && this.airDefaultId) company.airFrequencyId = this.airDefaultId;
            if (!company.railRoadFrequencyId && this.railRoadDefaultId) company.railRoadFrequencyId = this.railRoadDefaultId;
        }
    }

    // Example save handler for a single row (can be wired to backend service later)
    saveRow(company: Company) {
        this.applyDefaultsIfMissing(company);
        const payload = {
            companyCode: company.companyCode,
            petaCalling: company.petaEnabled,
            oceanFrequencyType: company.oceanFrequencyId ?? this.oceanDefaultId!,
            airFrequencyType: company.airFrequencyId ?? this.airDefaultId!,
            railRoadFrequencyType: company.railRoadFrequencyId ?? this.railRoadDefaultId!,
        };
        this.petaService.updateCompany(payload).subscribe({
            next: (res: ApiResponseWithoutContent) => {
                company.isEditing = false;
                company.updatedBy = 'System';
                company.updatedOn = new Date().toISOString();
                this.toastComponent.showSuccess(res.message);
            },
            error: () => {
                // keep row in edit mode to allow fixing
            }
        });
    }

    startEdit(row: Company) {
        // Only enter edit mode via pencil; clear edits on other rows
        const key = row.companyCode;
        this.companies = this.companies.map(r => ({ ...r, isEditing: r.companyCode === key }));
    }

    cancelEdit(row: Company) {
        // Revert edit state without saving
        row.isEditing = false;
    }
}
