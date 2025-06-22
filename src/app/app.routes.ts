import { Routes } from "@angular/router";
import { RoleControlComponent } from "./pages/role-management/role-control/role-control.component";
import { UserControlComponent } from "./pages/user-managment/user-control/user-control/user-control.component";

export const routes: Routes = [
    {
        path: '',
        component: UserControlComponent,
        pathMatch: 'full'
    },
    {
        path: 'role',
        component: RoleControlComponent
    }
];