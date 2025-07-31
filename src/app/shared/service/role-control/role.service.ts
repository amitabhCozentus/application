import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { RoleConfigData } from '../../lib/constants';

export interface Role {
  id: number;
  status: 'Active' | 'Inactive';
  roleName: string;
  roleDescription: string;
  rolePrivileges: string[];
  customLanding: string;
  defaultLanding?: string;
  skin: string;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  /** static in-memory dataset */
  private allRoles: RoleConfigData[] = [
    {
        id: 1,
        roleName: 'PSA BDP IT Admin',
        status: 'Active',
        roleDescription: 'Having all the accesses',
        rolePrivileges: [
            "List view",
            "Port master data management",
            "Data Management",
            "Tracking list",
            "No KPIs",
            "No Map",
            "Shipment details",
            "Scheduling",
            "Routing",
            "3PL Analytics"
        ],
        customLanding: 'No',
        defaultLanding: '',
        skin: 'PSA BDP Light',
        createdBy: 'admin@psabdp.com',
        createdOn: '2025-06-01 10:15:00',
        updatedBy: 'admin@psabdp.com',
        updatedOn: '2025-06-05 14:30:00',
        roleType: 'PSA BDP'
    },
    {
        id: 2,
        roleName: 'PSA BDP User',
        status: 'Inactive',
        roleDescription: 'Privileges for operation user',
        rolePrivileges: ['Tracking list', 'No KPIs', 'No Map', 'Shipment details'],
        customLanding: 'Yes',
        defaultLanding: 'Tracking',
        skin: 'PSA BDP Dark',
        createdBy: 'ops@psabdp.com',
        createdOn: '2025-05-20 09:00:00',
        updatedBy: 'ops@psabdp.com',
        updatedOn: '2025-06-02 11:45:00',
        roleType: 'PSA BDP'
    },
    {
        id: 3,
        roleName: 'Innovation Product Team',
        status: 'Inactive',
        roleDescription: 'All access except role and user management',
        rolePrivileges: ['Tracking list', 'Data Management', '3PL Analytics'],
        customLanding: 'No',
        defaultLanding: '',
        skin: 'BNS Light',
        createdBy: 'prodteam@psabdp.com',
        createdOn: '2025-04-10 08:30:00',
        updatedBy: 'prodteam@psabdp.com',
        updatedOn: '2025-06-04 16:00:00',
        roleType: 'PSA BDP'
    },
    {
        id: 4,
        roleName: 'BNS Customer User',
        status: 'Active',
        roleDescription: 'Non PSA BDP Users',
        rolePrivileges: [
            'List view',
            'Port master data management',
            'Data Management'
        ],
        customLanding: 'Yes',
        defaultLanding: 'Dashboard',
        skin: 'BNS Dark',
        createdBy: 'custadmin@psabdp.com',
        createdOn: '2025-06-03 12:20:00',
        updatedBy: 'custadmin@psabdp.com',
        updatedOn: '2025-06-06 09:10:00',
        roleType: 'BNS'
    },
     {
         id: 5,
         roleName: 'PSA BDP User',
         status: 'Inactive',
         roleDescription: 'Privileges for operation user',
         rolePrivileges: ['Tracking list', 'No KPIs', 'No Map', 'Shipment details'],
         customLanding: 'Yes',
         defaultLanding: 'Tracking',
         skin: 'PSA BDP Dark',
         createdBy: 'ops@psabdp.com',
         createdOn: '2025-05-20 09:00:00',
         updatedBy: 'ops@psabdp.com',
         updatedOn: '2025-06-02 11:45:00',
         roleType: 'BNS'
     },
    {
        id: 6,
        roleName: 'Innovation Product Team',
        status: 'Inactive',
        roleDescription: 'All access except role and user management',
        rolePrivileges: ['Tracking list', 'Data Management', '3PL Analytics'],
        customLanding: 'No',
        defaultLanding: '',
        skin: 'BNS Light',
        createdBy: 'prodteam@psabdp.com',
        createdOn: '2025-04-10 08:30:00',
        updatedBy: 'prodteam@psabdp.com',
        updatedOn: '2025-06-04 16:00:00',
        roleType: 'PSA BDP'
    },
    {
        id: 7,
        roleName: 'BNS Customer User',
        status: 'Active',
        roleDescription: 'Non PSA BDP Users',
        rolePrivileges: [
            'List view',
            'Port master data management',
            'Data Management'
        ],
        customLanding: 'Yes',
        defaultLanding: 'Dashboard',
        skin: 'BNS Dark',
        createdBy: 'custadmin@psabdp.com',
        createdOn: '2025-06-03 12:20:00',
        updatedBy: 'custadmin@psabdp.com',
        updatedOn: '2025-06-06 09:10:00',
        roleType: 'PSA BDP'
    },
     {
         id: 8,
         roleName: 'PSA BDP User',
         status: 'Inactive',
         roleDescription: 'Privileges for operation user',
         rolePrivileges: ['Tracking list', 'No KPIs', 'No Map', 'Shipment details'],
         customLanding: 'Yes',
         defaultLanding: 'Tracking',
         skin: 'PSA BDP Dark',
         createdBy: 'ops@psabdp.com',
         createdOn: '2025-05-20 09:00:00',
         updatedBy: 'ops@psabdp.com',
         updatedOn: '2025-06-02 11:45:00',
         roleType: 'PSA BDP'
     },
    {
        id: 9,
        roleName: 'Innovation Product Team',
        status: 'Inactive',
        roleDescription: 'All access except role and user management',
        rolePrivileges: ['Tracking list', 'Data Management', '3PL Analytics'],
        customLanding: 'No',
        defaultLanding: '',
        skin: 'BNS Light',
        createdBy: 'prodteam@psabdp.com',
        createdOn: '2025-04-10 08:30:00',
        updatedBy: 'prodteam@psabdp.com',
        updatedOn: '2025-06-04 16:00:00',
        roleType: 'PSA BDP'
    },
    {
        id: 10,
        roleName: 'BNS Customer User',
        status: 'Active',
        roleDescription: 'Non PSA BDP Users',
        rolePrivileges: [
            'List view',
            'Port master data management',
            'Data Management'
        ],
        customLanding: 'Yes',
        defaultLanding: 'Dashboard',
        skin: 'BNS Dark',
        createdBy: 'custadmin@psabdp.com',
        createdOn: '2025-06-03 12:20:00',
        updatedBy: 'custadmin@psabdp.com',
        updatedOn: '2025-06-06 09:10:00',
        roleType: 'PSA BDP'
    },
     {
         id: 11,
         roleName: 'PSA BDP User',
         status: 'Inactive',
         roleDescription: 'Privileges for operation user',
         rolePrivileges: ['Tracking list', 'No KPIs', 'No Map', 'Shipment details'],
         customLanding: 'Yes',
         defaultLanding: 'Tracking',
         skin: 'PSA BDP Dark',
         createdBy: 'ops@psabdp.com',
         createdOn: '2025-05-20 09:00:00',
         updatedBy: 'ops@psabdp.com',
         updatedOn: '2025-06-02 11:45:00',
         roleType: 'PSA BDP'
     },
    {
        id: 12,
        roleName: 'Innovation Product Team',
        status: 'Inactive',
        roleDescription: 'All access except role and user management',
        rolePrivileges: ['Tracking list', 'Data Management', '3PL Analytics'],
        customLanding: 'No',
        defaultLanding: '',
        skin: 'BNS Light',
        createdBy: 'prodteam@psabdp.com',
        createdOn: '2025-04-10 08:30:00',
        updatedBy: 'prodteam@psabdp.com',
        updatedOn: '2025-06-04 16:00:00',
        roleType: 'PSA BDP'
    },
    {
        id: 13,
        roleName: 'BNS Customer User',
        status: 'Active',
        roleDescription: 'Non PSA BDP Users',
        rolePrivileges: [
            'List view',
            'Port master data management',
            'Data Management'
        ],
        customLanding: 'Yes',
        defaultLanding: 'Dashboard',
        skin: 'BNS Dark',
        createdBy: 'custadmin@psabdp.com',
        createdOn: '2025-06-03 12:20:00',
        updatedBy: 'custadmin@psabdp.com',
        updatedOn: '2025-06-06 09:10:00',
        roleType: 'PSA BDP'
    },
  ];

  /**
   * Returns paged + filtered roles.
   * @param page zero-based page index
   * @param size number of items per page
   * @param search global filter on roleName or roleDescription
   */
  getActiveRoles(page: number, size: number, search = ''): Observable<PagedResult<RoleConfigData>> {
    return of(this.allRoles).pipe(
      delay(100),                        // simulate latency
      map(all => {
        // apply search if 3+ chars
        if (search.length >= 3) {
          const term = search.toLowerCase();
          all = all.filter(r =>
            r.roleName.toLowerCase().includes(term) ||
            r.roleDescription.toLowerCase().includes(term)
          );
        }
        const total = all.length;
        const start = page * size;
        const data = all;
        return { data, total };
      })
    );
  }

  /** Fetch unique skin and default landing options */
  getConfigOptions(): Observable<{ skins: string[]; defaultLandings: string[] }> {
    const skins = Array.from(new Set(this.allRoles.map(r => r.skin))).filter((s): s is string => s !== null && s !== undefined);
    const defaultLandings = Array.from(
      new Set(
        this.allRoles
          .map(r => r.defaultLanding)
          .filter(l => l !== undefined && l !== null && l !== '') as string[]
      )
    );
    return of({ skins, defaultLandings }).pipe(delay(300));
  }

  /** Fetch unique privilege options */
  getPrivilegeOptions(): Observable<string[]> {
    const privs = Array.from(
      new Set(this.allRoles.flatMap(r => r.rolePrivileges))
    );
    return of(privs).pipe(delay(300));
  }
}
