import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiRequestPayload, ApiResponseWithoutContent, ColumnFilterDescriptor, ApiResponse as PagedApiResponse, createEmptyPagedResult, createServiceErrorHandler, toPagedResult } from '../../lib/constants';
import { PagedResult } from '../../lib/constants';
import { AppRoutes } from '../../lib/api-constant';

/**
 * Domain models for PETA/PETD
 */
export type PetaType = 'PETA' | 'PETD';

export interface CompanyPetaRow {
    id: number;
    companyName: string;
    companyCode: number;
    petaCalling: boolean;
    oceanFrequencyTypeId: number | null;
    oceanFrequencyTypeCode: string | null;
    oceanFrequencyTypeName: string | null;
    airFrequencyTypeId: number | null;
    airFrequencyTypeCode: string | null;
    airFrequencyTypeName: string | null;
    railRoadFrequencyTypeId: number | null;
    railRoadFrequencyTypeCode: string | null;
    railRoadFrequencyTypeName: string | null;
    updatedBy: string | null;
    /** ISO string from API */
    updatedOn: string | null;
}

export interface FrequencyConfig {
    id: number;
    configType: 'PETA_PETD_FREQUENCY';
    keyCode: string; // e.g., OCEAN_EVERY_3_DAYS_DEFAULT
    name: string; // e.g., Every 3 days
    description: string;
    intValue: number; // interval value in minutes
    stringValue: 'MINUTES';
}

export type TransportMode = 'OCEAN' | 'AIR' | 'RAIL_ROAD';

export interface FrequencyOption {
    id: number;
    mode: TransportMode;
    key: string;
    label: string;
    minutes: number;
    isDefault: boolean;
}

export interface GroupedFrequencyOptions {
    ocean: FrequencyOption[];
    air: FrequencyOption[];
    railRoad: FrequencyOption[];
}

// UI option for PrimeNG Select with numeric id values
export interface UiSelectOption {
    label: string;
    value: number;
    key: string;
}

export interface UpdateCompanyPayload {
    companyCode: number;
    petaCalling: boolean;
    oceanFrequencyType: number;
    airFrequencyType: number;
    railRoadFrequencyType: number;
}

export interface BulkUpdatePayload {
    companyCodes: number[];
    petaCalling: boolean;
    isAllSelected: boolean;
}

@Injectable({ providedIn: 'root' })
export class PetaService {
    private readonly http = inject(HttpClient);
    private readonly handleError = createServiceErrorHandler('PetaService');

    private readonly listUrl = AppRoutes.PetaPetdManagement.GET_COMPANY_PETA_LIST;
    private readonly configsUrl = AppRoutes.PetaPetdManagement.GET_COMPANY_PETA_CONFIG;
    private readonly updateUrl = AppRoutes.PetaPetdManagement.UPDATE_COMPANY_PETA_LIST;
    private readonly bulkUpdateUrl = AppRoutes.PetaPetdManagement.BULK_UPDATE_COMPANY_PETA_LIST;

    // Cache configs in-memory to avoid repeated calls
    private configsCache$?: Observable<FrequencyConfig[]>;

  private readonly SEARCHABLE_COLUMNS = ['companyName', 'companyCode', 'updatedBy'];

    /**
     * Fetch paginated premium companies with their PETA/PETD configuration.
     * Uses centralized ApiRequest/ApiResponse contracts.
     */
    getCompanyConfigs(
        page: number,
        size: number,
        searchTerm: string,
        columnFilters: ColumnFilterDescriptor[] = []
    ): Observable<PagedResult<CompanyPetaRow>> {
        const requestPayload: ApiRequestPayload = {
            pagination: { page, size },
            searchFilter: {
                searchText: searchTerm?.trim() || '',
                columns: [...this.SEARCHABLE_COLUMNS]
            },
            columns: columnFilters.map(cf => ({
                columnName: cf.columnName,
                filter: cf.filter,
                sort: cf.sort
            })),
        };
        return this.http
            .post<PagedApiResponse<CompanyPetaRow>>(this.listUrl, requestPayload)
            .pipe(
                map(res => toPagedResult(res)),
                catchError(this.handleError<PagedResult<CompanyPetaRow>>('getCompanyConfigs', createEmptyPagedResult<CompanyPetaRow>()))
            );
    }

    /**
     * Fetch all frequency configuration items and provide them as raw list.
     */
    getFrequencyConfigs(): Observable<FrequencyConfig[]> {
        if (!this.configsCache$) {
            this.configsCache$ = this.http
                .get<ApiResponseWithoutContent>(this.configsUrl)
                .pipe(
                    map(res => (res.success && Array.isArray(res.data) ? (res.data as unknown as FrequencyConfig[]) : [])),
                    catchError(this.handleError<FrequencyConfig[]>('getFrequencyConfigs', [])),
                    shareReplay(1)
                );
        }
        return this.configsCache$;
    }

    /**
     * Convenience: fetch configs and group them by transport mode with default flags.
     */
    getGroupedFrequencyOptions(): Observable<GroupedFrequencyOptions> {
        return this.getFrequencyConfigs().pipe(
            map(configs => this.groupFrequencyOptions(configs))
        );
    }

    /**
     * UI helper: return SelectOption arrays for each mode, preserving labels.
     */
    getSelectOptionsForUI(): Observable<{ ocean: UiSelectOption[]; air: UiSelectOption[]; railRoad: UiSelectOption[] }> {
        return this.getGroupedFrequencyOptions().pipe(
            map(g => ({
                ocean: g.ocean.map(o => ({ label: o.label, value: o.id, key: o.key })),
                air: g.air.map(o => ({ label: o.label, value: o.id, key: o.key })),
                railRoad: g.railRoad.map(o => ({ label: o.label, value: o.id, key: o.key })),
            }))
        );
    }

    /**
     * Update a single company's PETA/PETD calling and frequency types
     */
    updateCompany(payload: UpdateCompanyPayload): Observable<ApiResponseWithoutContent> {
        return this.http
            .put<ApiResponseWithoutContent>(this.updateUrl, payload)
            .pipe(catchError(this.handleError<ApiResponseWithoutContent>('updateCompany')));
    }

    /**
     * Bulk update PETA calling flag for multiple companies
     */
    bulkUpdatePetaCalling(payload: BulkUpdatePayload): Observable<ApiResponseWithoutContent> {
        return this.http
            .put<ApiResponseWithoutContent>(this.bulkUpdateUrl, payload)
            .pipe(catchError(this.handleError<ApiResponseWithoutContent>('bulkUpdatePetaCalling')));
    }

    // ---------------------- Helpers ---------------------- //

    private groupFrequencyOptions(configs: FrequencyConfig[]): GroupedFrequencyOptions {
        const toOption = (c: FrequencyConfig): FrequencyOption => ({
            id: c.id,
            mode: this.getModeFromKey(c.keyCode),
            key: c.keyCode,
            label: c.name,
            minutes: c.intValue,
            isDefault: c.keyCode.endsWith('_DEFAULT'),
        });

        const options = configs
            .filter(c => c.configType === 'PETA_PETD_FREQUENCY')
            .map(toOption)
            // Keep a stable UX: sort by minutes asc
            .sort((a, b) => a.minutes - b.minutes);

        return {
            ocean: options.filter(o => o.mode === 'OCEAN'),
            air: options.filter(o => o.mode === 'AIR'),
            railRoad: options.filter(o => o.mode === 'RAIL_ROAD'),
        };
    }

    private getModeFromKey(key: string): TransportMode {
        if (key.startsWith('OCEAN_')) return 'OCEAN';
        if (key.startsWith('AIR_')) return 'AIR';
        return 'RAIL_ROAD';
    }
}
