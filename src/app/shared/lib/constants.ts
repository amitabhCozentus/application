// Shared UI constants
export const DATE_FORMAT_DD_MMM_YYYY = 'dd MMM yyyy';
export const DATE_TIME_FORMAT = 'MM-dd-yyyy HH:mm';

export const STATUSES = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
];
export interface TableHeaders {
    field: string;
    header: string;
    sortable?: boolean;
    filter?: boolean;
    type?: string;
}
export const USER_TABLE_HEADERS: TableHeaders[] = [
    { field: 'userName', header: 'Name', sortable: true, filter: true, type: 'text' },
    { field: 'userId', header: 'User Email Id', sortable: true, filter: true, type: 'text' },
    { field: 'companies', header: 'Company Name', sortable: true, filter: true, type: 'text' },
    { field: 'roleGranted', header: 'Role Granted', sortable: true, filter: true, type: 'text' }
];

export const ROLE_TABLE_HEADERS: TableHeaders[] = [
  { field: 'status', header: 'LBL.STATUS', sortable: true, filter: true },
  { field: 'roleName', header: 'LBL.NAME', sortable: true, filter: true },
  { field: 'roleDescription', header: 'LBL.DESCRIPTION', sortable: true, filter: true },
  { field: 'rolePrivileges', header: 'LBL.PRIVILEGES', sortable: true, filter: true },
  { field: 'customLanding', header: 'LBL.CUSTOM_LANDING', sortable: true, filter: true },
  { field: 'defaultLanding', header: 'LBL.DEFAULT_LANDING', sortable: true, filter: true },
  { field: 'skin', header: 'LBL.SKIN', sortable: true, filter: true },
  { field: 'createdBy', header: 'LBL.CREATED_BY', sortable: true, filter: true },
  { field: 'createdOn', header: 'LBL.CREATED_ON', sortable: true, filter: true },
  { field: 'updatedBy', header: 'LBL.UPDATED_BY', sortable: true, filter: true },
  { field: 'updatedOn', header: 'LBL.UPDATED_ON', sortable: true, filter: true }
];

export const RELEASE_NOTES_TABLE_HEADERS: TableHeaders[] = [
    { field: 'releaseName', header: 'LBL.RELEASE_NAME', sortable: true, filter: true },
    { field: 'releaseDate', header: 'LBL.RELEASE_DATE', sortable: true, filter: true },
    { field: 'uploadedBy', header: 'LBL.UPLOADED_BY', sortable: true, filter: true },
    { field: 'uploadedOn', header: 'LBL.UPLOADED_ON', sortable: true, filter: true }
];

export const USER_MANUAL_TABLE_HEADERS: TableHeaders[] = [
  { field: 'manualName', header: 'LBL.MANUAL_NAME', sortable: true, filter: true },
  { field: 'updatedOn', header: 'LBL.UPDATED_ON', sortable: true, filter: true },
  { field: 'uploadedBy', header: 'LBL.UPLOADED_BY', sortable: true, filter: true },
{ field: 'uploadedOn', header: 'LBL.UPLOADED_ON', sortable: true, filter: true }
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
export interface ApiResponse {
  success: boolean;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    content: ApiRole[];
  };
  timestamp: string;
}
