export interface TableHeaders {
    field: string;
    header: string;
    sortable?: boolean;
    filter?: boolean;
}
export const USER_TABLE_HEADERS: TableHeaders[] = [
    { field: 'userName', header: 'Name', sortable: true, filter: true },
    { field: 'userId', header: 'User Email Id', sortable: true, filter: true },
    { field: 'companies', header: 'Company Name', sortable: true, filter: true },
    { field: 'roleGranted', header: 'Role Granted', sortable: true, filter: true }
];

export const ROLE_TABLE_HEADERS: TableHeaders[] = [
    { field: 'status', header: 'Role Status', sortable: true, filter: true },
    { field: 'roleName', header: 'Role Name', sortable: true, filter: true },
    { field: 'roleDescription', header: 'Role Description', sortable: true, filter: true },
    { field: 'rolePrivileges', header: 'Role Privileges', sortable: true, filter: true },
    { field: 'customLanding', header: 'Custom Landing', sortable: true, filter: true },
    { field: 'defaultLanding', header: 'Default Landing', sortable: true, filter: true },
    { field: 'skin', header: 'Skin', sortable: true, filter: true },
    { field: 'createdBy', header: 'Created By', sortable: true, filter: true },
    { field: 'createdOn', header: 'Created On', sortable: true, filter: true },
    { field: 'updatedBy', header: 'Updated By', sortable: true, filter: true },
    { field: 'updatedOn', header: 'Updated On', sortable: true, filter: true }
];

export const RELEASE_NOTES_TABLE_HEADERS: TableHeaders[] = [
    { field: 'releaseName', header: 'Release Name', sortable: true, filter: true },
    { field: 'releaseDate', header: 'Date of Release Note', sortable: true, filter: true },
    { field: 'uploadedBy', header: 'Uploaded By', sortable: true, filter: true },
    { field: 'uploadedOn', header: 'Uploaded On', sortable: true, filter: true }
];

export const USER_MANUAL_TABLE_HEADERS: TableHeaders[] = [
    { field: 'manualName', header: 'User Manual Name', sortable: true, filter: true },
    { field: 'updatedOn', header: 'Last Update On', sortable: true, filter: true },
    { field: 'uploadedBy', header: 'Uploaded By', sortable: true, filter: true },
    { field: 'uploadedOn', header: 'Uploaded On', sortable: true, filter: true }
];

export interface SelectOption {
    label: string;
    value: string;
}

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
  data: { content: ApiRole[]; pagination: ApiPagination };
  timestamp: string;
}
