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
    { field: 'description', header: 'Description', sortable: true, filter: true },
    { field: 'privileges', header: 'Privileges', sortable: true, filter: true },
    { field: 'customLanding', header: 'Custom Landing', sortable: true, filter: true },
    { field: 'defaultLanding', header: 'Default Landing', sortable: true, filter: true },
    { field: 'skin', header: 'Skin', sortable: true, filter: true },
    { field: 'createdBy', header: 'Created By', sortable: true, filter: true },
    { field: 'createdOn', header: 'Created On', sortable: true, filter: true },
    { field: 'updatedBy', header: 'Updated By', sortable: true, filter: true },
    { field: 'updatedOn', header: 'Updated On', sortable: true, filter: true }
];
