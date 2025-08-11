import { Routes } from "@angular/router";
import { RoleControlComponent } from "./pages/role-management/role-control/role-control.component";
import { UserControlComponent } from "./pages/user-managment/user-control/user-control.component";
import { UserConfigurationComponent } from "./pages/user-managment/user-configuration/user-configuration.component";
import { SubscriptionComponent } from "./pages/subscription-management/subscription/subscription.component";
import { SubscriptionDialogComponent } from "./shared/component/dialog/subscription-dialog/subscription-dialog.component";
import { AuthGuard } from "@auth0/auth0-angular";
import { AuthGuard as Auth0Guard } from '@auth0/auth0-angular';
export const routes: Routes = [
    {
        path: "",
       // canActivate: [Auth0Guard,AuthGuard],
        component: RoleControlComponent,
    },
    {
        path: "user-configuration",
        component: UserConfigurationComponent,
    },
    {
        path: "user-control",
        component: UserControlComponent,
    },
    {
        path: "subscription",
        component: SubscriptionComponent,
    },
     {
        path: "subscription-dialog",
        component: SubscriptionDialogComponent,
    },
     {
        path: "role-management",
        component: RoleControlComponent,
    },
];
