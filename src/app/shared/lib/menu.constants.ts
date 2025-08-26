import { MenuItem } from 'primeng/api';

/**
 * Extends PrimeNG's MenuItem to include an optional permission property
 * for handling role-based access to menu items.
 */
export interface AppMenuItem extends MenuItem {
    permission?: string; // e.g., 'Permissions.HOME_VIEW'
    items?: AppMenuItem[];
}

/**
 * Defines the entire dashboard ribbon menu structure for the application.
 * This constant is used as the single source of truth for rendering the topbar navigation.
 *
 * Each item includes:
 * - label: The display text for the menu item.
 * - icon: The PrimeFlex icon class for the menu item.
 * - routerLink: The Angular router path for navigation.
 * - items: An array of sub-menu items for dropdowns.
 * - permission: (Optional) A key to check against user permissions to determine visibility.
 */
export const MENU_ITEMS: AppMenuItem[] = [
    {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/home',
        permission: 'HOME_VISIBLE' // Custom permission key
    },
    {
        label: 'Tracking List',
        icon: 'pi pi-list',
        routerLink: '/tracking-list'
    },
    {
        label: 'Favorites',
        icon: 'pi pi-star',
        routerLink: '/favorites'
    },
    {
        label: 'Alerts',
        icon: 'pi pi-bell',
        routerLink: '/alerts'
    },
    {
        label: 'Reporting',
        icon: 'pi pi-chart-bar',
        items: [
            { label: 'Report Builder', routerLink: '/reporting/builder' },
            { label: 'Analytics', routerLink: '/reporting/analytics' }
        ]
    },
    {
        label: '3PL',
        icon: 'pi pi-box',
        items: [
            { label: 'Upload', routerLink: '/3pl/upload' },
            { label: 'Exception Manager', routerLink: '/3pl/exception-manager' },
            { label: 'Exception Configurator', routerLink: '/3pl/exception-configurator' },
            { label: 'Event Manager', routerLink: '/3pl/event-manager' },
            { label: 'Shipment Reprocessing', routerLink: '/3pl/shipment-reprocessing' }
        ]
    },
    {
        label: 'Data Management',
        icon: 'pi pi-database',
        items: [
            { label: 'Exception Manager', routerLink: '/data-management/exception-manager' },
            { label: 'Exception Configurator', routerLink: '/data-management/exception-configurator' },
            { label: 'Event Manager', routerLink: '/data-management/event-manager' },
            { label: 'Geofence Manager', routerLink: '/data-management/geofence-manager' },
            { label: 'Shipment Reprocessing', routerLink: '/data-management/shipment-reprocessing' },
            { label: 'BDP Rep Email Manager', routerLink: '/data-management/bdp-rep-email-manager' }
        ]
    },
    {
        label: 'User Management',
        icon: 'pi pi-users',
        routerLink: '/user-control'
    },
    {
        label: 'Master Data',
        icon: 'pi pi-server',
        items: [
            { label: 'Source System Identifier Manager', icon: 'pi pi-id-card', routerLink: '/master-data/source-system-identifier' },
            { label: 'PETA/PETD Management', icon: 'pi pi-id-card', routerLink: '/master-data/peta-petd' },
            { label: 'Customer Subscription Management', icon: 'pi pi-id-card', routerLink: '/master-data/subscription-management' },
            { label: 'Role Management', icon: 'pi pi-user', routerLink: '/master-data/role-management' },
            { label: 'Customer Carrier Management', icon: 'pi pi-briefcase', routerLink: '/master-data/customer-carrier' },
            { label: 'Customer Onboarding', icon: 'pi pi-user-plus', routerLink: '/master-data/customer-onboarding' },
            { label: 'Hierarchy Management', icon: 'pi pi-sitemap', routerLink: '/master-data/hierarchy' },
            {
                label: 'Location Master',
                icon: 'pi pi-map',
                items: [
                    { label: 'Ocean Port Master', icon: 'pi pi-map', routerLink: '/master-data/location/ocean-port' },
                    { label: 'Airport Master', icon: 'pi pi-map', routerLink: '/master-data/location/airport' }
                ]
            },
            {
                label: 'Carrier Master',
                icon: 'pi pi-briefcase',
                items: [
                    { label: 'Ocean Carrier Master', icon: 'pi pi-briefcase', routerLink: '/master-data/carrier/ocean' },
                    { label: 'Air Carrier Master', icon: 'pi pi-briefcase', routerLink: '/master-data/carrier/air' }
                ]
            },
            {
                label: 'Equivalency Management',
                icon: 'pi pi-exchange',
                items: [
                    { label: 'Ocean Port Equivalency', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/ocean-port' },
                    { label: 'Flight Equivalency', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/flight' },
                    { label: 'Air Carrier Equivalency', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/air-carrier' },
                    { label: 'Ocean Carrier Equivalency', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/ocean-carrier' }
                ]
            },
            { label: 'Country & Region Master', icon: 'pi pi-globe', routerLink: '/master-data/country-region' },
            { label: 'Vessel Management', icon: 'pi pi-ship', routerLink: '/master-data/vessel' },
            { label: 'Schedule Manager', icon: 'pi pi-calendar', routerLink: '/master-data/schedule' },
            { label: 'Email Template Manager', icon: 'pi pi-envelope', routerLink: '/master-data/email-template' },
            { label: 'Release Manager', icon: 'pi pi-paperclip', routerLink: '/master-data/release' },
            { label: 'EULA Manager', icon: 'pi pi-file', routerLink: '/master-data/eula' },
            { label: 'Audit Logs', icon: 'pi pi-clock', routerLink: '/master-data/audit-logs' }
        ]
    }
];
