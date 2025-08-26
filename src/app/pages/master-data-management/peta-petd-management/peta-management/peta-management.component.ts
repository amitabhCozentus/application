import { PrimengModule } from './../../../../shared/primeng/primeng.module';
import { Component } from '@angular/core';
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { PETA_TABLE_HEADERS, OCEAN_FREQUENCY_OPTIONS, AIR_FREQUENCY_OPTIONS, RAIL_ROAD_FREQUENCY_OPTIONS, DEFAULT_OCEAN_FREQUENCY, DEFAULT_AIR_FREQUENCY, DEFAULT_RAIL_ROAD_FREQUENCY, TableHeaders, DATE_TIME_FORMAT } from '../../../../shared/lib/constants';

export interface Company {
    companyName: string;
    companyCode: string;
    petaEnabled: boolean;
    oceanFrequency?: string | null;
    airFrequency?: string | null;
    railRoadFrequency?: string | null;
    updatedBy?: string;
    updatedOn?: Date | string;
    isEditing?: boolean;
}

@Component({
    selector: 'app-peta-management',
    standalone: true,
    imports: [PrimengModule, CommonTableSearchComponent],
    templateUrl: './peta-management.component.html',
    styleUrls: ['./peta-management.component.scss']
})
export class PetaManagementComponent {
    searchTerm: string = '';
    totalRecords: number = 0;
    pageSize: number = 10;
    currentPage: number = 0;
    petaGlobal: 'Yes' | 'No' = 'Yes';
    canEdit: boolean = true;

    oceanFrequencyOptions = OCEAN_FREQUENCY_OPTIONS;
    airFrequencyOptions = AIR_FREQUENCY_OPTIONS;
    railRoadFrequencyOptions = RAIL_ROAD_FREQUENCY_OPTIONS;
    dateTimeFormat = DATE_TIME_FORMAT;

    // Sample data; replace with API integration when available
    companies: Company[] = [
        {
            companyName: 'Acme Corp',
            companyCode: 'ACM',
            petaEnabled: true,
            oceanFrequency: DEFAULT_OCEAN_FREQUENCY,
            airFrequency: DEFAULT_AIR_FREQUENCY,
            railRoadFrequency: DEFAULT_RAIL_ROAD_FREQUENCY,
            updatedBy: 'System',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Globex',
            companyCode: 'GLX',
            petaEnabled: false,
            oceanFrequency: null,
            airFrequency: null,
            railRoadFrequency: null,
            updatedBy: 'Admin',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Initech',
            companyCode: 'INT',
            petaEnabled: true,
            oceanFrequency: 'Every 4 Days',
            airFrequency: 'Every 30 Minutes',
            railRoadFrequency: 'Every 2 Hour',
            updatedBy: 'Jane Doe',
            updatedOn: new Date(),
            isEditing: false,
        },{
            companyName: 'Acme Corp',
            companyCode: 'ACM',
            petaEnabled: true,
            oceanFrequency: DEFAULT_OCEAN_FREQUENCY,
            airFrequency: DEFAULT_AIR_FREQUENCY,
            railRoadFrequency: DEFAULT_RAIL_ROAD_FREQUENCY,
            updatedBy: 'System',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Globex',
            companyCode: 'GLX',
            petaEnabled: false,
            oceanFrequency: null,
            airFrequency: null,
            railRoadFrequency: null,
            updatedBy: 'Admin',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Initech',
            companyCode: 'INT',
            petaEnabled: true,
            oceanFrequency: 'Every 4 Days',
            airFrequency: 'Every 30 Minutes',
            railRoadFrequency: 'Every 2 Hour',
            updatedBy: 'Jane Doe',
            updatedOn: new Date(),
            isEditing: false,
        },{
            companyName: 'Acme Corp',
            companyCode: 'ACM',
            petaEnabled: true,
            oceanFrequency: DEFAULT_OCEAN_FREQUENCY,
            airFrequency: DEFAULT_AIR_FREQUENCY,
            railRoadFrequency: DEFAULT_RAIL_ROAD_FREQUENCY,
            updatedBy: 'System',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Globex',
            companyCode: 'GLX',
            petaEnabled: false,
            oceanFrequency: null,
            airFrequency: null,
            railRoadFrequency: null,
            updatedBy: 'Admin',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Initech',
            companyCode: 'INT',
            petaEnabled: true,
            oceanFrequency: 'Every 4 Days',
            airFrequency: 'Every 30 Minutes',
            railRoadFrequency: 'Every 2 Hour',
            updatedBy: 'Jane Doe',
            updatedOn: new Date(),
            isEditing: false,
        },{
            companyName: 'Acme Corp',
            companyCode: 'ACM',
            petaEnabled: true,
            oceanFrequency: DEFAULT_OCEAN_FREQUENCY,
            airFrequency: DEFAULT_AIR_FREQUENCY,
            railRoadFrequency: DEFAULT_RAIL_ROAD_FREQUENCY,
            updatedBy: 'System',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Globex',
            companyCode: 'GLX',
            petaEnabled: false,
            oceanFrequency: null,
            airFrequency: null,
            railRoadFrequency: null,
            updatedBy: 'Admin',
            updatedOn: new Date(),
            isEditing: false,
        },
        {
            companyName: 'Initech',
            companyCode: 'INT',
            petaEnabled: true,
            oceanFrequency: 'Every 4 Days',
            airFrequency: 'Every 30 Minutes',
            railRoadFrequency: 'Every 2 Hour',
            updatedBy: 'Jane Doe',
            updatedOn: new Date(),
            isEditing: false,
        },
    ];

    petaTableHeaders: TableHeaders[] = PETA_TABLE_HEADERS;
    selectedCompanies: Company[] = [];

    ngOnInit() {
        this.loadCompanies();
    }

    loadCompanies() {
        this.totalRecords = this.companies.length;
    }

    /** Search on Enter (min 3 chars) */
    onSearch() {
    const trimmedTerm = this.searchTerm.trim();
        if (trimmedTerm.length >= 3) {
            this.currentPage = 0;
            console.log(trimmedTerm);
        }
    }

    resetSearch() {
        this.searchTerm = "";
        this.currentPage = 0;
    }

    /** Lazy loading callback for PrimeNG table */
    onLazyLoad(event: any) {
        const page = event.first / event.rows;
        this.currentPage = page;
        this.pageSize = event.rows;

        console.log(this.currentPage, this.pageSize);
    }

    // Global Save (apply defaults to selected or all rows when PETA is ON)
    saveGlobal() {
        const targets = this.selectedCompanies?.length ? this.selectedCompanies : this.companies;
        targets.forEach(c => this.applyDefaultsIfMissing(c));
        const now = new Date();
        targets.forEach(c => { c.updatedBy = 'You'; c.updatedOn = now; c.isEditing = false; });
        // TODO: call service to persist and show toast
    }

    async copyRow(row: unknown) {
        try {
            const text = JSON.stringify(row, null, 2);
            await navigator.clipboard.writeText(text);
            // Optionally add a toast later; keeping it silent per requirements
        } catch (e) {
            // Fallback: do nothing if clipboard API unavailable
        }
    }

    // Ensure defaults are applied if user saves without selection
    applyDefaultsIfMissing(company: Company) {
        if (company.petaEnabled) {
            if (!company.oceanFrequency) company.oceanFrequency = DEFAULT_OCEAN_FREQUENCY;
            if (!company.airFrequency) company.airFrequency = DEFAULT_AIR_FREQUENCY;
            if (!company.railRoadFrequency) company.railRoadFrequency = DEFAULT_RAIL_ROAD_FREQUENCY;
        }
    }

    // Example save handler for a single row (can be wired to backend service later)
    saveRow(company: Company) {
        this.applyDefaultsIfMissing(company);
        company.isEditing = false;
        company.updatedBy = 'You';
        company.updatedOn = new Date();
        // TODO: call service to persist and show toast
    }
}
