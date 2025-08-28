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
        label: 'LBL.MENU.HOME',
        icon: 'pi pi-home',
        routerLink: '/home',
        permission: 'HOME_VISIBLE' // Custom permission key
    },
    {
        label: 'LBL.MENU.TRACKING_LIST',
        icon: 'pi pi-list',
        routerLink: '/tracking-list'
    },
    {
        label: 'LBL.MENU.FAVORITES',
        icon: 'pi pi-star',
        routerLink: '/favorites'
    },
    {
        label: 'LBL.MENU.ALERTS',
        icon: 'pi pi-bell',
        routerLink: '/alerts'
    },
    {
        label: 'LBL.MENU.REPORTING',
        icon: 'pi pi-chart-bar',
        items: [
            { label: 'LBL.MENU.REPORT_BUILDER', routerLink: '/reporting/builder' },
            { label: 'LBL.MENU.ANALYTICS', routerLink: '/reporting/analytics' }
        ]
    },
    {
        label: 'LBL.MENU.3PL',
        icon: 'pi pi-box',
        items: [
            { label: 'LBL.MENU.UPLOAD', routerLink: '/3pl/upload' },
            { label: 'LBL.MENU.EXCEPTION_MANAGER', routerLink: '/3pl/exception-manager' },
            { label: 'LBL.MENU.EXCEPTION_CONFIGURATOR', routerLink: '/3pl/exception-configurator' },
            { label: 'LBL.MENU.EVENT_MANAGER', routerLink: '/3pl/event-manager' },
            { label: 'LBL.MENU.SHIPMENT_REPROCESSING', routerLink: '/3pl/shipment-reprocessing' }
        ]
    },
    {
        label: 'LBL.MENU.DATA_MANAGEMENT',
        icon: 'pi pi-database',
        items: [
            { label: 'LBL.MENU.EXCEPTION_MANAGER', routerLink: '/data-management/exception-manager' },
            { label: 'LBL.MENU.EXCEPTION_CONFIGURATOR', routerLink: '/data-management/exception-configurator' },
            { label: 'LBL.MENU.EVENT_MANAGER', routerLink: '/data-management/event-manager' },
            { label: 'LBL.MENU.GEOFENCE_MANAGER', routerLink: '/data-management/geofence-manager' },
            { label: 'LBL.MENU.SHIPMENT_REPROCESSING', routerLink: '/data-management/shipment-reprocessing' },
            { label: 'LBL.MENU.BDP_REP_EMAIL_MANAGER', routerLink: '/data-management/bdp-rep-email-manager' }
        ]
    },
    {
        label: 'LBL.MENU.USER_MANAGEMENT',
        icon: 'pi pi-users',
        routerLink: '/user-control'
    },
    {
        label: 'LBL.MENU.MASTER_DATA',
        icon: 'pi pi-server',
        items: [
            { label: 'LBL.MENU.SOURCE_SYSTEM_IDENTIFIER_MANAGER', icon: 'pi pi-id-card', routerLink: '/master-data/source-system-identifier' },
            { label: 'LBL.MENU.PETA_PETD_MANAGEMENT', icon: 'pi pi-id-card', routerLink: '/master-data/peta-petd' },
            { label: 'LBL.MENU.CUSTOMER_SUBSCRIPTION_MANAGEMENT', icon: 'pi pi-id-card', routerLink: '/master-data/subscription-management' },
            { label: 'LBL.MENU.ROLE_MANAGEMENT', icon: 'pi pi-user', routerLink: '/master-data/role-management' },
            { label: 'LBL.MENU.CUSTOMER_CARRIER_MANAGEMENT', icon: 'pi pi-briefcase', routerLink: '/master-data/customer-carrier' },
            { label: 'LBL.MENU.CUSTOMER_ONBOARDING', icon: 'pi pi-user-plus', routerLink: '/master-data/customer-onboarding' },
            { label: 'LBL.MENU.HIERARCHY_MANAGEMENT', icon: 'pi pi-sitemap', routerLink: '/master-data/hierarchy' },
            {
                label: 'LBL.MENU.LOCATION_MASTER',
                icon: 'pi pi-map',
                items: [
                    { label: 'LBL.MENU.OCEAN_PORT_MASTER', icon: 'pi pi-map', routerLink: '/master-data/location/ocean-port' },
                    { label: 'LBL.MENU.AIRPORT_MASTER', icon: 'pi pi-map', routerLink: '/master-data/location/airport' }
                ]
            },
            {
                label: 'LBL.MENU.CARRIER_MASTER',
                icon: 'pi pi-briefcase',
                items: [
                    { label: 'LBL.MENU.OCEAN_CARRIER_MASTER', icon: 'pi pi-briefcase', routerLink: '/master-data/carrier/ocean' },
                    { label: 'LBL.MENU.AIR_CARRIER_MASTER', icon: 'pi pi-briefcase', routerLink: '/master-data/carrier/air' }
                ]
            },
            {
                label: 'LBL.MENU.EQUIVALENCY_MANAGEMENT',
                icon: 'pi pi-exchange',
                items: [
                    { label: 'LBL.MENU.OCEAN_PORT_EQUIVALENCY', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/ocean-port' },
                    { label: 'LBL.MENU.FLIGHT_EQUIVALENCY', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/flight' },
                    { label: 'LBL.MENU.AIR_CARRIER_EQUIVALENCY', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/air-carrier' },
                    { label: 'LBL.MENU.OCEAN_CARRIER_EQUIVALENCY', icon: 'pi pi-exchange', routerLink: '/master-data/equivalency/ocean-carrier' }
                ]
            },
            { label: 'LBL.MENU.COUNTRY_REGION_MASTER', icon: 'pi pi-globe', routerLink: '/master-data/country-region' },
            { label: 'LBL.MENU.VESSEL_MANAGEMENT', icon: 'pi pi-ship', routerLink: '/master-data/vessel' },
            { label: 'LBL.MENU.SCHEDULE_MANAGER', icon: 'pi pi-calendar', routerLink: '/master-data/schedule' },
            { label: 'LBL.MENU.EMAIL_TEMPLATE_MANAGER', icon: 'pi pi-envelope', routerLink: '/master-data/email-template' },
            { label: 'LBL.MENU.RELEASE_MANAGER', icon: 'pi pi-paperclip', routerLink: '/master-data/release' },
            { label: 'LBL.MENU.EULA_MANAGER', icon: 'pi pi-file', routerLink: '/master-data/eula' },
            { label: 'LBL.MENU.AUDIT_LOGS', icon: 'pi pi-clock', routerLink: '/master-data/audit-logs' }
        ]
    }
];
