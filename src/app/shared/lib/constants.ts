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
    { field: 'status', header: 'Role Status', sortable: true, filter: true, type: 'text' },
    { field: 'roleName', header: 'Role Name', sortable: true, filter: true, type: 'text' },
    { field: 'roleDescription', header: 'Role Description', sortable: true, filter: true, type: 'text' },
    { field: 'rolePrivileges', header: 'Role Privileges', sortable: true, filter: true, type: 'text' },
    { field: 'customLanding', header: 'Custom Landing', sortable: true, filter: true, type: 'text' },
    { field: 'defaultLanding', header: 'Default Landing', sortable: true, filter: true, type: 'text' },
    { field: 'skin', header: 'Skin', sortable: true, filter: true, type: 'text' },
    { field: 'createdBy', header: 'Created By', sortable: true, filter: true, type: 'text' },
    { field: 'createdOn', header: 'Created On', sortable: true, filter: true, type: 'date' },
    { field: 'updatedBy', header: 'Updated By', sortable: true, filter: true, type: 'text' },
    { field: 'updatedOn', header: 'Updated On', sortable: true, filter: true, type: 'date' }
];

export const RELEASE_NOTES_TABLE_HEADERS: TableHeaders[] = [
    { field: 'releaseName', header: 'Release Name', sortable: true, filter: true, type: 'text' },
    { field: 'releaseDate', header: 'Date of Release Note', sortable: true, filter: true, type: 'date' },
    { field: 'uploadedBy', header: 'Uploaded By', sortable: true, filter: true, type: 'text' },
    { field: 'uploadedOn', header: 'Uploaded On', sortable: true, filter: true, type: 'date' }
];

export const USER_MANUAL_TABLE_HEADERS: TableHeaders[] = [
    { field: 'manualName', header: 'User Manual Name', sortable: true, filter: true, type: 'text' },
    { field: 'updatedOn', header: 'Last Update On', sortable: true, filter: true, type: 'date' },
    { field: 'uploadedBy', header: 'Uploaded By', sortable: true, filter: true, type: 'text' },
    { field: 'uploadedOn', header: 'Uploaded On', sortable: true, filter: true, type: 'date' }
];

export const PETA_TABLE_HEADERS: TableHeaders[] = [
  { field: 'companyName', header: 'Company Name', sortable: true, filter: true, type: 'text' },
  { field: 'companyCode', header: 'Company Code', sortable: true, filter: true, type: 'text' },
  { field: 'petaEnabled', header: 'PETA Calling', sortable: false, filter: false, type: 'boolean' },
  { field: 'oceanFrequency', header: 'Ocean Frequency', sortable: false, filter: false, type: 'select' },
  { field: 'airFrequency', header: 'Air Frequency', sortable: false, filter: false, type: 'select' },
  { field: 'railRoadFrequency', header: 'Rail/ Road Frequency', sortable: false, filter: false, type: 'select' },
  { field: 'updatedBy', header: 'Updated By', sortable: true, filter: true, type: 'text' },
  { field: 'updatedOn', header: 'Updated On', sortable: true, filter: true, type: 'date' }
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
