import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

// Shared UI constants
export const DATE_FORMAT_DD_MMM_YYYY = 'dd MMM yyyy';
export const DATE_TIME_FORMAT = 'MM-dd-yyyy HH:mm';

export const ROLE_STATUS = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
];

export const CUSTOM_LANDING = [
  { label: 'Yes', value: 'notnull' },
  { label: 'No', value: 'null' }
];

export interface TableHeaders {
    field: string;
    header: string;
    sortable?: boolean;
    filter?: boolean;
    type?: 'text' | 'numeric' | 'date' | 'boolean' | 'select';
}
export const USER_TABLE_HEADERS: TableHeaders[] = [
    { field: 'userName', header: 'Name', sortable: true, filter: true, type: 'text' },
    { field: 'userId', header: 'User Email Id', sortable: true, filter: true, type: 'text' },
    { field: 'companies', header: 'Company Name', sortable: true, filter: true, type: 'text' },
    { field: 'roleGranted', header: 'Role Granted', sortable: true, filter: true, type: 'text' }
];

export const ROLE_TABLE_HEADERS: TableHeaders[] = [
    { field: 'status', header: 'LBL.STATUS', sortable: true, filter: true, type: 'boolean' },
    { field: 'roleName', header: 'LBL.ROLE_NAME', sortable: true, filter: true, type: 'text' },
    { field: 'roleDescription', header: 'LBL.ROLE_DESCRIPTION', sortable: true, filter: true, type: 'text' },
    { field: 'rolePrivileges', header: 'LBL.ROLE_PRIVILEGES', sortable: false, filter: true, type: 'text' },
    { field: 'customLanding', header: 'LBL.CUSTOM_LANDING', sortable: true, filter: true, type: 'text' },
    { field: 'defaultLanding', header: 'LBL.DEFAULT_LANDING', sortable: true, filter: true, type: 'text' },
    { field: 'skin', header: 'LBL.SKIN', sortable: false, filter: true, type: 'text' },
    { field: 'createdBy', header: 'LBL.CREATED_BY', sortable: true, filter: true, type: 'text' },
    { field: 'createdOn', header: 'LBL.CREATED_ON', sortable: true, filter: true, type: 'date' },
    { field: 'updatedBy', header: 'LBL.UPDATED_BY', sortable: true, filter: true, type: 'text' },
    { field: 'updatedOn', header: 'LBL.UPDATED_ON', sortable: true, filter: true, type: 'date' }
];

export const RELEASE_NOTES_TABLE_HEADERS: TableHeaders[] = [
    { field: 'releaseName', header: 'LBL.RELEASE_NAME', sortable: true, filter: true, type: 'text' },
    { field: 'releaseDate', header: 'LBL.RELEASE_DATE', sortable: true, filter: true, type: 'date' },
    { field: 'uploadedBy', header: 'LBL.UPLOADED_BY', sortable: true, filter: true, type: 'text' },
    { field: 'uploadedOn', header: 'LBL.UPLOADED_ON', sortable: true, filter: true, type: 'date' }
];

export const USER_MANUAL_TABLE_HEADERS: TableHeaders[] = [
    { field: 'manualName', header: 'LBL.MANUAL_NAME', sortable: true, filter: true, type: 'text' },
    { field: 'updatedOn', header: 'LBL.UPDATED_ON', sortable: true, filter: true, type: 'date' },
    { field: 'uploadedBy', header: 'LBL.UPLOADED_BY', sortable: true, filter: true, type: 'text' },
    { field: 'uploadedOn', header: 'LBL.UPLOADED_ON', sortable: true, filter: true, type: 'date' }
];

export const SUBSCRIPTION_TABLE_HEADERS: TableHeaders[] = [
  { field: 'customerName', header: 'LBL.CUSTOMER_NAME', sortable: true, filter: true, type: 'text' },
  { field: 'customerCode', header: 'LBL.CUSTOMER_CODE', sortable: true, filter: true, type: 'numeric' },
  { field: 'subscriptionTypeName', header: 'LBL.SUBSCRIPTION_TYPE', sortable: true, filter: true, type: 'text' },
  { field: 'onboardedOn', header: 'LBL.ONBOARDED_ON', sortable: true, filter: true, type: 'date' },
  { field: 'onboardedSourceName', header: 'LBL.ONBOARDED_SOURCE', sortable: true, filter: true, type: 'text' },
  { field: 'updatedOn', header: 'LBL.UPDATED_ON', sortable: true, filter: true, type: 'date' },
  { field: 'updatedBy', header: 'LBL.UPDATED_BY', sortable: true, filter: true, type: 'text' }
];

export const PETA_TABLE_HEADERS: TableHeaders[] = [
  { field: 'companyName', header: 'LBL.COMPANY_NAME', sortable: true, filter: true, type: 'text' },
  { field: 'companyCode', header: 'LBL.COMPANY_CODE', sortable: true, filter: true, type: 'text' },
  { field: 'petaEnabled', header: 'LBL.PETA_CALLING', sortable: false, filter: false, type: 'boolean' },
  { field: 'oceanFrequency', header: 'LBL.OCEAN_FREQUENCY', sortable: false, filter: false, type: 'select' },
  { field: 'airFrequency', header: 'LBL.AIR_FREQUENCY', sortable: false, filter: false, type: 'select' },
  { field: 'railRoadFrequency', header: 'LBL.RAIL_ROAD_FREQUENCY', sortable: false, filter: false, type: 'select' },
  { field: 'updatedBy', header: 'LBL.UPDATED_BY', sortable: true, filter: true, type: 'text' },
  { field: 'updatedOn', header: 'LBL.UPDATED_ON', sortable: true, filter: true, type: 'date' }
];

export interface SelectOption {
    label: string;
    value: string;
}

// PETA/PETD frequency options and defaults
export const OCEAN_FREQUENCY_OPTIONS: SelectOption[] = [
  { label: 'Everyday', value: 'Everyday' },
  { label: 'Every Alternate Days', value: 'Every Alternate Days' },
  { label: 'Every 3 Days', value: 'Every 3 Days' },
  { label: 'Every 4 Days', value: 'Every 4 Days' },
  { label: 'Every 5 Days', value: 'Every 5 Days' },
  { label: 'Every 6 Days', value: 'Every 6 Days' },
  { label: 'Every 7 Days', value: 'Every 7 Days' },
];
export const DEFAULT_OCEAN_FREQUENCY = 'Every 3 Days';

export const AIR_FREQUENCY_OPTIONS: SelectOption[] = [
  { label: 'Every 15 Minutes', value: 'Every 15 Minutes' },
  { label: 'Every 30 Minutes', value: 'Every 30 Minutes' },
  { label: 'Every 45 Minutes', value: 'Every 45 Minutes' },
  { label: 'Every 1 Hour', value: 'Every 1 Hour' },
  { label: 'Every 2 Hour', value: 'Every 2 Hour' },
  { label: 'Every 3 Hour', value: 'Every 3 Hour' },
  { label: 'Every 4 Hour', value: 'Every 4 Hour' },
  { label: 'Every 5 Hour', value: 'Every 5 Hour' },
  { label: 'Every 6 Hour', value: 'Every 6 Hour' },
  { label: 'Every Day (24 Hours)', value: 'Every Day (24 Hours)' },
];
export const DEFAULT_AIR_FREQUENCY = 'Every 15 Minutes';

export const RAIL_ROAD_FREQUENCY_OPTIONS: SelectOption[] = [
  { label: 'Every 1 Hour', value: 'Every 1 Hour' },
  { label: 'Every 2 Hour', value: 'Every 2 Hour' },
  { label: 'Every 3 Hour', value: 'Every 3 Hour' },
  { label: 'Every 4 Hour', value: 'Every 4 Hour' },
  { label: 'Every 5 Hour', value: 'Every 5 Hour' },
  { label: 'Every 6 Hour', value: 'Every 6 Hour' },
  { label: 'Every Day (24 Hours)', value: 'Every Day (24 Hours)' },
];
export const DEFAULT_RAIL_ROAD_FREQUENCY = 'Every 1 Hour';

/** Data shape for prefilling the Role Configuration dialog form */
export interface RoleConfigData {
    id: number;
    status: 'Active' | 'Inactive';
    roleName: string;
    roleDescription: string;
    rolePrivileges: string[];
    customLanding: 'Yes' | 'No';
    defaultLanding: string | null;
    roleType: string;
    skin: string | null;
    createdBy: string;
    createdOn: string;
    updatedBy: string;
    updatedOn: string;
}
// API response shapes for RoleService
export interface ApiPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
export interface ApiRoleType { id: number; key: string; name: string; }
export interface ApiLandingPage { id: number; key: string; name: string; }
export interface ApiPrivilege {
  privilegeId: number;
  privilegeName: string;
  privilegeKey: string;
  mapCatFeatPrivId: number;
  isSelected: boolean;
}
export interface ApiFeature {
  featureId: number;
  featureName: string;
  featureKey: string;
  privileges: ApiPrivilege[];
}
export interface ApiCategory {
  categoryId: number;
  categoryName: string;
  categoryKey: string;
  features: ApiFeature[];
}
export interface ApiSkinConfig { id: number; key: string; name: string; }
export interface ApiRole {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  roleType: ApiRoleType;
  landingPage?: ApiLandingPage;
  privilegeHierarchy: ApiCategory[];
  skinConfigs: ApiSkinConfig[];
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
}

export interface ApiResponseWithoutContent {
  success: boolean;
  data: [];
  message: string;
  timestamp?: string;
}
export interface ApiRequestPayload {
    pagination: {
        page: number;
        size: number;
    };
    searchFilter: {
        searchText?: string;
        columns?: string[]; // optional: which columns global search applies to
    };
    columns: Array<{
        columnName?: string;
        filter?: string;
        sort?: string;
    }>;
}

// Column filter/sort descriptor to be sent in payload
export interface ColumnFilterDescriptor {
    columnName?: string;
    /**
     * Filter operations supported by API.
     * Examples:
     *  - Text:    cnt:foo | ncnt:bar | sw:pre | ew:suf | eq:val | ne:val
     *  - Number:  gt:5 | gte:5 | lt:10 | lte:10 | eq:3 | ne:7 | in:1,2,3
     *  - Date:    dgt:2024-01-01 | dgte:2024-01-01 | dlt:2024-12-31 | dlte:2024-12-31 | deq:2024-05-10 | dne:2024-05-10 | dbetween:2024-01-01,2024-12-31
     */
    filter?: string;
    /** asc | desc */
    sort?: 'asc' | 'desc';
}

/**
 * Utility: create an empty paged result compatible with services that return `{ data: T[]; total: number }`.
 * Keeps typing structural to avoid circular deps.
 */
export function createEmptyPagedResult<T>(): { data: T[]; total: number; success: boolean } {
    return { data: [], total: 0, success: false };
}

// Centralized compact paged result and mapper
export interface PagedResult<T> { data: T[]; total: number; success?: boolean }

export function toPagedResult<T>(res: ApiResponse<T>): PagedResult<T> {
  if (!res?.success || !res?.data) return createEmptyPagedResult<T>();
  const page = res.data;
  return {
    data: Array.isArray(page.content) ? page.content : [],
    total: typeof page.totalElements === 'number' ? page.totalElements : 0,
  };
}

/**
 * Factory to create a unified error handler for services.
 * Usage:
 *   private handleError = createServiceErrorHandler('MyService');
 *   ...pipe(catchError(this.handleError<Result>('loadThing', fallback)))
 */
export function createServiceErrorHandler(serviceName: string) {
  return function handleError<T>(operation = 'operation', fallback?: T) {
    return (error: unknown): Observable<T> => {
      const httpError = error as HttpErrorResponse;
      // eslint-disable-next-line no-console
      console.error(`${serviceName} ${operation} failed:`, httpError?.message || error);
      return fallback !== undefined ? of(fallback) : throwError(() => httpError);
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    content: T[];
  };
  timestamp?: string;
}

export interface PaginationState {
  first: number;
  rows: number;
  pageIndex: number;
  pageCount: number;
  totalRecords: number;
}

export const enum FilterOperation {
  Contains = 'cnt:',
  NotContains = 'ncnt:',
  StartsWith = 'sw:',
  EndsWith = 'ew:',
  Equals = 'eq:',
  NotEquals = 'ne:',
  GreaterThan = 'gt:',
  GreaterThanOrEqual = 'gte:',
  LessThan = 'lt:',
  LessThanOrEqual = 'lte:',
  DateGreaterThan = 'dgt:',
  DateGreaterThanOrEqual = 'dgte:',
  DateLessThan = 'dlt:',
  DateLessThanOrEqual = 'dlte:',
  DateEquals = 'deq:',
  DateNotEquals = 'dne:',
  DateBetween = 'dbetween:',
  In = 'in:'
}

export interface RequestBody {
  dataTableRequest: {
    pagination: {
      page: number;
      size: number;
    };
    searchFilter: {
      searchText: string;
      // columns: string[];
    };
    columns: Array<{
      columnName: string;
      filter: string;
      sort: string;
    }>;
  };
  isActiveRole: boolean;
}
