import { PetaManagementComponent } from './pages/master-data-management/peta-petd-management/peta-management/peta-management.component';
import { Routes } from "@angular/router";
import { RoleControlComponent } from "./pages/master-data-management/role-management/role-control/role-control.component";
import { UserControlComponent } from "./pages/user-managment/user-control/user-control.component";
import { UserConfigurationComponent } from "./pages/user-managment/user-configuration/user-configuration.component";
import { SubscriptionComponent } from "./pages/master-data-management/subscription-management/subscription/subscription.component";
import { SubscriptionDialogComponent } from "./shared/component/dialog/subscription-dialog/subscription-dialog.component";
import { AuthGuard } from "@auth0/auth0-angular";
import { AuthGuard as Auth0Guard } from '@auth0/auth0-angular';
import { ReleaseNotesComponent } from "./pages/master-data-management/release-management/release-notes/release-notes.component";
import { UploadDownloadDialogComponent } from "./shared/component/dialog/upload-download-dialog/upload-download-dialog.component";
import { PagePlaceholderComponent } from "./shared/component/page-placeholder/page-placeholder.component";
export const routes: Routes = [
    {
        path: "",
       // canActivate: [Auth0Guard,AuthGuard],
        component: PagePlaceholderComponent, data: { title: 'Home' },
    },
    // Home
    { path: 'home', component: PagePlaceholderComponent, data: { title: 'Home' } },
    // Tracking/Favorites/Alerts
    { path: 'tracking-list', component: PagePlaceholderComponent, data: { title: 'Tracking List' } },
    { path: 'favorites', component: PagePlaceholderComponent, data: { title: 'Favorites' } },
    { path: 'alerts', component: PagePlaceholderComponent, data: { title: 'Alerts' } },
    // Reporting
    { path: 'reporting/builder', component: PagePlaceholderComponent, data: { title: 'Report Builder' } },
    { path: 'reporting/analytics', component: PagePlaceholderComponent, data: { title: 'Analytics' } },
    // 3PL
    { path: '3pl/upload', component: PagePlaceholderComponent, data: { title: '3PL Upload' } },
    { path: '3pl/exception-manager', component: PagePlaceholderComponent, data: { title: '3PL Exception Manager' } },
    { path: '3pl/exception-configurator', component: PagePlaceholderComponent, data: { title: '3PL Exception Configurator' } },
    { path: '3pl/event-manager', component: PagePlaceholderComponent, data: { title: '3PL Event Manager' } },
    { path: '3pl/shipment-reprocessing', component: PagePlaceholderComponent, data: { title: '3PL Shipment Reprocessing' } },
    // Data Management
    { path: 'data-management/exception-manager', component: PagePlaceholderComponent, data: { title: 'Exception Manager' } },
    { path: 'data-management/exception-configurator', component: PagePlaceholderComponent, data: { title: 'Exception Configurator' } },
    { path: 'data-management/event-manager', component: PagePlaceholderComponent, data: { title: 'Event Manager' } },
    { path: 'data-management/geofence-manager', component: PagePlaceholderComponent, data: { title: 'Geofence Manager' } },
    { path: 'data-management/shipment-reprocessing', component: PagePlaceholderComponent, data: { title: 'Shipment Reprocessing' } },
    { path: 'data-management/bdp-rep-email-manager', component: PagePlaceholderComponent, data: { title: 'BDP Rep Email Manager' } },
    { path: "user-configuration", component: UserConfigurationComponent },
    { path: "user-control", component: UserControlComponent },
    { path: "subscription", component: SubscriptionComponent },
    { path: "subscription-dialog", component: SubscriptionDialogComponent },
    // Master Data (actual sections and placeholders)
    { path: 'master-data/source-system-identifier', component: PagePlaceholderComponent, data: { title: 'Source System Identifier Manager' } },
    { path: 'master-data/peta-petd', component: PetaManagementComponent },
    { path: 'master-data/subscription-management', component: SubscriptionComponent },
    { path: 'master-data/role-management', component: RoleControlComponent },
    { path: 'master-data/customer-carrier', component: PagePlaceholderComponent, data: { title: 'Customer Carrier Management' } },
    { path: 'master-data/customer-onboarding', component: PagePlaceholderComponent, data: { title: 'Customer Onboarding' } },
    { path: 'master-data/hierarchy', component: PagePlaceholderComponent, data: { title: 'Hierarchy Management' } },
    { path: 'master-data/location/ocean-port', component: PagePlaceholderComponent, data: { title: 'Ocean Port Master' } },
    { path: 'master-data/location/airport', component: PagePlaceholderComponent, data: { title: 'Airport Master' } },
    { path: 'master-data/carrier/ocean', component: PagePlaceholderComponent, data: { title: 'Ocean Carrier Master' } },
    { path: 'master-data/carrier/air', component: PagePlaceholderComponent, data: { title: 'Air Carrier Master' } },
    { path: 'master-data/equivalency/ocean-port', component: PagePlaceholderComponent, data: { title: 'Ocean Port Equivalency' } },
    { path: 'master-data/equivalency/flight', component: PagePlaceholderComponent, data: { title: 'Flight Equivalency' } },
    { path: 'master-data/equivalency/air-carrier', component: PagePlaceholderComponent, data: { title: 'Air Carrier Equivalency' } },
    { path: 'master-data/equivalency/ocean-carrier', component: PagePlaceholderComponent, data: { title: 'Ocean Carrier Equivalency' } },
    { path: 'master-data/country-region', component: PagePlaceholderComponent, data: { title: 'Country & Region Master' } },
    { path: 'master-data/vessel', component: PagePlaceholderComponent, data: { title: 'Vessel Management' } },
    { path: 'master-data/schedule', component: PagePlaceholderComponent, data: { title: 'Schedule Manager' } },
    { path: 'master-data/email-template', component: PagePlaceholderComponent, data: { title: 'Email Template Manager' } },
    { path: 'master-data/release', component: PagePlaceholderComponent, data: { title: 'Release Manager' } },
    { path: 'master-data/eula', component: PagePlaceholderComponent, data: { title: 'EULA Manager' } },
    { path: 'master-data/audit-logs', component: PagePlaceholderComponent, data: { title: 'Audit Logs' } },
    {
        path: "release-notes",
        component: ReleaseNotesComponent,
    },
    {
        path: "release-notes-new",
        component: UploadDownloadDialogComponent,
    },
    // Fallback
    { path: 'app/**', redirectTo: '' }
];
