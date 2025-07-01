import { Routes } from "@angular/router";
import { RoleControlComponent } from "./pages/role-management/role-control/role-control.component";
import { UserControlComponent } from "./pages/user-managment/user-control/user-control/user-control.component";
import { UserConfigurationComponent } from "./pages/user-managment/user-configuration/user-configuration/user-configuration.component";
import { SubscriptionComponent } from "./pages/subscription-management/subscription/subscription.component";
export const routes: Routes = [
    {
        path: "",
        component: UserControlComponent,
        pathMatch: "full",
    },
    {
        path: "role",
        component: RoleControlComponent,
    },
    {
        path: "user-configuration",
        component: UserConfigurationComponent,
    },
     {
        path: "subscription",
        component: SubscriptionComponent,
    },
];
