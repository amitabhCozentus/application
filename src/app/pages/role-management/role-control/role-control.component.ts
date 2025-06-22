import { PrimengModule } from './../../../shared/primeng/primeng.module';
import { Component, OnInit } from "@angular/core";
import { RoleService } from "../../../shared/service/role-control/role.service";
import { ROLE_TABLE_HEADERS, TableHeaders } from "../../../shared/lib/constants";
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';

interface Role {
    id: number;
    roleName: string;
    status: "Active" | "Inactive";
    description: string;
    privileges: string[];
}

interface PagedResult<T> {
    data: T[];
    total: number;
}

@Component({
    selector: "app-role-control",
    standalone: true,
    imports: [PrimengModule, CommonTableSearchComponent],
    templateUrl: "./role-control.component.html",
    styleUrls: ["./role-control.component.scss"],
})
export class RoleControlComponent implements OnInit {
    canEdit: boolean = true; // set from auth context
    pageSize: number = 10;

    roleTableHeaders: TableHeaders[] = ROLE_TABLE_HEADERS;
    roles: Role[] = [];
    totalRecords: number = 0;
    loading: boolean = false;
    searchTerm: string = "";
    allPrivileges: string[] = [
        "List view (Download, Read)",
        "Port master data management",
        "Data Management",
        "Tracking list",
        "No KPIs",
        "No Map",
        "Shipment details",
        "Scheduling",
        "Routing",
        "3PL Analytics",
    ];

    constructor(private roleService: RoleService) {}

    ngOnInit() {
        this.loadRoles(0, this.pageSize);
    }

    /** Load one page from server */
    loadRoles(pageIndex: number, pageSize: number) {
        this.loading = true;
        this.roleService
            .getActiveRoles(pageIndex, pageSize, this.searchTerm)
            .subscribe((res) => {
                this.roles = res.data;
                this.totalRecords = res.total;
                this.loading = false;
            });
    }

    /** Pagination callback */
    onPage(event: { page: number; rows: number }) {
        this.loadRoles(event.page, event.rows);
    }

    /** Search on Enter (min 3 chars) */
    onSearch() {
        if (this.searchTerm.length >= 3) {
            this.loadRoles(0, this.pageSize);
        }
    }

    resetSearch() {
        this.searchTerm = "";
        this.loadRoles(0, this.pageSize);
    }

    refresh() {
        this.loadRoles(0, this.pageSize);
    }

    editRole(role: Role) {
        console.log("Edit", role);
    }

    openAddRoleDialog() {
        console.log("Add Role");
    }
}
